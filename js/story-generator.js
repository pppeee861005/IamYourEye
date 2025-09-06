
/**
 * 故事生成器模組
 * 負責處理故事生成相關功能
 */
class StoryGenerator {
    constructor() {
        this.apiKey = window.APP_CONFIG?.GEMINI_API_KEY;
        this.baseUrl = '';
        this.model = '';
        this.currentOcrText = '';
        this.init();
    }

    async init() {
        await this.loadEnvConfig();
        this.bindEvents();
    }

    /**
     * 載入環境變數配置
     */
    async loadEnvConfig() {
        try {
            if (window.envLoader) {
                await window.envLoader.load();
                this.baseUrl = window.envLoader.get('GEMINI_BASE_URL') || 'https://generativelanguage.googleapis.com/v1beta';
                this.model = window.envLoader.get('GEMINI_MODEL') || 'gemini-2.0-flash';
                console.log('✅ 故事生成器配置載入成功');
            }
        } catch (error) {
            console.warn('無法載入 .env 配置:', error);
            // 使用預設值
            this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
            this.model = 'gemini-2.0-flash';
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 生成故事按鈕
        const generateBtn = document.getElementById('generate-story-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateStory());
        }




    }

    /**
     * 設定OCR文字
     */
    setOcrText(text) {
        this.currentOcrText = text;
    }

    /**
     * 生成故事
     */
    async generateStory() {
        if (!this.apiKey) {
            alert('API Key 未設定，請檢查 .env 文件');
            return;
        }

        if (!this.currentOcrText.trim()) {
            alert('請先進行 OCR 識別，獲得文字內容');
            return;
        }

        const storyResult = document.getElementById('story-result');
        const storyContent = document.getElementById('story-content');

        if (!storyResult || !storyContent) {
            console.error('找不到故事結果顯示區域');
            return;
        }

        storyResult.style.display = 'block';
        storyContent.innerHTML = '🤖 正在使用 Gemini 生成故事，請稍候...';

        try {
            // Add initial delay to prevent immediate rate limiting
            await this.sleep(500);
            const generatedStory = await this.callGeminiAPI(this.buildStoryPrompt());
            storyContent.innerHTML = generatedStory;
            console.log('✅ 故事生成成功');
        } catch (error) {
            console.error('故事生成錯誤:', error);
            storyContent.innerHTML = `❌ 故事生成失敗：${error.message}

請檢查：
1. API Key 是否正確
2. 網路連線是否正常
3. API 配額是否足夠`;
        }
    }

    /**
     * 建構故事生成提示
     */
    buildStoryPrompt() {
        return `請根據以下 OCR 識別的文字內容，編寫成一個完整、感人、有意義的故事。OCR識別的文字是生活上常遇到的文件，如名片，帳單，信件，公文，報紙，使用說明書，食品成本表，處方簽。產生故事時，請先判斷是什麼類的文件，並創作出相符體裁的內容，例如如果判斷是名片就創作出名片內容，如果是信件就寫成信件。若無法辨認，則自由創作。輸出內容格式：這是：[文件類型] 內容是：[內容]。

OCR 識別文字：
${this.currentOcrText}

要求：
1. 修正 OCR 識別錯誤的字詞
2. 補充完整的故事情節
3. 保持原文的核心主題和情感
4. 讓故事更加感人和有教育意義
5. 使用繁體中文
6. 故事長度約 500-800 字

請直接提供完整的故事，不需要其他說明。`;
    }

    /**
     * 調用 Gemini API
     */
    async callGeminiAPI(prompt, retryCount = 0) {
        const maxRetries = 5;
        const baseDelay = 2000; // 2 seconds

        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 429 && retryCount < maxRetries) {
                    // Rate limit exceeded, wait and retry with exponential backoff
                    const delay = baseDelay * Math.pow(2, retryCount);
                    console.log(`⚠️ API 請求過於頻繁，${delay}ms 後重試 (${retryCount + 1}/${maxRetries})`);
                    await this.sleep(delay);
                    return this.callGeminiAPI(prompt, retryCount + 1);
                } else {
                    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('API 回應格式異常');
            }
        } catch (error) {
            if (retryCount < maxRetries && (error.message.includes('429') || error.message.includes('fetch'))) {
                // Network error or rate limit, retry
                const delay = baseDelay * Math.pow(2, retryCount);
                console.log(`⚠️ 網路錯誤，${delay}ms 後重試 (${retryCount + 1}/${maxRetries})`);
                await this.sleep(delay);
                return this.callGeminiAPI(prompt, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * 睡眠函數
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }






}

// 創建全域實例
window.storyGenerator = new StoryGenerator();
