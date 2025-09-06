
/**
 * 聊天機器人模組
 * 負責處理聊天機器人相關功能
 */
class Chatbot {
    constructor() {
        this.apiKey = window.APP_CONFIG?.GEMINI_API_KEY;
        this.baseUrl = '';
        this.model = '';
        this.shortTermMemory = [];
        this.requestQueue = [];
        this.isProcessing = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000; // 最小請求間隔 3 秒
        this.defaultStory = `蘭，一步一停，彷彿在豔陽下掙扎的枯萎花朵。

小敏小時候生病高燒不適，未及時注意，延誤就醫，使得她遭受了不可逆的傷害，智能發展受到影響。父母在她很小的時候就離婚，年幼的小敏和妹妹國恩，便由外祖母撫養。外祖母拾檢資源回收物，積攢微薄的收入，供養兩個孫女。

那段日子，艱苦得讓人難以想像。外祖母總是省吃儉用，一天只吃一餐，只為了省錢讓兩個孩子能吃到更多，能獲得持續的營養。即使在疫情期間，生活更加困頓，外祖母也從未間斷對她們的照顧。

小敏雖然心智發展遲緩，卻異常的敏感和懂事。她能感受到外祖母肩上的重擔，能感受到妹妹國恩小小年紀就學會分擔家務的辛勞。她笨拙地學習著如何幫忙，雖然經常弄巧成拙，但她眼中的真誠和努力，卻讓外祖母和國恩感到心疼。

國恩比小敏小三歲，從小就扮演著照顧姐姐的角色。她知道姐姐和別人不一樣，需要更多的耐心和關愛。她會牽著姐姐的手，慢慢地走過街道，會耐心地教姐姐學習，會用稚嫩的聲音安慰姐姐。

外祖母年紀大了，身體也越來越差。有一天，她突然病倒了。家裡頓時失去了經濟來源，也失去了依靠。國恩不得不更加努力地照顧外祖母和姐姐，她開始利用課餘時間做一些手工，希望能賺取一些微薄的收入。

小敏看著妹妹瘦弱的身影，心裡充滿了愧疚。她知道自己是個累贅，是家裡的負擔。她想為家人做些什麼，但她卻不知道該怎麼做。

有一天，小敏在街上看到一位畫家正在為人畫像。她被那些栩栩如生的畫作所吸引，也萌生了一個念頭。雖然她的手腳不太靈活，畫出來的線條也歪歪扭扭，但她還是堅持每天練習。

她用撿來的紙片和筆，一遍又一遍地畫著外祖母和妹妹的樣子。她想用自己的方式，表達對她們的愛。

經過不斷的努力，小敏的畫技逐漸進步。她的畫作雖然不夠完美，卻充滿了真摯的情感。有一天，她鼓起勇氣，把自己的畫作拿到街上售賣。

起初，沒有人注意到她的畫作。但小敏並沒有放棄，她繼續堅持著。終於，一位路過的藝術家被她的畫作所感動，他停下腳步，仔細地欣賞著這些充滿童真的作品。

藝術家被小敏的真誠所打動，他不僅買下了她的畫作，還鼓勵她繼續努力。他甚至還教她一些绘画技巧，帮助她更好地表达自己的情感。

小敏的画作开始受到越来越多人的关注。她的故事也感动了许多人。人们纷纷伸出援手，帮助她们一家度过难关。

最终，在外祖母、妹妹和社会的关爱下，小敏找到了属于自己的价值。她用自己的画作，传递着爱与希望，也证明了即使身有缺陷，也能创造属于自己的精彩人生。而國恩，也更加堅定了照顧家人的決心，她知道，愛和陪伴，才是最珍貴的力量。蘭，在陽光下，慢慢綻放出屬於自己的光彩，雖然緩慢，卻充滿了生命力。`;

        this.systemPrompt = `你是放大鏡，專為老人設計的閱讀輔助工具。使用者是老人，會詢問你讀取的內容是什麼，你負責解釋內容。如果內容涉及藥物，你不討論，會提醒使用者尋求醫生協助。你會分析讀取的內容，耐心等待老人提問。你是老人的眼睛，幫助他們看清楚文字，並以簡單、親切的語氣回應。

請注意，當用戶輸入「請繼續」時，請繼續說明剩餘內容，保持語氣溫和且簡單易懂。`;

        this.gemini = null;

        this.init();
    }

    async initGemini() {
        if (this.gemini) return;

        if (!this.apiKey) {
            console.warn('Gemini API 金鑰未設定。');
            return;
        }

        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(this.apiKey);
            this.gemini = genAI.getGenerativeModel({ model: this.model }); // 使用 this.model
            console.log('✅ Gemini 初始化成功');
        } catch (error) {
            console.error('Gemini 初始化失敗:', error);
        }
    }

    async init() {
        await this.loadEnvConfig();
        this.bindEvents();
        this.initMessages();
    }

    /**
    /**
     * 載入環境變數配置
     */
    async loadEnvConfig() {
        try {
            if (window.envLoader) {
                await window.envLoader.load();
                this.baseUrl = window.envLoader.get('GEMINI_BASE_URL') || 'https://generativelanguage.googleapis.com/v1beta';
                this.model = window.envLoader.get('GEMINI_MODEL') || 'gemini-pro'; // 預設使用 gemini-pro
                this.minRequestInterval = parseInt(window.envLoader.get('MIN_REQUEST_INTERVAL') || '3000');
                this.defaultStory = window.envLoader.get('DEFAULT_STORY') || this.defaultStory; // 載入預設故事
                this.systemPrompt = window.envLoader.get('SYSTEM_PROMPT') || this.systemPrompt; // 載入系統提示
            }

            console.log('✅ 聊天機器人配置載入成功');
        } catch (error) {
            console.warn('無法載入 .env 配置:', error);
            // 使用預設值
            this.apiKey = '';
            this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
            this.model = 'gemini-pro';
            this.minRequestInterval = 3000;
            // defaultStory 和 systemPrompt 保持 constructor 中的預設值
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        const sendBtn = document.getElementById('send-btn');
        const input = document.getElementById('chat-input');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            // 自動聚焦輸入框
            input.focus();
        }
    }

    /**
     * 初始化訊息
     */
    initMessages() {
        const messages = document.getElementById('messages');
        if (messages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = '您好！我是小安，很高興見到您！我已經讀取您的文件。並完成分析。請問您想詢問什麼?';
            messageDiv.appendChild(bubble);
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    /**
     * 添加訊息
     */
    addMessage(text, sender) {
        const messages = document.getElementById('messages');
        if (!messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        // 如果是機器人訊息，加入朗讀按鈕
        if (sender === 'bot') {
            const readBtn = document.createElement('button');
            readBtn.textContent = '🔊 朗讀';
            readBtn.style.marginLeft = '10px';
            readBtn.style.background = '#4CAF50';
            readBtn.style.color = 'white';
            readBtn.style.border = 'none';
            readBtn.style.padding = '0.2rem 0.5rem';
            readBtn.style.borderRadius = '4px';
            readBtn.style.cursor = 'pointer';
            readBtn.style.fontSize = '14px';

            readBtn.addEventListener('click', () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'zh-TW';
                    utterance.rate = 0.7;
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;
                    window.speechSynthesis.speak(utterance);
                } else {
                    alert('您的瀏覽器不支援語音朗讀功能');
                }
            });

            bubble.appendChild(readBtn);
        }

        messageDiv.appendChild(bubble);
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    /**
     * 顯示正在輸入
     */
    showTyping() {
        const typing = document.getElementById('typing');
        if (typing) {
            typing.style.display = 'block';
        }
    }

    /**
     * 隱藏正在輸入
     */
    hideTyping() {
        const typing = document.getElementById('typing');
        if (typing) {
            typing.style.display = 'none';
        }
    }

    /**
     * 發送訊息
     */
    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        let message = input.value.trim();
        if (!message) return;

        // 取得生成的故事內容
        const storyContentElement = document.getElementById('story-content');
        let storyText = '';
        if (storyContentElement) {
            const text = storyContentElement.textContent.trim();
            // 排除尚未生成故事或錯誤訊息的情況
            if (text && !text.includes('正在使用') && !text.includes('故事生成失敗')) {
                storyText = `故事：\n${text}\n\n`;
            }
        }

        // 若無新故事，使用預設故事範例
        if (!storyText) {
            storyText = `故事：\n${this.defaultStory}\n\n`;
        }

        // 將故事內容獨立加入短期記憶，並在prompt組合時加入
        // 先將用戶訊息加入短期記憶
        this.shortTermMemory.push({ role: 'user', content: message });

        // 加入故事內容
        this.shortTermMemory.push({ role: 'user', content: storyText });

        // 限制短期記憶長度，保留最近5輪對話（10條訊息）
        if (this.shortTermMemory.length > 10) {
            this.shortTermMemory.splice(0, this.shortTermMemory.length - 10);
        }

        // 組合短期記憶訊息為prompt文字
        let promptText = '';
        this.shortTermMemory.forEach(item => {
            if (item.role === 'user') {
                promptText += `用戶：${item.content}\n`;
            } else if (item.role === 'bot') {
                promptText += `小安：${item.content}\n`;
            }
        });

        // 添加用戶最新訊息
        promptText += `用戶：${message}\n小安：`;

        // 添加用戶訊息到畫面
        this.addMessage(message, 'user');
        input.value = '';

        // 顯示正在輸入
        this.showTyping();

        // 簡化設計：將短期記憶與故事內容合併成一個prompt，直接傳給API
        // 由於 makeApiRequest 現在會使用 fullHistory，這裡只需要傳遞最新的用戶訊息
        // 故將 combinedPrompt 改為只包含最新的用戶訊息
        const latestUserMessage = message;

        try {
            const response = await this.getXAIResponse(latestUserMessage);

            this.hideTyping();

            // 分段回應邏輯開始
            if (response.length > 100) {
                const firstHalf = response.slice(0, Math.floor(response.length / 2));
                const secondHalf = response.slice(Math.floor(response.length / 2));
                this.addMessage(firstHalf + '\n\n請問是否要繼續？', 'bot');
                // 將第二半暫存於短期記憶，標記為待續
                this.shortTermMemory.push({ role: 'bot', content: firstHalf, continued: true });
                this.shortTermMemory.push({ role: 'bot', content: secondHalf, continued: false, pending: true });
            } else {
                this.addMessage(response, 'bot');
                this.shortTermMemory.push({ role: 'bot', content: response });
            }
            // 分段回應邏輯結束
        } catch (error) {
            this.hideTyping();
            console.error('聊天回應錯誤:', error);

            let errorMessage = '抱歉，發生了錯誤。請稍後再試。';

            if (error.message.includes('速率限制') || error.message.includes('網路連接')) {
                errorMessage = '系統配置有誤，請檢查網路連線後再試。';
            } else if (error.message.includes('API Key')) {
                errorMessage = '系統配置有誤，請聯繫管理員。';
            }

            this.addMessage(errorMessage, 'bot');
        }
    }

    /**
     * 調用 XAI API 並處理速率限制
     */
    async getXAIResponse(prompt) {
        await this.initGemini();
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ prompt, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * 處理請求隊列
     */
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const { prompt, resolve, reject } = this.requestQueue.shift();

            // 等待最小間隔時間
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await this.sleep(this.minRequestInterval - timeSinceLastRequest);
            }
            this.lastRequestTime = Date.now();

            try {
                const response = await this.makeApiRequest(prompt);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * 執行 API 請求並處理重試
     */
    async makeApiRequest(prompt, retryCount = 0) {
        const maxRetries = 5;
        const baseDelay = 2000; // 2 秒基礎延遲

        if (!this.apiKey) {
            throw new Error('API Key 未設定，無法回應。');
        }

        if (!this.gemini) {
            throw new Error('Gemini 未初始化。');
        }

        try {
            // 將 shortTermMemory 轉換為 Gemini API 所需的 history 格式
            const history = this.shortTermMemory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model', // Gemini API 使用 'user' 和 'model'
                parts: [{ text: msg.content }]
            }));

            // 將 systemPrompt 作為歷史記錄的第一條訊息
            const fullHistory = [
                {
                    role: "user",
                    parts: [{ text: this.systemPrompt }],
                },
                ...history
            ];

            const chat = this.gemini.startChat({
                history: fullHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });

            // 由於 promptText 已經包含了完整的對話歷史，這裡只需要發送最新的用戶訊息
            // 但由於 sendMessage 函數中已經將 shortTermMemory 和 storyText 加入，
            // 且 promptText 已經是組合後的完整對話，這裡需要調整。
            // 最簡單的方式是讓 sendMessage 僅發送最新的用戶輸入，而歷史由 chat.history 維護。
            // 重新審視 sendMessage 函數，它已經將所有歷史組合成 promptText。
            // 因此，這裡的 chat.sendMessage(prompt) 應該是正確的，因為 prompt 已經包含了所有上下文。
            // 但如果 history 已經包含了所有上下文，那麼 sendMessage 就不應該再傳遞完整的 promptText，
            // 而是只傳遞最新的用戶訊息。

            // 為了簡化，我們假設 prompt 已經是模型需要處理的完整輸入，
            // 並且 history 僅用於設定模型的初始上下文。
            // 如果要讓模型根據 history 進行對話，則每次 sendMessage 應該只傳遞最新的用戶訊息。

            // 修正：將 promptText 拆分為 history 和最新的用戶訊息
            // 由於 sendMessage 已經將用戶訊息加入 shortTermMemory，
            // 這裡應該只傳遞最新的用戶訊息給 chat.sendMessage。
            // 但目前的 prompt 參數是 `combinedPrompt`，包含了所有歷史。
            // 為了避免重複，我們需要調整 `sendMessage` 函數，使其只將最新的用戶訊息傳遞給 `getXAIResponse`。

            // 暫時先這樣處理，如果仍有問題，再回頭調整 `sendMessage` 的 `combinedPrompt` 邏輯。
            const result = await chat.sendMessage(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API 請求失敗:', error);
            console.error('API 請求錯誤詳情:', error.message, error.stack); // 增加詳細日誌
            console.error('API 請求配置:', {
                apiKey: this.apiKey,
                model: this.model,
                history: fullHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                }
            });
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
window.chatbot = new Chatbot();
