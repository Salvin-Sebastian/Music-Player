const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const coverImg = document.getElementById('cover-img');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const volumeProgress = document.getElementById('volume-progress');
const artWrapper = document.getElementById('art-wrapper');
const playIcon = document.getElementById('play-icon');

// Placeholder Songs Data
const songs = [
    {
        title: "Chill Lofi Vibes",
        artist: "SoundHelix",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverSrc: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92b?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Neon Dreams",
        artist: "Synthwave Pro",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverSrc: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop"
    },
    {
        title: "Acoustic Journey",
        artist: "The Wanderers",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverSrc: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop"
    }
];

let songIndex = 0;
let isPlaying = false;

// Initialize Player
function init() {
    loadSong(songs[songIndex]);
    updateVolumeProgress();
}

// Load Song
function loadSong(song) {
    title.innerText = song.title;
    artist.innerText = song.artist;
    audio.src = song.audioSrc;
    coverImg.src = song.coverSrc;
    
    // When metadata loads, update duration
    audio.addEventListener('loadedmetadata', () => {
        durationEl.innerText = formatTime(audio.duration);
    });
}

// Play Song
function playSong() {
    isPlaying = true;
    playIcon.classList.remove('ph-play');
    playIcon.classList.add('ph-pause');
    artWrapper.classList.add('playing');
    artWrapper.classList.remove('paused');
    audio.play();
}

// Pause Song
function pauseSong() {
    isPlaying = false;
    playIcon.classList.remove('ph-pause');
    playIcon.classList.add('ph-play');
    artWrapper.classList.add('paused');
    audio.pause();
}

// Toggle Play/Pause
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

// Previous Song
function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = songs.length - 1;
    }
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

// Next Song
function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

// Update Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    // Update progress bar width
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update current time display
    currentTimeEl.innerText = formatTime(currentTime);
}

// Set Progress from Click
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
}

// Format Time (seconds -> M:SS)
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Update Volume
function updateVolume() {
    audio.volume = volumeSlider.value;
    updateVolumeProgress();
}

function updateVolumeProgress() {
    const value = volumeSlider.value * 100;
    volumeProgress.style.width = `${value}%`;
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong);
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', updateVolume);

// Initialize on load
init();
