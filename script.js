document.addEventListener('DOMContentLoaded', () => {

    // === MEDIA RESOURCES ===
    const sfxClick = document.getElementById('sfx-click');
    const sfxRadioOn = document.getElementById('sfx-radio-on');
    const bgMusic = document.getElementById('bg-music');
    const mainVideo = document.getElementById('main-video');
    
    // Playlists
    const musicPlaylist = [
        'assets/music/lagu_1.mp3',
        'assets/music/lagu_2.mp3',
        'assets/music/lagu_3.mp3',
        'assets/music/lagu_4.mp3', // Tambahkan koma di akhir setiap baris kecuali yang terakhir
        'assets/music/lagu_5.mp3',
        'assets/music/lagu_6.mp3',
        'assets/music/lagu_7.mp3',
        'assets/music/lagu_8.mp3'
    ];
    let currentMusicIndex = 0;

    const videoPlaylist = [
        'assets/videos/video_1.mp4'
    ];
    let currentVideoIndex = 0;

    const totalPhotos = 8;
    let currentPhotoIndex = 1;

    // Set volumes
    sfxClick.volume = 0.5;
    sfxRadioOn.volume = 0.7;
    bgMusic.volume = 0.6;

    // === UTILS ===
    function playClick() {
        sfxClick.currentTime = 0;
        sfxClick.play().catch(e => console.log('Audio error:', e));
    }

    // === NAVIGATION LOGIC ===
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playClick();
            
            // Remove active from all
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => {
                v.classList.remove('active');
                // stop view specific animations/playback if needed
            });

            // Set current active
            btn.classList.add('active');
            const targetView = btn.getAttribute('data-view');
            document.getElementById(`view-${targetView}`).classList.add('active');

            // Handle Media overlaps and Animations
            if (targetView == '2') {
                // Pause radio music if viewing video
                if (!bgMusic.paused) bgMusic.pause();
                // Auto-play the video without changing design
                mainVideo.play().catch(e => console.log('Auto-play blocked:', e));
            } else if (targetView == '5') {
                // Restart flower animation
                const flowerContainer = document.querySelector('.view-5-flower-container');
                if (flowerContainer) {
                    // Remove any existing hearts so they aren't cloned permanently
                    flowerContainer.querySelectorAll('.interactive-heart').forEach(h => h.remove());
                    const clone = flowerContainer.cloneNode(true);
                    flowerContainer.replaceWith(clone);
                }
                if (isRadioOn) bgMusic.play().catch(e => console.log('Wait for user interaction'));
                if(!mainVideo.paused) mainVideo.pause();
            } else if (targetView !== '2' && isRadioOn) {
                // if radio is on and we left video, we can resume music
                bgMusic.play().catch(e => console.log('Wait for user interaction'));
                if(!mainVideo.paused) mainVideo.pause();
            } else {
                if(!mainVideo.paused) mainVideo.pause();
            }
        });
    });


    // === VIEW 1: RADIO LOGIC ===
    const powerBtn = document.getElementById('power-btn');
    const powerIndicator = document.getElementById('power-indicator');
    const cassetteTitle = document.getElementById('cassette-title');
    const cassetteDeck = document.querySelector('.cassette');
    let isRadioOn = false;
    let visualizerInterval;

    // Setup Visualizer
    const barsContainer = document.getElementById('top-bars');
    for (let i = 0; i < 30; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (i === 15) bar.classList.add('red');
        barsContainer.appendChild(bar);
    }
    const barsList = document.querySelectorAll('.bar');

    const speakerCone = document.getElementById('speaker-cone');

    function animateVisualizer() {
        barsList.forEach(bar => {
            const h = Math.floor(Math.random() * 90) + 10;
            bar.style.height = `${h}%`;
        });

        if (speakerCone) {
            const scale = 1 + (Math.random() * 0.04);
            speakerCone.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
    }

    powerBtn.addEventListener('click', () => {
        playClick();
        isRadioOn = !isRadioOn;

        if (isRadioOn) {
            powerIndicator.classList.add('on');
            sfxRadioOn.currentTime = 0;
            sfxRadioOn.play();
            
            cassetteTitle.textContent = "儚いメロディー 0-30";
            
            // delay music start to let FX finish
            setTimeout(() => {
                if (isRadioOn) {
                    cassetteDeck.classList.add('spin');
                    visualizerInterval = setInterval(animateVisualizer, 150);
                    bgMusic.src = musicPlaylist[currentMusicIndex];
                    bgMusic.play().catch(e => console.log(e));
                }
            }, 1500);

        } else {
            powerIndicator.classList.remove('on');
            cassetteDeck.classList.remove('spin');
            cassetteTitle.textContent = "click power!";
            clearInterval(visualizerInterval);
            barsList.forEach(bar => bar.style.height = '10%');
            if (speakerCone) speakerCone.style.transform = 'translate(-50%, -50%) scale(1)';
            bgMusic.pause();
            sfxRadioOn.pause();
        }
    });

    bgMusic.addEventListener('ended', () => {
        currentMusicIndex = (currentMusicIndex + 1) % musicPlaylist.length;
        bgMusic.src = musicPlaylist[currentMusicIndex];
        bgMusic.play();
    });


    // === VIEW 2: VIDEO LOGIC ===
    const playPauseVideoBtn = document.getElementById('play-pause-video');
    const nextVideoBtn = document.getElementById('next-video');
    const prevVideoBtn = document.getElementById('prev-video');
    const videoTimeDisplay = document.getElementById('video-time');

    playPauseVideoBtn.addEventListener('click', () => {
        playClick();
        if (mainVideo.paused) {
            mainVideo.play();
        } else {
            mainVideo.pause();
        }
    });

    if(videoPlaylist.length > 1) {
        nextVideoBtn.removeAttribute('disabled');
        prevVideoBtn.removeAttribute('disabled');
    }

    nextVideoBtn.addEventListener('click', () => {
        playClick();
        if(videoPlaylist.length > 1) {
            currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
            mainVideo.src = videoPlaylist[currentVideoIndex];
            mainVideo.play();
        }
    });

    prevVideoBtn.addEventListener('click', () => {
        playClick();
        if(videoPlaylist.length > 1) {
            currentVideoIndex = (currentVideoIndex - 1 + videoPlaylist.length) % videoPlaylist.length;
            mainVideo.src = videoPlaylist[currentVideoIndex];
            mainVideo.play();
        }
    });

    mainVideo.addEventListener('timeupdate', () => {
        // format time like 00:00:04:10
        const m = Math.floor(mainVideo.currentTime / 60).toString().padStart(2, '0');
        const s = Math.floor(mainVideo.currentTime % 60).toString().padStart(2, '0');
        const ms = Math.floor((mainVideo.currentTime % 1) * 100).toString().padStart(2, '0');
        videoTimeDisplay.textContent = `00:${m}:${s}:${ms}`;
    });


    // === VIEW 3: CAMERA SLIDESHOW LOGIC ===
    const slideshowImage = document.getElementById('slideshow-image');
    const nextPhotoBtn = document.getElementById('next-photo');
    const prevPhotoBtn = document.getElementById('prev-photo');
    const otherCamBtns = document.querySelectorAll('.cam-btn:not(#next-photo):not(#prev-photo)');

    function updatePhoto() {
        slideshowImage.src = `assets/images/foto_${currentPhotoIndex}.png`;
    }

    nextPhotoBtn.addEventListener('click', () => {
        playClick();
        currentPhotoIndex++;
        if (currentPhotoIndex > totalPhotos) currentPhotoIndex = 1;
        updatePhoto();
    });

    prevPhotoBtn.addEventListener('click', () => {
        playClick();
        currentPhotoIndex--;
        if (currentPhotoIndex < 1) currentPhotoIndex = totalPhotos;
        updatePhoto();
    });

    otherCamBtns.forEach(btn => {
        btn.addEventListener('click', () => { playClick(); });
    });


    // === VIEW 4: STORYBOOK LOGIC ===
    const storyPages = document.querySelectorAll('.story-page');
    const nextStoryBtn = document.getElementById('next-story-btn');
    const prevStoryBtn = document.getElementById('prev-story-btn');
    const storyPageIndicator = document.getElementById('story-page-indicator');
    let currentStoryIndex = 0;

    function updateStoryPage() {
        storyPages.forEach((page, index) => {
            if (index === currentStoryIndex) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
        if(storyPageIndicator) {
             storyPageIndicator.textContent = `${currentStoryIndex + 1} / ${storyPages.length}`;
        }
        
        // Sembunyikan tombol 'sebelumnya' di halaman pertama
        if (prevStoryBtn) {
            prevStoryBtn.style.display = (currentStoryIndex === 0) ? 'none' : 'block';
        }
        // Sembunyikan tombol 'selanjutnya' di halaman terakhir
        if (nextStoryBtn) {
            nextStoryBtn.style.display = (currentStoryIndex === storyPages.length - 1) ? 'none' : 'block';
        }
    }

    if (nextStoryBtn && prevStoryBtn) {
        nextStoryBtn.addEventListener('click', () => {
            if (currentStoryIndex < storyPages.length - 1) {
                playClick();
                currentStoryIndex++;
                updateStoryPage();
            }
        });

        prevStoryBtn.addEventListener('click', () => {
            if (currentStoryIndex > 0) {
                playClick();
                currentStoryIndex--;
                updateStoryPage();
            }
        });
        
        // Panggil saat inisialisasi agar tombol Prev langsung disembunyikan di awal
        updateStoryPage();
    }

    // === VIEW 6: COUNTDOWN / TIME ELAPSED ===
    const targetDate = new Date('2025-09-19T15:00:00').getTime();
    
    function updateCounter() {
        const now = new Date().getTime();
        const difference = now - targetDate;
        
        // Convert to days, hours
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Approximate calculation for Years, Months, Days
        // A more complex library like moment.js would be better for exact duration, but we can approximate:
        const start = new Date(targetDate);
        const end = new Date();
        
        let dYears = end.getFullYear() - start.getFullYear();
        let dMonths = end.getMonth() - start.getMonth();
        let dDays = end.getDate() - start.getDate();
        
        if (dDays < 0) {
            dMonths--;
            // get days in previous month
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            dDays += prevMonth.getDate();
        }
        if (dMonths < 0) {
            dYears--;
            dMonths += 12;
        }

        document.getElementById('total-days').textContent = days;
        document.getElementById('cd-years').textContent = dYears;
        document.getElementById('cd-months').textContent = dMonths;
        document.getElementById('cd-days').textContent = dDays;
        document.getElementById('cd-hours').textContent = hours;
        document.getElementById('cd-minutes').textContent = minutes;
        document.getElementById('cd-seconds').textContent = seconds;
    }
    
    setInterval(updateCounter, 1000);
    updateCounter();

    // === VIEW 5: FLOWER INTERACTION ===
    const view5 = document.getElementById('view-5');
    if (view5) {
        // Gunakan pointerdown pada parent container agar listener tidak hilang saat animasi di-reset
        view5.addEventListener('pointerdown', (e) => {
            const flowerContainer = document.querySelector('.view-5-flower-container');
            if (!flowerContainer) return;
            const rect = flowerContainer.getBoundingClientRect();
            // Kalkulasi posisi x dan y relatif terhadap container
            let clientX = e.clientX;
            let clientY = e.clientY;
            
            // Jaga-jaga jika e.clientX undef karena touch event struktur
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            const x = clientX - rect.left;
            const y = clientY - rect.top;

            const heart = document.createElement('div');
            heart.className = 'interactive-heart';
            
            // Posisi absolut di titik sentuh
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;

            flowerContainer.appendChild(heart);

            // Putar audio click jika tersedia
            if (typeof playClick === 'function') playClick();

            // Hancurkan setelah animasi selesai
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 2500);
        });
    }

});
