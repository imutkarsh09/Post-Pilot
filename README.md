# Post Pilot ✈️

A sophisticated web application for viewing and comparing AI-generated posts with their original news sources. Post Pilot provides an elegant interface to navigate through multiple news sources and examine AI-generated content alongside original articles.

![Post Pilot Interface](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)

## ✨ Features

### 🎯 **Dual-View Comparison**
- **Side-by-side layout** comparing original news with AI-generated posts
- **Original News Panel**: Shows source title, brief, and publication info
- **Generated Post Panel**: Displays AI-generated title, body, comments, and metadata

### 🗂️ **Multi-Source Navigation**
- **Dynamic source selection** via elegant dropdown
- **Auto-discovery** of data files following naming conventions
- **Seamless switching** between different news sources
- **Progress tracking** with visual progress bar

### 💬 **Advanced Comments System**
- **Nested comment threading** with visual hierarchy
- **OP (Original Poster) highlighting** with special badges
- **Clean, modern design** without clutter
- **Smooth animations** and hover effects

### 🎨 **Modern UI/UX**
- **Glass morphism design** with backdrop blur effects
- **Gradient color schemes** and smooth animations
- **Fully responsive** - works on desktop, tablet, and mobile
- **Professional typography** and visual hierarchy

### 🔄 **Smart Data Management**
- **Manifest-based discovery** for optimal performance
- **Automatic pattern matching** for new files
- **Error handling** with helpful user messages
- **Refresh functionality** to discover new sources

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for proper CORS handling)

### Installation

1. **Clone or download** the project files
2. **Structure your directory** like this:
```
Post Pilot/
├── index.html
├── styles.css
├── script.js
├── README.md
└── Posts Data/
    ├── manifest.json (optional)
    ├── Generated_Posts_[Source1].json
    ├── Generated_Posts_[Source2].json
    └── ...
```

3. **Start a local server**:
```bash
# Using Python 3
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

4. **Open in browser**: `http://localhost:8080`

## 📁 Data Format

### File Naming Convention
Post Pilot automatically discovers files following this pattern:
```
Posts Data/Generated_Posts_[Source Name].json
```

**Examples:**
- `Generated_Posts_Hindubusiness.json`
- `Generated_Posts_Times Now.json`
- `Generated_Posts_Reuters.json`

### JSON Structure
Each data file should contain an array of post objects:

```json
[
  {
    "post": {
      "title": "Post title here",
      "body": "Post content here",
      "tags": ["tag1", "tag2"],
      "suggested_communities": ["Community 1", "Community 2"]
    },
    "comments": [
      {
        "id": 1,
        "author_label": "User123",
        "is_op": false,
        "text": "Comment text here",
        "upvotes": 42,
        "replies": [
          {
            "id": 2,
            "author_label": "OP",
            "is_op": true,
            "text": "Reply text here",
            "upvotes": 15
          }
        ]
      }
    ],
    "meta": {
      "tone": "curious",
      "length_estimate": "approx 200 words"
    },
    "original_news": {
      "title": "Original news title",
      "brief": "Original news summary"
    },
    "processed_data": {
      "source": "Source Name",
      "suggested_community_name": "Primary Community"
    }
  }
]
```

### Manifest File (Optional)
Create `Posts Data/manifest.json` for better control:

```json
{
  "sources": [
    {
      "filename": "Generated_Posts_Hindubusiness.json",
      "displayName": "Hindu Business Line",
      "value": "Hindubusiness"
    },
    {
      "filename": "Generated_Posts_Times Now.json",
      "displayName": "Times Now",
      "value": "Times Now"
    }
  ],
     "description": "Manifest file for Post Pilot data sources"
}
```

## 🎮 Usage

### Navigation
- **Select Source**: Choose from the dropdown in the header
- **Navigate Posts**: Use Previous/Next buttons or arrow keys
- **Refresh Sources**: Click the refresh button to discover new files
- **Progress Tracking**: Monitor your position with the progress bar

### Viewing Content
- **Left Panel**: Original news title and brief
- **Right Panel**: AI-generated post with comments and metadata
- **Comments**: Nested structure with OP highlighting
- **Tags & Communities**: Color-coded badges for easy identification

### Responsive Design
- **Desktop**: Full side-by-side layout
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single-column layout with touch-friendly controls

## 🛠️ Customization

### Color Scheme
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --success-color: #48bb78;
    --info-color: #4299e1;
    /* ... more variables */
}
```

### Adding New Sources
1. **Method 1**: Add files following the naming pattern - automatic discovery
2. **Method 2**: Update `manifest.json` and add the file
3. **Method 3**: Click refresh button to re-scan

### UI Modifications
- **Header**: Modify the header section in `index.html`
- **Cards**: Customize card styles in the CSS
- **Animations**: Adjust transition timings and effects

## 🏗️ Architecture

### Core Components
- **PostsViewer Class**: Main application logic
- **Dynamic Discovery**: Smart file detection system
- **Responsive Design**: Mobile-first CSS approach
- **Modern JavaScript**: ES6+ features with async/await

### Key Features
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Smooth Animations**: CSS transitions and keyframe animations
- **Error Handling**: Graceful degradation and user feedback
- **Performance**: Efficient loading and navigation

## 🔧 Technical Details

### Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Performance
- **Lazy Loading**: Only loads selected source data
- **Efficient Navigation**: Smooth transitions between posts
- **Memory Management**: Proper cleanup and state management

### Security
- **CORS Compliant**: Works with proper server setup
- **No External Dependencies**: Self-contained application
- **Safe JSON Parsing**: Error handling for malformed data

## 📝 Contributing

### Development Setup
1. Fork the repository
2. Make your changes
3. Test across different browsers
4. Submit a pull request

### Code Style
- **Consistent Naming**: Use camelCase for JavaScript, kebab-case for CSS
- **Comments**: Document complex logic and functions
- **Responsive First**: Consider mobile experience in all changes

## 🐛 Troubleshooting

### Common Issues

**Sources not appearing?**
- Check file naming: `Generated_Posts_[Source Name].json`
- Verify JSON format is valid
- Use a local server (not file:// protocol)
- Click refresh button

**CORS errors?**
- Use a local web server instead of opening HTML directly
- Check browser console for specific error messages

**Styling issues?**
- Clear browser cache
- Check CSS file is loading properly
- Verify Bootstrap CDN is accessible

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Acknowledgments

- **Bootstrap** for responsive framework
- **Font Awesome** for beautiful icons
- **Modern CSS** techniques for glass morphism effects

---

**Post Pilot** - *Navigating the world of AI-generated content* ✈️📰 