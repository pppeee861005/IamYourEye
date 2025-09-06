/**
 * OCR 處理器模組
 * 負責處理圖片文字識別功能
 */
class OCRProcessor {
    constructor() {
        this.currentOcrText = '';
        this.fileUpload = document.getElementById('file-upload');
        this.imagePreview = document.getElementById('image-preview');
        this.progressElement = document.getElementById('progress');
        this.ocrResultElement = document.getElementById('ocr-result');
        this.generateStoryBtn = document.getElementById('generate-story-btn');
        this.storyResultElement = document.getElementById('story-result');
        this.storyContentElement = document.getElementById('story-content');
        this.init();
    }

    async init() {
        this.bindEvents();
        console.log('OCRProcessor initialized.');
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        if (this.fileUpload) {
            this.fileUpload.addEventListener('change', (event) => this.handleFileUpload(event));
        }
        if (this.generateStoryBtn) {
            this.generateStoryBtn.addEventListener('click', () => this.handleGenerateStory());
        }
    }

    /**
     * 處理檔案上傳
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await this.displayImagePreview(file);
            this.showProgress();
            const result = await this.processOCR(file);
            this.displayOCRResult(result);
            if (this.generateStoryBtn) {
                this.generateStoryBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('OCR處理錯誤:', error);
            this.displayError(error.message);
        } finally {
            this.hideProgress();
        }
    }

    /**
     * 顯示圖片預覽
     */
    displayImagePreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (this.imagePreview) {
                    this.imagePreview.innerHTML = `<img src="${e.target.result}" alt="預覽圖片" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                }
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * 顯示進度
     */
    showProgress() {
        if (this.progressElement) {
            this.progressElement.style.display = 'block';
        }
    }

    /**
     * 隱藏進度
     */
    hideProgress() {
        if (this.progressElement) {
            this.progressElement.style.display = 'none';
        }
    }

    /**
     * 處理OCR
     */
    async processOCR(file) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof Tesseract === 'undefined') {
                    throw new Error('OCR功能未載入，請重新整理頁面');
                }
                if (!file.type.startsWith('image/')) {
                    throw new Error('請選擇有效的圖片檔案');
                }
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error('圖片檔案過大，請選擇小於10MB的圖片');
                }

                const result = await Tesseract.recognize(file, 'chi_tra+eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            this.updateProgress(Math.round(m.progress * 100));
                        }
                    }
                });

                const extractedText = result.data.text.trim();
                if (!extractedText || extractedText.length < 1) {
                    throw new Error('無法識別圖片中的文字，請嘗試更清晰的圖片');
                }
                this.currentOcrText = extractedText;
                resolve(extractedText);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 更新進度
     */
    updateProgress(percentage) {
        const progressSpan = this.progressElement ? this.progressElement.querySelector('span') : null;
        if (progressSpan) {
            progressSpan.textContent = `正在處理圖片... ${percentage}%`;
        }
    }

    /**
     * 顯示OCR結果
     */
    displayOCRResult(text) {
        if (this.ocrResultElement) {
            this.ocrResultElement.innerHTML = `
                <p style="color: #333; line-height: 1.6; white-space: pre-line;">${text}</p>
            `;
        }
    }

    /**
     * 顯示錯誤訊息
     */
    displayError(message) {
        if (this.ocrResultElement) {
            this.ocrResultElement.innerHTML = `
                <p style="color: #e74c3c; font-weight: bold;">❌ ${message}</p>
            `;
        }
    }

    /**
     * 處理生成故事
     */
    async handleGenerateStory() {
        if (this.currentOcrText && this.currentOcrText !== '請選擇圖片進行文字識別') {
            this.generateStoryFromOCR(this.currentOcrText);
        }
    }

    /**
     * 從OCR文字生成故事
     */
    async generateStoryFromOCR(ocrText) {
        if (!this.storyResultElement || !this.storyContentElement) return;

        try {
            this.storyContentElement.textContent = '正在生成故事...';
            this.storyResultElement.style.display = 'block';

            if (window.storyGenerator) {
                window.storyGenerator.setOcrText(ocrText);
                await window.storyGenerator.generateStory();
            } else {
                this.storyContentElement.textContent = '故事生成器未載入';
            }
        } catch (error) {
            console.error('故事生成錯誤:', error);
            this.storyContentElement.textContent = '生成故事時發生錯誤，請重試';
        }
    }

    /**
     * 獲取當前OCR文字
     */
    getCurrentOcrText() {
        return this.currentOcrText;
    }
}

// 匯出 OCRProcessor 類別
export default OCRProcessor;
