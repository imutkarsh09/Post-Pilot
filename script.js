// GenAI Posts Viewer JavaScript

class PostsViewer {
    constructor() {
        this.posts = [];
        this.currentPostIndex = 0;
        this.availableSources = [];
        this.currentSource = '';
        this.init();
    }

    async init() {
        this.showLoadingSpinner();
        this.setupEventListeners();
        await this.discoverSources();
        this.hideLoadingSpinner();
    }

    async discoverSources() {
        this.availableSources = [];
        
        // Try to get the list of files from a manifest file first (if you create one)
        try {
            const manifestResponse = await fetch('./Posts Data/manifest.json');
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                await this.loadSourcesFromManifest(manifest);
                this.updateSourceDropdown();
                return;
            }
        } catch (error) {
            // Manifest doesn't exist, continue with dynamic discovery
        }
        
        // Dynamic discovery: Try to infer sources from common patterns
        // This approach tries various combinations that might exist
        await this.dynamicSourceDiscovery();
        
        this.updateSourceDropdown();
        
        // If no sources found, show helpful message
        if (this.availableSources.length === 0) {
            this.showError(`
                No data sources found. To add sources:
                1. Place files in Posts Data/ folder following pattern: Generated_Posts_[Source Name].json
                2. Or create a manifest.json file listing all available sources
                3. Click refresh button to re-scan
            `);
        }
    }

    async loadSourcesFromManifest(manifest) {
        // Load sources from manifest file
        for (const source of manifest.sources || []) {
            try {
                const response = await fetch(`./Posts Data/${source.filename}`, { method: 'HEAD' });
                if (response.ok) {
                    this.availableSources.push({
                        filename: source.filename,
                        displayName: source.displayName || source.filename.replace(/^Generated_Posts_|\.json$/g, ''),
                        value: source.value || source.filename.replace(/^Generated_Posts_|\.json$/g, '')
                    });
                }
            } catch (error) {
                console.warn(`Source ${source.filename} listed in manifest but not accessible`);
            }
        }
    }

    async dynamicSourceDiscovery() {
        // Since we can't list directory contents, we'll use a smart approach:
        // 1. Try common news source patterns
        // 2. Try different variations and word combinations
        // 3. Use error patterns to infer what might exist
        
        const commonPatterns = [
            // Your existing files
            'Hindubusiness', 'Times Now',
            
            // Common news sources (spaces and variations)
            'Economic Times', 'Business Standard', 'Hindu Business Line',
            'Times of India', 'Indian Express', 'Mint', 'LiveMint',
            'NDTV', 'CNN-News18', 'Republic TV', 'News18',
            
            // International sources
            'Reuters', 'Bloomberg', 'CNN', 'BBC', 'TechCrunch',
            'Wall Street Journal', 'Financial Times', 'Guardian',
            
            // Tech sources
            'TechCrunch', 'Ars Technica', 'The Verge', 'Wired',
            
            // Business sources
            'Forbes', 'Fortune', 'Business Insider', 'MarketWatch'
        ];

        // Try each pattern
        for (const source of commonPatterns) {
            await this.trySource(source);
        }
        
        // Try some variations with different formatting
        const baseNames = ['hindu', 'times', 'economic', 'business', 'tech', 'news', 'india'];
        const suffixes = ['business', 'line', 'now', 'today', 'express', 'standard'];
        
        for (const base of baseNames) {
            for (const suffix of suffixes) {
                await this.trySource(`${base} ${suffix}`);
                await this.trySource(`${base}${suffix}`);
                await this.trySource(`${base}_${suffix}`);
            }
        }
        
        // Try legacy format
        await this.tryLegacyFile('hindubusiness_v2.json', 'Hindu Business Line (Legacy)');
    }

    async trySource(sourceName) {
        try {
            const filename = `Generated_Posts_${sourceName}.json`;
            const response = await fetch(`./Posts Data/${filename}`, { method: 'HEAD' });
            if (response.ok) {
                // Avoid duplicates
                if (!this.availableSources.find(s => s.value === sourceName)) {
                    this.availableSources.push({
                        filename: filename,
                        displayName: sourceName,
                        value: sourceName
                    });
                }
            }
        } catch (error) {
            // Source doesn't exist, continue
        }
    }

    async tryLegacyFile(filename, displayName) {
        try {
            const response = await fetch(`./Posts Data/${filename}`, { method: 'HEAD' });
            if (response.ok) {
                this.availableSources.push({
                    filename: filename,
                    displayName: displayName,
                    value: filename.replace('.json', '')
                });
            }
        } catch (error) {
            // File doesn't exist
        }
    }



    updateSourceDropdown() {
        const sourceSelect = document.getElementById('sourceSelect');
        sourceSelect.innerHTML = '<option value="">Select a source...</option>';
        
        this.availableSources.forEach(source => {
            const option = document.createElement('option');
            option.value = source.value;
            option.textContent = source.displayName;
            sourceSelect.appendChild(option);
        });
    }

    async onSourceChange(selectedSource) {
        if (!selectedSource) {
            this.clearPosts();
            return;
        }
        
        this.currentSource = selectedSource;
        this.showLoadingSpinner();
        
        try {
            await this.loadPostsFromSource(selectedSource);
        } catch (error) {
            console.error('Error loading source:', error);
            this.showError(`Failed to load posts from ${selectedSource}: ${error.message}`);
        } finally {
            this.hideLoadingSpinner();
        }
    }

    async loadPostsFromSource(source) {
        // Try different filename patterns based on your actual files
        const possibleFilenames = [
            `Generated_Posts_${source}.json`,  // Primary pattern: Generated_Posts_[Source Name].json
            `${source}.json`,                   // Fallback: [Source Name].json
            `hindubusiness_v2.json`             // Legacy file
        ];
        
        for (const filename of possibleFilenames) {
            try {
                const response = await fetch(`./Posts Data/${filename}`);
                
                if (!response.ok) {
                    continue; // Try next filename pattern
                }
                
                const postsData = await response.json();
                this.posts = postsData;
                this.currentPostIndex = 0;
                
                if (this.posts.length > 0) {
                    this.displayCurrentPost();
                    return; // Successfully loaded
                } else {
                    this.showError('No posts found in the selected source.');
                    return;
                }
                
            } catch (error) {
                continue; // Try next filename pattern
            }
        }
        
        throw new Error(`Could not load data from any expected filename patterns for source: ${source}`);
    }

    async refreshSources() {
        const refreshBtn = document.getElementById('refreshSources');
        const icon = refreshBtn.querySelector('i');
        
        // Add spinning animation
        icon.style.animation = 'spin 1s linear infinite';
        
        this.showLoadingSpinner();
        await this.discoverSources();
        this.hideLoadingSpinner();
        
        // Remove spinning animation
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    }

    clearPosts() {
        this.posts = [];
        this.currentPostIndex = 0;
        this.updatePostCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();
        
        // Clear display areas
        document.getElementById('originalTitle').textContent = 'Select a source to view posts';
        document.getElementById('originalBrief').textContent = '';
        document.getElementById('generatedTitle').textContent = '';
        document.getElementById('generatedBody').textContent = '';
        document.getElementById('newsSource').textContent = '-';
        document.getElementById('postTone').textContent = '-';
        document.getElementById('postLength').textContent = '-';
        document.getElementById('postTags').innerHTML = '';
        document.getElementById('suggestedCommunities').innerHTML = '';
        document.getElementById('commentsContainer').innerHTML = '';
        document.getElementById('commentsCount').textContent = '0';
    }

    loadFallbackData() {
        console.warn('Loading fallback sample data due to file loading error');
        // Minimal fallback data
        this.posts = [
            {
                "post": {
                    "title": "Sample Post - File Loading Failed",
                    "body": "This is a sample post displayed because the JSON file could not be loaded. Please check if the file 'Posts Data/hindubusiness_v2.json' exists and is accessible.",
                    "tags": ["error", "fallback"],
                    "suggested_communities": ["Technical Support"],
                    "safety_flags": []
                },
                "comments": [],
                "meta": {
                    "tone": "informational",
                    "length_estimate": "approx 50 words",
                    "refusal_reason": ""
                },
                "original_news": {
                    "title": "File Loading Error",
                    "brief": "Unable to load the posts data file. Please check file accessibility."
                },
                "processed_data": {
                    "source": "System",
                    "suggested_community_name": "Error"
                }
            }
        ];
        
        if (this.posts.length > 0) {
            this.displayCurrentPost();
        }
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const sourceSelect = document.getElementById('sourceSelect');
        const refreshBtn = document.getElementById('refreshSources');

        prevBtn.addEventListener('click', () => this.previousPost());
        nextBtn.addEventListener('click', () => this.nextPost());
        sourceSelect.addEventListener('change', (e) => this.onSourceChange(e.target.value));
        refreshBtn.addEventListener('click', () => this.refreshSources());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousPost();
            if (e.key === 'ArrowRight') this.nextPost();
        });
    }

    displayCurrentPost() {
        if (this.posts.length === 0) return;

        const currentPost = this.posts[this.currentPostIndex];
        this.updatePostCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();

        // Display original news
        this.displayOriginalNews(currentPost.original_news, currentPost.processed_data);

        // Display generated post
        this.displayGeneratedPost(currentPost.post, currentPost.meta, currentPost.processed_data);

        // Display comments
        this.displayComments(currentPost.comments);

        // Add fade-in animation
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('fade-in');
        });
    }

    displayOriginalNews(originalNews, processedData) {
        document.getElementById('originalTitle').textContent = originalNews.title;
        document.getElementById('originalBrief').textContent = originalNews.brief;
        document.getElementById('newsSource').textContent = processedData.source || 'Unknown';
    }

    displayGeneratedPost(post, meta, processedData) {
        document.getElementById('generatedTitle').textContent = post.title;
        document.getElementById('generatedBody').textContent = post.body;
        document.getElementById('postTone').textContent = meta.tone;
        document.getElementById('postLength').textContent = meta.length_estimate;

        // Display tags
        const tagsContainer = document.getElementById('postTags');
        tagsContainer.innerHTML = '';
        post.tags.forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = tag;
            tagsContainer.appendChild(badge);
        });

        // Display suggested communities - only show the one from processed_data
        const communitiesContainer = document.getElementById('suggestedCommunities');
        communitiesContainer.innerHTML = '';
        
        // Only show processed_data.suggested_community_name if available
        if (processedData && processedData.suggested_community_name) {
            const badge = document.createElement('span');
            badge.className = 'badge primary-community';
            badge.textContent = processedData.suggested_community_name;
            communitiesContainer.appendChild(badge);
        } else {
            // Fallback: show a message if no processed community is available
            const noCommunitybadge = document.createElement('span');
            noCommunitybadge.className = 'badge secondary-community';
            noCommunitybadge.textContent = 'No community suggested';
            communitiesContainer.appendChild(noCommunitybadge);
        }
    }

    displayComments(comments) {
        const commentsContainer = document.getElementById('commentsContainer');
        const commentsCount = document.getElementById('commentsCount');
        
        // Calculate total comments including replies
        let totalComments = comments.length;
        comments.forEach(comment => {
            totalComments += comment.replies ? comment.replies.length : 0;
        });
        
        commentsCount.textContent = totalComments;
        commentsContainer.innerHTML = '';

        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
    }

    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = `comment ${comment.is_op ? 'op-comment' : ''}`;

        commentDiv.innerHTML = `
            <div class="comment-header mb-2">
                <div class="comment-author">
                    <i class="fas fa-user-circle me-2"></i>
                    ${comment.author_label}${comment.is_op ? ' <span class="op-badge">OP</span>' : ''}
                </div>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;

        // Add replies if they exist
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                const replyElement = this.createCommentElement(reply);
                replyElement.classList.add('reply');
                commentDiv.appendChild(replyElement);
            });
        }

        return commentDiv;
    }

    updatePostCounter() {
        document.getElementById('currentPost').textContent = this.currentPostIndex + 1;
        document.getElementById('totalPosts').textContent = this.posts.length;
    }

    updateProgressBar() {
        const progress = ((this.currentPostIndex + 1) / this.posts.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentPostIndex === 0;
        nextBtn.disabled = this.currentPostIndex === this.posts.length - 1;
    }

    previousPost() {
        if (this.currentPostIndex > 0) {
            this.currentPostIndex--;
            this.displayCurrentPost();
        }
    }

    nextPost() {
        if (this.currentPostIndex < this.posts.length - 1) {
            this.currentPostIndex++;
            this.displayCurrentPost();
        }
    }

    hideLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        spinner.classList.add('d-none');
    }

    showLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        spinner.classList.remove('d-none');
    }

    showError(message) {
        // Create error message element if it doesn't exist
        let errorElement = document.getElementById('errorMessage');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'errorMessage';
            errorElement.className = 'alert alert-danger mx-3 mt-3';
            errorElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <span id="errorText"></span>
                </div>
            `;
            document.querySelector('.container-fluid').insertBefore(errorElement, document.querySelector('main'));
        }
        
        document.getElementById('errorText').textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 10000);
    }

    // Method to load posts from external source
    async loadPosts(postsData) {
        this.showLoadingSpinner();
        
        try {
            if (!postsData || !Array.isArray(postsData)) {
                throw new Error('Invalid posts data format');
            }
            
            this.posts = postsData;
            this.currentPostIndex = 0;
            
            if (this.posts.length > 0) {
                this.displayCurrentPost();
            } else {
                this.showError('No posts found in the provided data.');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError(`Error loading posts: ${error.message}`);
        } finally {
            this.hideLoadingSpinner();
        }
    }

    // Method to add a single post
    addPost(postData) {
        this.posts.push(postData);
        this.updatePostCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    // Method to get current post
    getCurrentPost() {
        return this.posts[this.currentPostIndex];
    }

    // Method to jump to specific post
    jumpToPost(index) {
        if (index >= 0 && index < this.posts.length) {
            this.currentPostIndex = index;
            this.displayCurrentPost();
        }
    }
}

// Initialize the posts viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postsViewer = new PostsViewer();
});

// Utility function to format text with line breaks
function formatText(text) {
    return text.replace(/\n/g, '<br>');
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostsViewer;
} 