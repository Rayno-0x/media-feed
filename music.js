// 1. Target our elements
const audioPlayer = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const musicCards = document.querySelectorAll('.music-card');

// Elements to update in the UI
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const trackCover = document.getElementById('track-cover');

// 2. Add an event listener to every music card
musicCards.forEach(card => {
    card.addEventListener('click', () => {
        // Grab data from the clicked card
        const audioSrc = card.getAttribute('data-audio');
        const title = card.getAttribute('data-title');
        const artist = card.getAttribute('data-artist');
        const coverSrc = card.getAttribute('data-cover');

        // Update the bottom player UI
        trackTitle.textContent = title;
        trackArtist.textContent = artist;
        trackCover.src = coverSrc;

        // Set the audio source and play
        audioPlayer.src = audioSrc;
        audioPlayer.play();
        
        // Update master button to Pause icon
        playPauseBtn.textContent = '⏸';
    });
});

// 3. Play/Pause toggle on the bottom bar
playPauseBtn.addEventListener('click', () => {
    // If no song is loaded, do nothing
    if (!audioPlayer.src) return; 

    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸';
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶';
    }
});

// 4. Update the progress bar as the music plays
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progressPercent;
    }
});

// 5. Allow dragging the progress bar to skip around
progressBar.addEventListener('input', () => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
    }
});

// 6. Reset button when song finishes
audioPlayer.addEventListener('ended', () => {
    playPauseBtn.textContent = '▶';
    progressBar.value = 0;
});