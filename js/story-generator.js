
/**
 * 故事生成器模組
 * 版本: 1.0.0
 * 模組: OCR 處理器模組
 * 狀態: 獨立運行
 * 功能: OCR文字識別、故事生成、內容分析
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
                this.apiKey = window.envLoader.get('GEMINI_API_KEY') || this.apiKey;
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

        // 如果還是沒有 API Key，嘗試從 .env 文件直接獲取
        if (!this.apiKey) {
            try {
                const response = await fetch('.env');
                const text = await response.text();
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('GEMINI_API_KEY=')) {
                        this.apiKey = line.split('=')[1].trim();
                        break;
                    }
                }
                console.log('✅ 從 .env 文件直接獲取 API Key 成功');
            } catch (error) {
                console.warn('無法從 .env 文件獲取 API Key:', error);
            }
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

        // 故事結果關閉按鈕
        const closeBtn = document.getElementById('story-result-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeStoryResult());
        }

        // 故事朗讀按鈕
        const readAloudBtn = document.getElementById('read-story-aloud-btn');
        if (readAloudBtn) {
            readAloudBtn.addEventListener('click', () => this.readStoryAloud());
        }

        // 複製故事按鈕
        const copyBtn = document.getElementById('copy-story-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyStory());
        }

        // 發送到對話按鈕
        const sendToChatBtn = document.getElementById('send-story-to-chat-btn');
        if (sendToChatBtn) {
            sendToChatBtn.addEventListener('click', () => this.sendStoryToChat());
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

        // 從故事輸入框獲取文字
        const storyInput = document.getElementById('story-text-input');
        const inputText = storyInput ? storyInput.value.trim() : '';

        if (!inputText) {
            alert('請輸入要生成故事的文字內容');
            return;
        }

        // 設定當前文字
        this.setOcrText(inputText);

        const storyResultArea = document.getElementById('story-result-area');
        const storyContent = document.getElementById('story-content');

        if (!storyResultArea || !storyContent) {
            console.error('找不到故事結果顯示區域');
            return;
        }

        // 顯示載入狀態
        storyResultArea.style.display = 'block';
        storyContent.innerHTML = '🤖 小安正在使用 Gemini 生成溫馨故事，請稍候...';

        try {
            // Add initial delay to prevent immediate rate limiting
            await this.sleep(500);
            const generatedStory = await this.callGeminiAPI(this.buildStoryPrompt());
            storyContent.innerHTML = generatedStory;
            console.log('✅ 故事生成成功');

            // 清空輸入框
            if (storyInput) {
                storyInput.value = '';
            }
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
     * 判斷內容類型
     */
    determineContentType(text) {
        const content = text.toLowerCase();

        // 名片類型關鍵詞
        if (content.includes('先生') || content.includes('小姐') || content.includes('經理') ||
            content.includes('公司') || content.includes('電話') || content.includes('手機') ||
            (content.includes('姓名') && content.includes('職稱'))) {
            return 'business_card';
        }

        // 信件類型關鍵詞
        if (content.includes('親愛的') || content.includes('敬啟') || content.includes('敬上') ||
            content.includes('來信') || content.includes('收信人') || content.includes('寄信人')) {
            return 'letter';
        }

        // 帳單類型關鍵詞
        if (content.includes('帳單') || content.includes('費用') || content.includes('金額') ||
            content.includes('總計') || content.includes('付款') || content.includes('到期')) {
            return 'bill';
        }

        // 報紙類型關鍵詞
        if (content.includes('新聞') || content.includes('報導') || content.includes('記者') ||
            content.includes('發生') || content.includes('事件') || content.includes('報紙')) {
            return 'newspaper';
        }

        // 小說類型關鍵詞
        if (content.includes('章') || content.includes('節') || content.includes('故事') ||
            content.length > 500) {
            return 'novel';
        }

        // 廣告單類型關鍵詞
        if (content.includes('優惠') || content.includes('特價') || content.includes('促銷') ||
            content.includes('活動') || content.includes('廣告')) {
            return 'advertisement';
        }

        // 說明書類型關鍵詞
        if (content.includes('使用說明') || content.includes('操作方法') || content.includes('步驟') ||
            content.includes('注意事項') || content.includes('說明')) {
            return 'manual';
        }

        // 公文類型關鍵詞
        if (content.includes('公文') || content.includes('通知') || content.includes('公告') ||
            content.includes('文件') || content.includes('正式')) {
            return 'official';
        }

        // 食品說明類型關鍵詞
        if (content.includes('營養') || content.includes('成分') || content.includes('保存') ||
            content.includes('食品') || content.includes('過期')) {
            return 'food_label';
        }

        return 'general';
    }

    /**
     * 情感分析
     */
    analyzeEmotion(text) {
        const positiveWords = ['快樂', '幸福', '喜悅', '溫暖', '愛', '感謝', '成功', '健康', '美好', '幸運'];
        const negativeWords = ['難過', '痛苦', '悲傷', '憂鬱', '生病', '困難', '煩惱', '壓力', '擔心', '疲憊'];

        const lowerText = text.toLowerCase();
        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            if (lowerText.includes(word)) positiveCount++;
        });

        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negativeCount++;
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * 計算內容複雜度
     */
    calculateComplexity(text) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        const words = text.split(/\s+/).filter(w => w.trim());
        const avgSentenceLength = words.length / sentences.length;

        if (avgSentenceLength < 10) return 'simple';
        if (avgSentenceLength < 20) return 'medium';
        return 'complex';
    }

    /**
     * 建構故事生成提示
     */
    buildStoryPrompt() {
        const contentType = this.determineContentType(this.currentOcrText);
        const emotion = this.analyzeEmotion(this.currentOcrText);
        const complexity = this.calculateComplexity(this.currentOcrText);

        // 根據複雜度決定故事長度
        let lengthGuide = '';
        switch (complexity) {
            case 'simple':
                lengthGuide = '20-50字';
                break;
            case 'medium':
                lengthGuide = '50-100字';
                break;
            case 'complex':
                lengthGuide = '100-200字';
                break;
        }

        // 內容類型特定的提示
        const typePrompts = {
            business_card: '這是名片內容，請溫馨地介紹這位人士的背景和工作',
            letter: '這是信件內容，請溫暖地描述信中的情感和故事',
            bill: '這是帳單內容，請輕鬆地說明生活中的點點滴滴',
            newspaper: '這是新聞內容，請有趣地講述發生的事件',
            novel: '這是小說內容，請引人入勝地描述情節',
            advertisement: '這是廣告內容，請實用地介紹產品或服務',
            manual: '這是說明書內容，請清楚地解釋使用方法',
            official: '這是公文內容，請正式但親切地說明要點',
            food_label: '這是食品說明，請關心地提醒保存和營養資訊',
            general: '這是一般內容，請溫暖地分享其中的故事'
        };

        const basePrompt = `你是「小安」，一位溫柔且有耐心的晚輩。你現在要幫忙將 OCR 識別的文字轉化為溫馨的故事。

內容類型：${typePrompts[contentType] || typePrompts.general}
情感基調：${emotion === 'positive' ? '正面溫暖' : emotion === 'negative' ? '安慰鼓勵' : '生活趣味'}
建議長度：${lengthGuide}

OCR 識別文字：
${this.currentOcrText}

要求：
1. 以「小安」的溫柔晚輩語調說話
2. 將複雜內容簡化為1-2個關鍵短句
3. 適度表達內容中的情感
4. 適合老年使用者理解，使用簡單詞彙
5. 故事片段以開放性問題結束，引發分享個人經驗
6. 使用繁體中文

請直接提供故事內容，不需要其他說明。`;

        return basePrompt;
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

    /**
     * 關閉故事結果
     */
    closeStoryResult() {
        const storyResultArea = document.getElementById('story-result-area');
        if (storyResultArea) {
            storyResultArea.style.display = 'none';
            console.log('📖 故事結果已關閉');
        }
    }

    /**
     * 大聲朗讀故事
     */
    readStoryAloud() {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;

        const text = storyContent.textContent.trim();
        if (!text) {
            alert('沒有故事內容可以朗讀');
            return;
        }

        if ('speechSynthesis' in window) {
            // 停止當前朗讀
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-TW';
            utterance.rate = 0.7; // 較慢的語速
            utterance.pitch = 1.1; // 稍高的音調
            utterance.volume = 1.0;

            // 尋找中文語音
            const voices = window.speechSynthesis.getVoices();
            const chineseVoice = voices.find(voice =>
                voice.lang.includes('zh') || voice.name.includes('Chinese')
            );

            if (chineseVoice) {
                utterance.voice = chineseVoice;
            }

            window.speechSynthesis.speak(utterance);
            alert('開始朗讀故事...');
        } else {
            alert('您的瀏覽器不支援語音朗讀功能');
        }
    }

    /**
     * 複製故事
     */
    async copyStory() {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;

        const text = storyContent.textContent.trim();
        if (!text) {
            alert('沒有故事內容可以複製');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            alert('故事已複製到剪貼板');
        } catch (error) {
            console.error('複製失敗:', error);
            alert('複製失敗，請手動選取文字複製');
        }
    }

    /**
     * 發送到對話
     */
    sendStoryToChat() {
        const storyContent = document.getElementById('story-content');
        if (!storyContent) return;

        const text = storyContent.textContent.trim();
        if (!text) {
            alert('沒有故事內容可以發送');
            return;
        }

        // 將故事發送到聊天機器人
        const message = `小安為我生成的故事：\n\n${text}`;

        // 如果有聊天功能，添加到聊天
        if (window.globalAssistant && window.globalAssistant.addChatMessage) {
            window.globalAssistant.addChatMessage(message, 'user');
            window.globalAssistant.processChatMessage(message);
            this.closeStoryResult();
            alert('故事已發送到對話');
        } else {
            alert('聊天功能未初始化');
        }
    }



}

// 創建全域實例
window.storyGenerator = new StoryGenerator();
