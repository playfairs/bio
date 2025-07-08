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
            let lastTimestamp = 0;
            if (Array.isArray(activities) && activities.length > 0) {
            activities.forEach((activity) => {
                if (activity.timestamps && activity.timestamps.end) {
                lastTimestamp = Math.max(lastTimestamp, activity.timestamps.end);
                } else if (activity.timestamps && activity.timestamps.start) {
                lastTimestamp = Math.max(lastTimestamp, activity.timestamps.start);
                }
            });
            }
            if (!lastTimestamp && user.id) {
            lastTimestamp = Math.floor(parseInt(user.id) / 4194304) + 1420070400000;
            }

            const now = Date.now();
            const diffMs = now - lastTimestamp;
            const diffSec = Math.floor(diffMs / 1000);

            let lastSeenText = "Last seen recently";
            if (diffSec > 60) {
            const minutes = Math.floor(diffSec / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                lastSeenText = `Last seen ${days} day${days > 1 ? "s" : ""} ago`;
            } else if (hours > 0) {
                lastSeenText = `Last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;
            } else {
                lastSeenText = `Last seen ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
            }
            }
            lastSeen.textContent = lastSeenText;
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

// GitHub Repositories Fetch
async function fetchGitHubRepos() {
    const container = document.getElementById('repos-container');
    
    try {
        const response = await fetch('https://api.github.com/users/playfairs/repos?sort=updated&per_page=10');
        const repos = await response.json();
        
        if (!Array.isArray(repos) || repos.message) {
            throw new Error('Failed to load repositories');
        }
        
        container.innerHTML = repos.map(repo => `
            <a href="${repo.html_url}" target="_blank" class="repo-card">
                <div class="repo-name">${repo.name}</div>
                ${repo.description ? `<div class="repo-description" title="${repo.description}">${repo.description}</div>` : 
                    '<div class="repo-description">No description provided</div>'}
                <div class="repo-meta">
                    <span title="Stars">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        ${repo.stargazers_count}
                    </span>
                    <span title="Forks">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 20c0 1.11-.89 2-2 2s-2-.89-2-2 .89-2 2-2 2 .9 2 2m10-2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m-5-13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5m0 1c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/>
                        </svg>
                        ${repo.forks_count}
                    </span>
                    ${repo.language ? `<span>${repo.language}</span>` : ''}
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        container.innerHTML = `
            <div class="error-message">
                Failed to load repositories. <a href="#" onclick="fetchGitHubRepos()">Try again</a>
            </div>`;
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Existing event listeners...
    fetchGitHubRepos();
});