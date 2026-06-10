// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const tracksContainer = document.getElementById('tracks-container');
const resultsTitle = document.getElementById('results-title');

// Player Elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playerArt = document.getElementById('player-art');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgress = document.getElementById('volume-progress');

// --- State ---
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;

// --- Initialize ---
function init() {
    // Default search
    searchiTunes('Top Hits');
    
    // Set initial volume
    updateVolume();
}

// --- API Search ---
async function searchiTunes(query) {
    if (!query.trim()) return;
    
    tracksContainer.innerHTML = '<div class="loading-state">Loading tracks...</div>';
    resultsTitle.innerText = `Search results for "${query}"`;

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=50`);
        const data = await response.json();
        
        currentQueue = data.results.filter(track => track.previewUrl); // Ensure it has a preview
        renderTracks(currentQueue);
    } catch (error) {
        console.error('Error fetching from iTunes:', error);
        tracksContainer.innerHTML = '<div class="loading-state">Error loading tracks. Please try again.</div>';
    }
}

// --- Render Tracks ---
function renderTracks(tracks) {
    tracksContainer.innerHTML = '';
    
    if (tracks.length === 0) {
        tracksContainer.innerHTML = '<div class="loading-state">No tracks found.</div>';
        return;
    }

    tracks.forEach((track, index) => {
        const trackEl = document.createElement('div');
        trackEl.className = 'track-item';
        trackEl.dataset.index = index;
        
        // High-res image hack for iTunes API
        const imgUrl = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '300x300bb') : '';
        const duration = formatTime(track.trackTimeMillis / 1000);

        trackEl.innerHTML = `
            <div class="track-index">${index + 1}</div>
            <div class="track-info-col">
                <img src="${imgUrl}" alt="Album Art">
                <div class="track-details">
                    <div class="track-name">${track.trackName}</div>
                    <div class="track-artist">${track.artistName}</div>
                </div>
            </div>
            <div class="track-album">${track.collectionName || 'Single'}</div>
            <div class="track-duration">${duration}</div>
        `;

        trackEl.addEventListener('click', () => {
            currentIndex = index;
            loadTrack(currentIndex);
            playTrack();
        });

        tracksContainer.appendChild(trackEl);
    });
}

// --- Player Logic ---
function loadTrack(index) {
    const track = currentQueue[index];
    if (!track) return;

    // High-res image
    const imgUrl = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : '';

    audio.src = track.previewUrl;
    playerArt.src = imgUrl;
    playerArt.classList.remove('hidden');
    playerTitle.innerText = track.trackName;
    playerArtist.innerText = track.artistName;

    // Highlight active track in list
    document.querySelectorAll('.track-item').forEach(el => el.classList.remove('playing'));
    const activeTrack = document.querySelector(`.track-item[data-index="${index}"]`);
    if (activeTrack) {
        activeTrack.classList.add('playing');
    }
}

function playTrack() {
    if (currentIndex === -1) return; // No track loaded
    isPlaying = true;
    playIcon.classList.replace('ph-play', 'ph-pause');
    audio.play();
}

function pauseTrack() {
    isPlaying = false;
    playIcon.classList.replace('ph-pause', 'ph-play');
    audio.pause();
}

function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function nextTrack() {
    if (currentQueue.length === 0) return;
    currentIndex++;
    if (currentIndex >= currentQueue.length) {
        currentIndex = 0; // Loop back to start
    }
    loadTrack(currentIndex);
    if (isPlaying) playTrack();
}

function prevTrack() {
    if (currentQueue.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = currentQueue.length - 1;
    }
    loadTrack(currentIndex);
    if (isPlaying) playTrack();
}

// --- Progress & Time ---
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    // iTunes previews are 30s max, but we'll use actual duration if available
    const dur = isNaN(duration) ? 30 : duration; 
    
    const progressPercent = (currentTime / dur) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressThumb.style.left = `${progressPercent}%`;

    currentTimeEl.innerText = formatTime(currentTime);
    if (!isNaN(duration)) {
        durationEl.innerText = formatTime(duration);
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    if (!isNaN(duration)) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- Volume ---
function updateVolume() {
    audio.volume = volumeSlider.value;
    const value = volumeSlider.value * 100;
    volumeProgress.style.width = `${value}%`;
}

// --- Event Listeners ---
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchiTunes(searchInput.value);
    }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', updateVolume);

// Handle spacebar play/pause
document.body.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target !== searchInput) {
        e.preventDefault();
        togglePlay();
    }
});

// Run Init
init();
