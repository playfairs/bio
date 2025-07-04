# Simple Biolink with Discord and GitHub Integration

A modern, interactive personal portfolio and status page that displays your Discord presence, GitHub activity, and more in a beautiful, animated interface.

![Preview](assets/banner.jpg)

## Features

- **Discord Integration**
  - Real-time Discord status and activity tracking
  - Shows current activity (playing, streaming, listening, etc.)
  - Displays session information across devices (desktop, mobile, web)
  - Shows your Display Name, Username, Avatar, and Guild Tag

- **GitHub Integration**
  - Showcases your latest repositories
  - Displays repository details like stars, forks, and primary language
  - Direct links to your GitHub profile and repositories

- **Media Player**
  - Background music player with progress bar
  - Volume controls
  - Smooth animations and transitions

- **Customizable**
  - Easy to modify colors, images, and content
  - Add your own sections and features
  - Simple configuration system

## Getting Started

### Prerequisites

- A web server (or GitHub Pages)
- Basic knowledge of HTML, CSS, and JavaScript
- A Discord User ID (for Discord integration)
- A GitHub username (for GitHub integration)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/playfairs/UwU.git
   cd UwU
   ```

2. Set up the configuration:
   ```bash
   cp config.example.js config.js
   ```
   Then edit `config.js` and fill in your details.

3. Customize the following in `index.html`:
   - Update social media links in the `icons` section
   - Modify the color scheme in the CSS
   - Add your own background video and music

4. Deploy to your preferred hosting service or GitHub Pages

## Configuration

### config.js

Create a `config.js` file based on `config.example.js` with your personal information:

```javascript
const config = {
    discord: {
        userId: 'YOUR_DISCORD_USER_ID',
    },
    github: {
        username: 'YOUR_GITHUB_USERNAME'
    },
};
```

### Finding Your Discord User ID
1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
2. Right-click your profile picture and select "Copy ID"

## Customization

### Changing Colors
Edit the CSS variables in `src/index.css` to match your preferred color scheme.

### Updating Social Links
Modify the social media links in the `icons` section of `index.html`.

### Adding Your Own Media
- Replace `assets/your-video.mp4` with your background video
- Replace `assets/oblivion.mp3` with your preferred background music
- Update profile pictures and other assets in the `assets` folder

## Acknowledgments

- [Lanyard API](https://github.com/Phineas/lanyard) for Discord Presence
- [GitHub API](https://docs.github.com/en/rest) for repository data
- All the amazing open-source projects that made this possible

---

Made with ❤️ by [playfairs](https://github.com/playfairs) and my beloved [tech](https://github.com/TechnicDev)
