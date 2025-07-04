const DISCORD_USER_ID = "785042666475225109";
const API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

async function updateDiscordStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch status");

        const { data } = await response.json();
        const {
            discord_user: user,
            discord_status: status,
            activities,
            active_on_discord_desktop,
            active_on_discord_mobile,
            active_on_discord_web,
        } = data;
        const customStatus = activities?.find((a) => a.type === 4);
        const activity = activities?.find((a) => a.type === 0);

        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=256`;
        document.getElementById("user-avatar").src = avatarUrl;
        document.getElementById("status-avatar").src = avatarUrl;

        const displayName = user.global_name || user.username;
        document.getElementById("display-name").textContent =
            displayName;
        document.getElementById("username").textContent =
            `@${user.username}`;

        const guildTagElement =
            document.getElementById("guild-tag");
        if (user.primary_guild) {
            const { tag, badge } = user.primary_guild;
            guildTagElement.textContent = tag;
            guildTagElement.style.display = "flex";
            guildTagElement.style.backgroundImage = badge
                ? `url(https://cdn.discordapp.com/guild-tag-badges/${user.primary_guild.identity_guild_id}/${badge}.png?size=80)`
                : "none";
        } else {
            guildTagElement.style.display = "none";
        }

        const statusText =
            customStatus?.state ||
            `${status.charAt(0).toUpperCase() + status.slice(1)}`;
        document.querySelector(".status-text").textContent =
            statusText;

        const statusDot = document.getElementById("status-dot");
        const statusTextElement =
            document.getElementById("status-text");
        const lastSeen = document.getElementById("last-seen");

        statusDot.className = "status-dot";
        statusDot.classList.add(status || "offline");

        const statusMap = {
            online: "Online",
            idle: "Idle",
            dnd: "Do Not Disturb",
            offline: "Offline",
        };

        statusTextElement.textContent =
            statusMap[status] || "Offline";

        const updateSessionIcon = (type, isActive) => {
            const icon = document.querySelector(
                `.session-icon[title="${type}"] img`,
            );
            if (!icon) return;

            const statusType = isActive ? status : "offline";
            icon.src = `assets/${type.toLowerCase()}${statusType}.png`;

            icon.parentElement.classList.toggle("active", isActive);
        };

        updateSessionIcon("Desktop", active_on_discord_desktop);
        updateSessionIcon("Mobile", active_on_discord_mobile);
        updateSessionIcon("Web", active_on_discord_web);

        if (status === "offline") {
            lastSeen.textContent = "Last seen recently";
        } else {
            lastSeen.textContent = "";
        }

        const accountAge = document.getElementById("account-age");
        if (user.id) {
            const timestamp =
                Math.floor(parseInt(user.id) / 4194304) +
                1420070400000;
            const date = new Date(timestamp);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            accountAge.textContent = `Member since ${date.toLocaleDateString('en-US', options)}`;
        }
    } catch (error) {
        console.error("Error updating Discord status:", error);
        document.querySelector(".status-text").textContent =
            "Error loading status";
    }
}

updateDiscordStatus();
setInterval(updateDiscordStatus, 30000);

const button = document.querySelector(".trigger-button");
const cardContainer = document.querySelector(".card-container");
const card = document.querySelector(".card");
const audio = document.getElementById("backgroundMusic");
const progressBar = document.querySelector(".progress-bar");
const volumeSlider = document.querySelector(".volume-slider");
const timeDisplay = document.querySelector(".time-display");

audio.volume = 0.1;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.querySelector('.progress').style.width = `${progress}%`;
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});

volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value / 100;
});

let isDragging = false;

const setProgress = (e) => {
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
    progressBar.querySelector('.progress').style.width = `${percentage * 100}%`;
};

progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    setProgress(e);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        setProgress(e);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

progressBar.addEventListener("click", (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
});

button.addEventListener("click", () => {
    cardContainer.classList.add("visible");
    button.style.opacity = "0";
    button.style.pointerEvents = "none";
    audio
        .play()
        .catch((e) => console.log("Audio playback failed:", e));
});

card.addEventListener("mouseenter", () => {
    card.style.transform = "scale(1.05)";
});

card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
});

function formatActivity(activity) {
    if (!activity) return "";

    const container = document.createElement("div");
    container.className = "activity-item";

    const header = document.createElement("div");
    header.className = "activity-header";

    const headerContent = document.createElement("div");
    headerContent.className = "activity-header-content";

    let iconUrl = "";

    if (activity.name === "Spotify" && activity.assets) {
        iconUrl = activity.assets.large_image;
        if (iconUrl?.startsWith("spotify:")) {
            const spotifyId = iconUrl.split(":")[1];
            iconUrl = `https://i.scdn.co/image/${spotifyId}`;
        }
    } else if (
        activity.assets?.large_image?.startsWith("mp:external/")
    ) {
        iconUrl = activity.assets.large_image.replace(
            "mp:external/",
            "https://media.discordapp.net/external/",
        );
    } else if (activity.assets?.large_image) {
        iconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
    }

    headerContent.innerHTML = `
<img src="${iconUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}"
    class="activity-icon"
    alt="${activity.name}"
    onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"
    style="background: #2f3136; padding: 5px; border-radius: 8px; ${activity.name === "Spotify" ? "border-radius: 4px;" : ""}">
<div class="activity-header-text">
<h4 class="activity-name">${activity.name}</h4>
${activity.name === "Spotify" ? `<div class="spotify-artist">${activity.state || ""}</div>` : ""}
</div>
`;

    const details = document.createElement("div");
    details.className = "activity-details";
    if (activity.details)
        details.textContent =
            activity.name === "Spotify"
                ? `♪ ${activity.details}`
                : activity.details;

    const state = document.createElement("p");
    state.className = "activity-state";
    if (activity.state && activity.name !== "Spotify")
        state.textContent = activity.state;

    if (activity.name === "Spotify" && activity.sync_id) {
        const spotifyLink = document.createElement("a");
        spotifyLink.href = `https://open.spotify.com/track/${activity.sync_id}`;
        spotifyLink.target = "_blank";
        spotifyLink.rel = "noopener noreferrer";
        spotifyLink.className = "activity-external-link";
        spotifyLink.title = "Open in Spotify";
        spotifyLink.innerHTML = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 13V19M18 13L15 16M18 13L21 16M6 5V11M6 5L3 8M6 5L9 8M14 5V11M14 5L11 8M14 5L17 8M6 19V16.5M3 19H9M6 16.5C6 15.1193 7.11929 14 8.5 14C9.88071 14 11 15.1193 11 16.5C11 17.8807 9.88071 19 8.5 19M6 16.5C6 17.8807 7.11929 19 8.5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
        header.appendChild(spotifyLink);
    }

    header.prepend(headerContent);
    container.appendChild(header);

    container.appendChild(details);
    if (activity.state && activity.name !== "Spotify")
        container.appendChild(state);

    if (activity.name === "Spotify" && activity.timestamps) {
        const { start, end } = activity.timestamps;
        if (start && end) {
            const progressContainer = document.createElement("div");
            progressContainer.className = "spotify-progress";

            const progressBar = document.createElement("div");
            progressBar.className = "spotify-progress-bar";

            const progress = document.createElement("div");
            progress.className = "spotify-progress-fill";

            const timeInfo = document.createElement("div");
            timeInfo.className = "spotify-time";

            const now = Date.now();
            const duration = end - start;
            const elapsed = now - start;
            const progressPercent = Math.min(
                100,
                Math.max(0, (elapsed / duration) * 100),
            );

            progress.style.width = `${progressPercent}%`;

            const formatTime = (ms) => {
                const seconds = Math.floor(ms / 1000) % 60;
                const minutes = Math.floor(ms / (1000 * 60)) % 60;
                return `${minutes}:${seconds.toString().padStart(2, "0")}`;
            };

            timeInfo.innerHTML = `
<span>${formatTime(elapsed)}</span>
<span>${formatTime(duration)}</span>
`;

            progressBar.appendChild(progress);
            progressContainer.appendChild(progressBar);
            progressContainer.appendChild(timeInfo);
            container.appendChild(progressContainer);

            const updateProgress = () => {
                const now = Date.now();
                const elapsed = now - start;
                const progressPercent = Math.min(
                    100,
                    Math.max(0, (elapsed / duration) * 100),
                );
                progress.style.width = `${progressPercent}%`;

                const timeElapsed = container.querySelector(
                    ".spotify-time span:first-child",
                );
                if (timeElapsed) {
                    timeElapsed.textContent = formatTime(elapsed);
                }

                if (elapsed < duration) {
                    requestAnimationFrame(updateProgress);
                }
            };

            updateProgress();
        }
    }

    if (activity.assets) {
        const assetsContainer = document.createElement("div");
        assetsContainer.className = "activity-assets";

        if (
            activity.assets.large_text &&
            activity.name !== "Spotify"
        ) {
            assetsContainer.innerHTML += `
<div class="activity-asset">
    <img src="${iconUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}"
        class="activity-asset-icon"
        onerror="this.style.display='none'">
    <span class="activity-asset-text">${activity.assets.large_text}</span>
</div>
`;
        }

        if (
            activity.assets.small_text &&
            activity.name !== "Spotify"
        ) {
            let smallIconUrl = "";

            if (
                activity.assets.small_image?.startsWith(
                    "mp:external/",
                )
            ) {
                smallIconUrl = activity.assets.small_image.replace(
                    "mp:external/",
                    "https://media.discordapp.net/external/",
                );
            } else if (activity.assets.small_image) {
                smallIconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`;
            }

            assetsContainer.innerHTML += `
<div class="activity-asset">
    <img src="${smallIconUrl || "https://cdn.discordapp.com/embed/avatars/0.png"}"
        class="activity-asset-icon"
        onerror="this.style.display='none'">
    <span class="activity-asset-text">${activity.assets.small_text}</span>
</div>
`;
        }

        if (assetsContainer.children.length > 0) {
            container.appendChild(assetsContainer);
        }
    }

    return container;
}

async function updateActivities() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok)
            throw new Error("Failed to fetch activities");

        const { data } = await response.json();
        const activities = data.activities || [];
        const container = document.getElementById(
            "activities-container",
        );

        container.innerHTML = "";

        const filteredActivities = activities
            .filter((activity) => activity.type !== 4)
            .sort((a, b) => {
                const aIsSpotify = a.name === "Spotify";
                const bIsSpotify = b.name === "Spotify";
                const aIsCoding =
                    a.name === "Code" ||
                    a.name === "Visual Studio Code" ||
                    a.name.includes("Visual Studio");
                const bIsCoding =
                    b.name === "Code" ||
                    b.name === "Visual Studio Code" ||
                    b.name.includes("Visual Studio");

                if (aIsSpotify && !bIsSpotify) return -1;
                if (!aIsSpotify && bIsSpotify) return 1;
                if (!aIsCoding && bIsCoding) return -1;
                if (aIsCoding && !bIsCoding) return 1;

                return (b.created_at || 0) - (a.created_at || 0);
            });

        if (filteredActivities.length === 0) {
            container.innerHTML =
                '<div class="activity-placeholder">No active activities</div>';
            return;
        }

        filteredActivities.forEach((activity) => {
            const activityElement = formatActivity(activity);
            if (activityElement) {
                container.appendChild(activityElement);
            }
        });
    } catch (error) {
        console.error("Error updating activities:", error);
        const container = document.getElementById(
            "activities-container",
        );
        container.innerHTML =
            '<div class="activity-placeholder">Error loading activities</div>';
    }
}

updateActivities();
setInterval(updateActivities, 30000);

setInterval(() => {
    updateDiscordStatus();
    updateActivities();
}, 30000);

document
    .getElementById("refresh-button")
    .addEventListener("click", () => {
        const refreshBtn =
            document.getElementById("refresh-button");
        refreshBtn.style.animation = "spin 1s linear infinite";

        Promise.all([
            updateDiscordStatus(),
            updateActivities(),
        ]).finally(() => {
            setTimeout(() => {
                refreshBtn.style.animation = "";
            }, 500);
        });
    });

const style = document.createElement("style");
style.textContent = `
@keyframes spin {
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

document.addEventListener("keydown", (e) => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const mysteryButton = document.getElementById("mystery-button");
    const audio = new Audio("assets/kek.mp3");
    let currentAudio = null;

    mysteryButton.addEventListener("click", function () {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        audio.currentTime = 0;
        audio.play();
        currentAudio = audio;

        this.style.animation = "shake 0.5s";
        this.addEventListener(
            "animationend",
            function () {
                this.style.animation = "";
            },
            { once: true },
        );
    });
});

async function fetchGitHubRepos() {
    const container = document.getElementById('repos-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="repo-card loading-state">
            <div class="loading-spinner"></div>
            <span>Loading repositories...</span>
        </div>
    `;

    try {
        const response = await fetch('https://api.github.com/users/playfairs/repos?sort=updated&per_page=10');
        const repos = await response.json();
        
        if (!Array.isArray(repos) || repos.message) {
            throw new Error(repos.message || 'Failed to load repositories');
        }
        
        container.innerHTML = repos.map(repo => `
            <a href="${repo.html_url}" 
               target="_blank" 
               class="repo-card" 
               aria-label="Repository: ${repo.name}">
                <div class="repo-header">
                    <h3 class="repo-name">
                        ${repo.name}
                        ${repo.private ? '<span class="repo-badge private">Private</span>' : ''}
                        ${repo.fork ? '<span class="repo-badge fork">Fork</span>' : ''}
                    </h3>
                    ${repo.description ? `
                        <p class="repo-description" title="${repo.description.replace(/"/g, '&quot;')}">
                            ${repo.description.length > 100 ? 
                                repo.description.substring(0, 100) + '...' : 
                                repo.description}
                        </p>
                    ` : '<p class="repo-description no-desc">No description provided</p>'}
                </div>

                <div class="repo-footer">
                    ${repo.language ? `
                        <span class="repo-meta">
                            <span class="language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    
                    <span class="repo-meta" title="${repo.stargazers_count} stars">
                        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                            <path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                        </svg>
                        ${formatNumber(repo.stargazers_count)}
                    </span>

                    <span class="repo-meta" title="${repo.forks_count} forks">
                        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                            <path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-.878a2.25 2.25 0 10-1.5 0zM5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zM3.25 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                        </svg>
                        ${formatNumber(repo.forks_count)}
                    </span>

                    <span class="repo-updated" title="Last updated: ${new Date(repo.updated_at).toLocaleString()}">
                        Updated ${timeAgo(new Date(repo.updated_at))}
                    </span>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        container.innerHTML = `
            <div class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <span>Failed to load repositories. <button onclick="fetchGitHubRepos()" class="retry-btn">Try again</button></span>
            </div>
        `;
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    return 'just now';
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#F05138',
        'Kotlin': '#A97BFF',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'Vue': '#41B883',
        'React': '#61DAFB',
        'Angular': '#DD0031',
        'Svelte': '#FF3E00',
        'Dockerfile': '#384d54',
        'Makefile': '#427819',
        'Objective-C': '#438EFF',
        'Scala': '#DC322F',
        'Haskell': '#5E5086',
        'Lua': '#000080',
        'Perl': '#0298c3',
        'R': '#198CE7'
    };
    
    return colors[language] || '#586069';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubRepos();
});