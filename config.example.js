/**
 * Configuration file.
 * Copy this file to `config.js` and fill in your details.
 */

const config = {
    discord: {
        userId: 'YOUR_DISCORD_USER_ID',
        
        display: {
            showStatus: true,
            showActivities: true,
            showSessions: true
        }
    },

    github: {
        username: 'YOUR_GITHUB_USERNAME',
        
        repos: {
            maxRepos: 10,
            showForks: false,
            showPrivate: false,
            sortBy: 'updated',
            order: 'desc'
        }
    },

    media: {
        backgroundMusic: 'assets/your-song.mp3',
        autoplay: false,
        defaultVolume: 0.3,
        showControls: true
    },

    ui: {
        theme: 'dark',
        blurIntensity: 10,
        animations: true,
        customCSS: ''
    }
};

try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = config;
    }
} catch (e) {
    if (typeof window !== 'undefined') {
        window.CONFIG = config;
    }
}
