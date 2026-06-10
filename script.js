// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const tracksContainer = document.getElementById('tracks-container');
const resultsTitle = document.getElementById('results-title');

// Navigation Elements
const navSearch = document.getElementById('nav-search');
const navRadio = document.getElementById('nav-radio');

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
const progressSection = document.getElementById('progress-section');
const liveIndicator = document.getElementById('live-indicator');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgress = document.getElementById('volume-progress');

// --- State ---
let currentQueue = [];
let currentIndex = -1;
let isPlaying = false;
let currentMode = 'search'; // 'search' or 'radio'

// --- Initialize ---
function init() {
    setupNavigation();
    searchiTunes('Top Hits');
    updateVolume();
}

// --- Navigation ---
function setupNavigation() {
    navSearch.addEventListener('click', (e) => {
        e.preventDefault();
        setMode('search');
        searchiTunes(searchInput.value || 'Top Hits');
    });

    navRadio.addEventListener('click', (e) => {
        e.preventDefault();
        setMode('radio');
        fetchRadioStations();
    });
}

function setMode(mode) {
    currentMode = mode;
    if (mode === 'search') {
        navSearch.classList.add('active');
        navRadio.classList.remove('active');
        searchInput.style.display = 'block';
    } else {
        navSearch.classList.remove('active');
        navRadio.classList.add('active');
        searchInput.style.display = 'none'; // Hide search bar for radio view
    }
}

// --- API: iTunes Search ---
async function searchiTunes(query) {
    if (!query.trim()) return;
    
    tracksContainer.innerHTML = '<div class="loading-state">Loading tracks...</div>';
    resultsTitle.innerText = `Search results for "${query}"`;

    try {
        const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=50`;
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
        const data = await response.json();
        
        currentQueue = data.results
            .filter(track => track.previewUrl)
            .map(track => ({
                id: track.trackId,
                title: track.trackName,
                artist: track.artistName,
                album: track.collectionName || 'Single',
                duration: track.trackTimeMillis / 1000,
                streamUrl: track.previewUrl,
                coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : '',
                thumbnailUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '300x300bb') : '',
                isLive: false
            }));
            
        renderQueue();
    } catch (error) {
        console.error('Error fetching from iTunes:', error);
        tracksContainer.innerHTML = `
            <div class="loading-state">
                <i class="ph ph-warning-circle" style="font-size: 48px; color: #ff4757; margin-bottom: 16px;"></i><br>
                <strong>Network Error!</strong><br>
                Unable to connect to the iTunes API. Please check your internet connection or ad-blocker.<br>
                <button class="error-btn" onclick="searchiTunes('${query.replace(/'/g, "\\'")}')">Retry</button>
            </div>
        `;
    }
}

// --- API: Radio Browser ---
async function fetchRadioStations() {
    tracksContainer.innerHTML = '<div class="loading-state">Tuning into global radio stations...</div>';
    resultsTitle.innerText = `Top Live Internet Radio`;

    try {
        // Fetch top 50 highly voted stations
        const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=50&order=clickcount&reverse=true&hidebroken=true&language=english');
        const data = await response.json();
        
        const fallbackImg = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop';
        
        currentQueue = data
            .filter(station => station.url_resolved)
            .map(station => ({
                id: station.stationuuid,
                title: station.name.trim() || 'Unknown Station',
                artist: station.tags ? station.tags.split(',').slice(0,3).join(', ') : 'Live Radio',
                album: station.country || 'Global',
                duration: null,
                streamUrl: station.url_resolved,
                coverUrl: station.favicon || fallbackImg,
                thumbnailUrl: station.favicon || fallbackImg,
                isLive: true
            }));
            
        renderQueue();
    } catch (error) {
        console.error('Error fetching Radio Stations:', error);
        tracksContainer.innerHTML = `
            <div class="loading-state">
                <i class="ph ph-warning-circle" style="font-size: 48px; color: #ff4757; margin-bottom: 16px;"></i><br>
                <strong>Network Error!</strong><br>
                Unable to connect to the Radio API. Please try again.<br>
                <button class="error-btn" onclick="fetchRadioStations()">Retry</button>
            </div>
        `;
    }
}

// --- Render Queue ---
function renderQueue() {
    tracksContainer.innerHTML = '';
    
    if (currentQueue.length === 0) {
        tracksContainer.innerHTML = '<div class="loading-state">No items found.</div>';
        return;
    }

    currentQueue.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'track-item';
        itemEl.dataset.index = index;
        
        const durationStr = item.isLive ? 'LIVE' : formatTime(item.duration);

        // Fallback image handling
        const imgSrc = item.thumbnailUrl;
        
        itemEl.innerHTML = `
            <div class="track-index">${index + 1}</div>
            <div class="track-info-col">
                <img src="${imgSrc}" alt="Art" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100'">
                <div class="track-details">
                    <div class="track-name">${item.title}</div>
                    <div class="track-artist">${item.artist}</div>
                </div>
            </div>
            <div class="track-album">${item.album}</div>
            <div class="track-duration">${durationStr}</div>
        `;

        itemEl.addEventListener('click', () => {
            currentIndex = index;
            loadTrack(currentIndex);
            playTrack();
        });

        tracksContainer.appendChild(itemEl);
    });
}

// --- Player Logic ---
function loadTrack(index) {
    const track = currentQueue[index];
    if (!track) return;

    audio.src = track.streamUrl;
    playerArt.src = track.coverUrl;
    // Set fallback if favicon fails
    playerArt.onerror = () => {
        playerArt.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600';
    };
    
    playerArt.classList.remove('hidden');
    playerTitle.innerText = track.title;
    playerArtist.innerText = track.artist;

    // Toggle UI for Live Radio vs Normal Track
    if (track.isLive) {
        progressSection.classList.add('hidden');
        progressSection.style.display = 'none';
        liveIndicator.classList.remove('hidden');
    } else {
        progressSection.classList.remove('hidden');
        progressSection.style.display = 'flex';
        liveIndicator.classList.add('hidden');
        progressFill.style.width = '0%';
        progressThumb.style.left = '0%';
    }

    // Highlight active track in list
    document.querySelectorAll('.track-item').forEach(el => el.classList.remove('playing'));
    const activeTrack = document.querySelector(`.track-item[data-index="${index}"]`);
    if (activeTrack) {
        activeTrack.classList.add('playing');
    }
}

function playTrack() {
    if (currentIndex === -1) return;
    isPlaying = true;
    playIcon.classList.replace('ph-play', 'ph-pause');
    audio.play().catch(e => {
        console.error("Audio playback error:", e);
        // Fallback for CORS or stream errors on radio
        if (currentQueue[currentIndex]?.isLive) {
            alert("This radio stream is currently offline or blocking playback.");
            pauseTrack();
        } else {
            alert("Audio playback failed. The preview stream might be restricted or your browser is blocking autoplay. Try interacting with the page first.");
            pauseTrack();
        }
    });
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
    const track = currentQueue[currentIndex];
    if (track && track.isLive) return; // Ignore progress for live radio

    const { duration, currentTime } = e.srcElement;
    
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
    const track = currentQueue[currentIndex];
    if (track && track.isLive) return; // Cannot seek live radio

    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    if (!isNaN(duration)) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
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
        if (currentMode === 'search') {
            searchiTunes(searchInput.value);
        }
    }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    // Only auto-next if it's not live radio
    const track = currentQueue[currentIndex];
    if (track && !track.isLive) {
        nextTrack();
    }
});
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
