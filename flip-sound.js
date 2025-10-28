// Tạo âm thanh lật sách từ file MP3
class PageFlipSound {
    constructor() {
        this.isEnabled = true;
        this.volume = 0.6;
        this.audio = null;
        this.audioPool = []; // Pool of audio objects for overlapping sounds
        this.poolSize = 5;
        this.currentIndex = 0;
        this.initAudio();
    }

    initAudio() {
        try {
            // Tạo pool các audio object để có thể phát âm thanh chồng lên nhau
            for (let i = 0; i < this.poolSize; i++) {
                const audio = new Audio('page/latsach.mp3');
                audio.volume = this.volume;
                audio.preload = 'auto';
                
                // Xử lý lỗi nếu không tải được file
                audio.onerror = () => {
                    console.warn('Không thể tải file âm thanh lật sách');
                    this.isEnabled = false;
                };
                
                this.audioPool.push(audio);
            }
        } catch (error) {
            console.warn('Lỗi khởi tạo âm thanh:', error);
            this.isEnabled = false;
        }
    }

    // Phát âm thanh lật trang từ file MP3
    playFlipSound(type = 'normal') {
        if (!this.isEnabled || this.audioPool.length === 0) return;

        try {
            // Lấy audio object từ pool
            const audio = this.audioPool[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.poolSize;

            // Reset và phát âm thanh
            audio.currentTime = 0;
            audio.volume = this.volume;
            
            // Điều chỉnh tốc độ phát dựa trên loại âm thanh
            switch(type) {
                case 'soft':
                    audio.playbackRate = 0.9;
                    audio.volume = this.volume * 0.8;
                    break;
                case 'crisp':
                    audio.playbackRate = 1.1;
                    audio.volume = this.volume * 1.2;
                    break;
                case 'subtle':
                    audio.playbackRate = 1.0;
                    audio.volume = this.volume * 0.6;
                    break;
                default:
                    audio.playbackRate = 1.0;
                    audio.volume = this.volume;
            }

            // Phát âm thanh
            const playPromise = audio.play();
            
            // Xử lý promise cho các trình duyệt hiện đại
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Không thể phát âm thanh:', error);
                });
            }
        } catch (error) {
            console.warn('Lỗi phát âm thanh:', error);
        }
    }

    // Setter cho loại âm thanh (giữ lại để tương thích)
    setSoundType(type) {
        this.soundType = type;
    }

    // Bật/tắt âm thanh
    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }

    // Điều chỉnh âm lượng
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        // Cập nhật âm lượng cho tất cả audio objects trong pool
        this.audioPool.forEach(audio => {
            audio.volume = this.volume;
        });
    }

    // Preload âm thanh
    preload() {
        this.audioPool.forEach(audio => {
            audio.load();
        });
    }

    // Dọn dẹp resources
    destroy() {
        this.audioPool.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        this.audioPool = [];
    }
}

// Export để sử dụng
window.PageFlipSound = PageFlipSound;