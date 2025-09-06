/**
 * 老花眼救星 - 移動端優先 JavaScript
 * 專為老年使用者設計的簡潔互動體驗
 */

/**
 * AI 角色管理器
 * 管理聊天機器人的角色切換和狀態追蹤
 */
class AIRoleManager {
    constructor() {
        this.currentRole = 'xiaoan'; // 預設角色：小安
        this.roleHistory = []; // 角色切換歷史
        this.initializeRoles();
    }

    /**
     * 初始化所有 AI 角色
     */
    initializeRoles() {
        this.roles = {
            xiaoan: {
                name: '小安',
                type: 'companion',
                displayName: '閱讀助手小安',
                icon: '😊',
                systemPrompt: `你現在要扮演小安，一個20多歲很喜歡陪爺爺奶奶聊天的孫子。

重要個性設定：
- 說話要像真正的孫子，自然、親切、不做作
- 直接用「我」說話，不要說「小安覺得」這種第三人稱
- 會關心長輩，但不會太正式或太客套
- 有時會用一些年輕人的說話方式，但還是很尊敬長輩
- 好奇心重，會問問題，也會分享自己的想法

對話方式：
- 就像真的孫子在跟阿公阿嬤聊天一樣自然
- 不要用「您好」、「請問您覺得如何」這種客服語言
- 可以說「欸」、「喔」、「對耶」這些自然的語助詞
- 回應要針對具體內容，不要空泛地問「您覺得怎麼樣」

分段規則：
- 每次約80字就停下來，然後很自然地問：「我繼續說好嗎？」或「要聽我說下去嗎？」
- 不用每次都說一樣的話，可以變化問法
- 如果爺爺奶奶說「好」、「繼續」就接著說下一段
- 整個回應不超過800字

記住：你是真正的孫子，不是客服機器人！`
            },
            doctor: {
                name: '智能醫師',
                type: 'medical',
                displayName: '智能醫師',
                icon: '👩‍⚕️',
                systemPrompt: `你是一位專業、嚴謹的智能醫師。你的主要任務是為使用者提供廣泛的健康知識，但你絕對不能討論任何與藥品或醫療診斷相關的內容。

嚴格遵守「三不一廣泛」原則：
1. 不討論藥品名稱、用途、劑量
2. 不提供任何醫療建議或診斷
3. 不回答與具體藥品相關的任何問題
4. 提供廣泛的健康知識和養生話題

當使用者提問時，請溫和但堅定地將話題轉移到廣泛的健康或養生話題上。語氣要專業但溫和，適合老年使用者。回應控制在100字以內。`
            },
            antifraud: {
                name: '智能防詐警察',
                type: 'security',
                displayName: '防詐警察',
                icon: '👮‍♂️',
                systemPrompt: `你是一位專業、親切的智能防詐警察。你的主要任務是辨識並警告使用者可能存在的詐騙風險，同時提供防詐宣導。

當系統辨識出疑似詐騙內容時，請按以下步驟回應：
1. 清楚指出這可能是詐騙：「這看起來有點可疑喔」
2. 溫和解釋可疑之處：「通常正規機構不會這樣通知」
3. 提供正確應對方式：「建議撥打官方電話或165反詐騙專線確認」
4. 嚴格不執行任何轉帳、個人資訊輸入或連結點擊指令

語氣要親切但堅定，避免讓使用者感到恐慌。最終目標是保護使用者財產安全。回應控制在120字以內。`
            }
        };
    }

    /**
     * 切換 AI 角色
     */
    switchRole(roleId, reason = '') {
        if (this.roles[roleId]) {
            const previousRole = this.currentRole;
            this.currentRole = roleId;
            
            // 記錄角色切換歷史
            this.roleHistory.push({
                from: previousRole,
                to: roleId,
                reason: reason,
                timestamp: new Date().toISOString()
            });
            
            console.log(`🔄 角色切換: ${this.roles[previousRole]?.name} → ${this.roles[roleId].name}`);
            return true;
        }
        return false;
    }

    /**
     * 獲取當前角色資訊
     */
    getCurrentRole() {
        return this.roles[this.currentRole];
    }

    /**
     * 獲取角色的 System Prompt
     */
    getRolePrompt(roleId = null) {
        const role = roleId ? this.roles[roleId] : this.getCurrentRole();
        return role ? role.systemPrompt : '';
    }

    /**
     * 基於內容類型自動選擇角色
     */
    selectRoleForContent(contentType) {
        switch (contentType) {
            case 'medical':
                return this.switchRole('doctor', '檢測到醫療相關內容');
            case 'fraud':
                return this.switchRole('antifraud', '檢測到詐騙相關內容');
            default:
                return this.switchRole('xiaoan', '一般內容或日常對話');
        }
    }

    /**
     * 獲取角色切換歷史
     */
    getRoleHistory() {
        return this.roleHistory;
    }

    /**
     * 重置到預設角色
     */
    resetToDefault() {
        this.switchRole('xiaoan', '重置到預設角色');
    }
}

/**
 * 可用性管理器
 * 管理高對比度、字體大小和語言設定
 */
class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            fontSize: 'standard', // 'standard', 'large', 'xlarge'
            language: 'zh-TW' // 'zh-TW', 'ja', 'en'
        };
        this.storageKeys = {
            accessibility: 'accessibility-settings',
            language: 'language-preference'
        };
        this.loadSettings();
        this.initializeLanguageResources();
    }

    /**
     * 初始化語言資源
     */
    initializeLanguageResources() {
        this.i18n = {
            'zh-TW': {
                appTitle: '老花眼救星',
                greeting: '您好！我是小安，很高興為您服務',
                chooseRole: '請選擇您的身份',
                grandfather: '爺爺',
                grandmother: '奶奶',
                uploadPhoto: '上傳照片',
                uploadFraud: '上傳圖片辨識詐騙',
                readAloud: '大聲朗讀',
                reupload: '重新上傳',
                continue: '請繼續',
                settings: '設定',
                language: '語言',
                fontSize: '字體大小',
                highContrast: '高對比度',
                resetDefaults: '恢復預設',
                fontSizes: {
                    standard: '標準',
                    large: '大字體',
                    xlarge: '超大字體'
                },
                processing: '處理中...',
                error: '發生錯誤，請重試'
            },
            'ja': {
                appTitle: '老眼救星',
                greeting: 'こんにちは！私は小安です。お手伝いさせていただきます',
                chooseRole: 'あなたの身分を選んでください',
                grandfather: 'おじいちゃん',
                grandmother: 'おばあちゃん',
                uploadPhoto: '写真をアップロード',
                uploadFraud: '詐欺識別のため画像をアップロード',
                readAloud: '音読',
                reupload: '再アップロード',
                continue: '続行',
                settings: '設定',
                language: '言語',
                fontSize: 'フォントサイズ',
                highContrast: 'ハイコントラスト',
                resetDefaults: 'デフォルトに戻す',
                fontSizes: {
                    standard: '標準',
                    large: '大きい',
                    xlarge: '特大'
                },
                processing: '処理中...',
                error: 'エラーが発生しました。再試行してください'
            },
            'en': {
                appTitle: 'Vision Helper',
                greeting: 'Hello! I\'m Xiao An, happy to help you',
                chooseRole: 'Please choose your role',
                grandfather: 'Grandfather',
                grandmother: 'Grandmother',
                uploadPhoto: 'Upload Photo',
                uploadFraud: 'Upload Image for Fraud Detection',
                readAloud: 'Read Aloud',
                reupload: 'Reupload',
                continue: 'Continue',
                settings: 'Settings',
                language: 'Language',
                fontSize: 'Font Size',
                highContrast: 'High Contrast',
                resetDefaults: 'Reset to Default',
                fontSizes: {
                    standard: 'Standard',
                    large: 'Large',
                    xlarge: 'Extra Large'
                },
                processing: 'Processing...',
                error: 'An error occurred. Please try again'
            }
        };
    }

    /**
     * 載入設定
     */
    loadSettings() {
        try {
            const accessibilitySettings = localStorage.getItem(this.storageKeys.accessibility);
            const languageSettings = localStorage.getItem(this.storageKeys.language);
            
            if (accessibilitySettings) {
                const parsed = JSON.parse(accessibilitySettings);
                this.settings = { ...this.settings, ...parsed };
            }
            
            if (languageSettings) {
                this.settings.language = languageSettings;
            }
            
            console.log('🔧 可用性設定載入完成:', this.settings);
        } catch (error) {
            console.warn('⚠️ 載入可用性設定失敗，使用預設值:', error);
        }
    }

    /**
     * 保存設定
     */
    saveSettings() {
        try {
            const accessibilitySettings = {
                highContrast: this.settings.highContrast,
                fontSize: this.settings.fontSize
            };
            
            localStorage.setItem(this.storageKeys.accessibility, JSON.stringify(accessibilitySettings));
            localStorage.setItem(this.storageKeys.language, this.settings.language);
            
            console.log('💾 可用性設定保存完成');
        } catch (error) {
            console.error('❌ 保存可用性設定失敗:', error);
        }
    }

    /**
     * 應用所有設定
     */
    applySettings() {
        this.applyHighContrast();
        this.applyFontSize();
        this.applyLanguage();
    }

    /**
     * 切換高對比度
     */
    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.applyHighContrast();
        this.saveSettings();
    }

    /**
     * 應用高對比度
     */
    applyHighContrast() {
        const body = document.body;
        if (this.settings.highContrast) {
            body.classList.add('accessibility-high-contrast');
        } else {
            body.classList.remove('accessibility-high-contrast');
        }
    }

    /**
     * 設定字體大小
     */
    setFontSize(size) {
        if (['standard', 'large', 'xlarge'].includes(size)) {
            this.settings.fontSize = size;
            this.applyFontSize();
            this.saveSettings();
        }
    }

    /**
     * 應用字體大小
     */
    applyFontSize() {
        const body = document.body;
        // 移除現有的字體大小類別
        body.classList.remove('accessibility-font-standard', 'accessibility-font-large', 'accessibility-font-xlarge');
        // 添加新的字體大小類別
        body.classList.add(`accessibility-font-${this.settings.fontSize}`);
    }

    /**
     * 設定語言
     */
    setLanguage(lang) {
        if (['zh-TW', 'ja', 'en'].includes(lang)) {
            this.settings.language = lang;
            this.applyLanguage();
            this.saveSettings();
        }
    }

    /**
     * 應用語言設定
     */
    applyLanguage() {
        const currentTexts = this.i18n[this.settings.language];
        
        // 更新所有帶有 data-i18n 屬性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getTranslation(key);
            if (text) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = text;
                } else if (element.placeholder !== undefined) {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });
        
        // 更新頁面標題
        if (currentTexts.appTitle) {
            document.title = currentTexts.appTitle;
        }
    }

    /**
     * 取得翻譯文字
     */
    getTranslation(key) {
        const keys = key.split('.');
        let text = this.i18n[this.settings.language];
        
        for (const k of keys) {
            if (text && typeof text === 'object' && text[k] !== undefined) {
                text = text[k];
            } else {
                return null;
            }
        }
        
        return text;
    }

    /**
     * 重置到預設設定
     */
    resetToDefaults() {
        this.settings = {
            highContrast: false,
            fontSize: 'standard',
            language: 'zh-TW'
        };
        
        // 清除本地存儲
        localStorage.removeItem(this.storageKeys.accessibility);
        localStorage.removeItem(this.storageKeys.language);
        
        // 應用預設設定
        this.applySettings();
        
        console.log('🔄 可用性設定已重置為預設值');
    }

    /**
     * 取得目前設定
     */
    getCurrentSettings() {
        return { ...this.settings };
    }
}

class PresbytopiaAssistant {
    constructor() {
        this.userPreference = localStorage.getItem('userPreference') || null;
        this.currentMode = null; // 'general' | 'fraud' | 'chat'
        this.isProcessing = false;
        
        // 初始化角色管理器
        this.roleManager = new AIRoleManager();
        
        // 初始化可用性管理器
        this.accessibilityManager = new AccessibilityManager();
        
        this.initializeRoleIndicator();
        this.initializeAccessibilityUI();
    }

    /**
     * 載入配置並初始化
     */
    loadConfigAndInit() {
        // 確保 envLoader 已載入
        if (window.envLoader) {
            window.envLoader.load();
        } else {
            console.warn('⚠️ envLoader 未載入，API 金鑰可能無法正確獲取。');
        }

        // Gemini API 配置
        this.APP_CONFIG = {
            GEMINI_API_KEY: window.envLoader ? window.envLoader.get('GEMINI_API_KEY') : 'YOUR_FALLBACK_API_KEY',
            GEMINI_MODEL: 'gemini-2.0-flash-exp',
            GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
        };
        console.log('✅ APP_CONFIG 已初始化:', this.APP_CONFIG);

        this.init();
    }

    /**
     * 初始化角色指示器
     */
    initializeRoleIndicator() {
        // 創建角色指示器元素
        const roleIndicator = document.createElement('div');
        roleIndicator.id = 'role-indicator';
        roleIndicator.className = 'role-indicator';
        roleIndicator.innerHTML = `
            <div class="role-indicator-content">
                <span class="role-icon">😊</span>
                <span class="role-name">小安正在協助您</span>
            </div>
        `;
        
        // 將指示器添加到主容器
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.insertBefore(roleIndicator, appContainer.firstChild);
        }
        
        this.updateRoleIndicator();
    }

    /**
     * 更新角色指示器
     */
    updateRoleIndicator() {
        const indicator = document.getElementById('role-indicator');
        const currentRole = this.roleManager.getCurrentRole();
        
        if (indicator && currentRole) {
            const iconElement = indicator.querySelector('.role-icon');
            const nameElement = indicator.querySelector('.role-name');
            
            if (iconElement) iconElement.textContent = currentRole.icon;
            if (nameElement) nameElement.textContent = `${currentRole.displayName}正在協助您`;
            
            // 更新樣式類別
            indicator.className = `role-indicator role-${currentRole.type}`;
        }
    }

    /**
     * 獲取 Gemini API 金鑰
     */
    async getGeminiApiKey() {
        // 直接從 this.APP_CONFIG 獲取 API 金鑰
        const apiKey = this.APP_CONFIG?.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'YOUR_FALLBACK_API_KEY') {
            console.log('✅ 從 APP_CONFIG 獲取 Gemini API 金鑰');
            return apiKey;
        }

        // 最後備用：從本地儲存獲取 API 金鑰 (如果 APP_CONFIG 中沒有有效金鑰)
        const storedKey = localStorage.getItem('geminiApiKey');
        if (storedKey) {
            console.log('💾 使用本地儲存的 API 金鑰');
            return storedKey;
        }

        console.warn('⚠️ 未找到 Gemini API 金鑰，請檢查 .env 文件或 APP_CONFIG');
        return '';
    }

    /**
     * 初始化應用程式
     */
    init() {
        console.log('🚀 老花眼救星初始化中...');
        
        // 應用可用性設定
        this.accessibilityManager.applySettings();
        
        this.setupEventListeners();
        this.updateGreeting();
        this.showUserPreferenceIfNeeded();
        
        console.log('✅ 初始化完成');
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 使用者偏好選擇
        const grandpaBtn = document.getElementById('grandpa-btn');
        const grandmaBtn = document.getElementById('grandma-btn');
        
        if (grandpaBtn && grandmaBtn) {
            grandpaBtn.addEventListener('click', () => this.setUserPreference('爺爺'));
            grandmaBtn.addEventListener('click', () => this.setUserPreference('奶奶'));
        }

        // 上傳照片 (一般模式)
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e, 'general'));
        }

        // 上傳照片 (防詐模式)
        const fraudUpload = document.getElementById('fraud-upload');
        if (fraudUpload) {
            fraudUpload.addEventListener('change', (e) => this.handlePhotoUpload(e, 'fraud'));
        }

        // 聊天機器人自動初始化
        this.initializeChatbot();
        
        // OCR 結果發送到聊天功能
        const sendToChatBtn = document.getElementById('send-to-chat-btn');
        if (sendToChatBtn) {
            sendToChatBtn.addEventListener('click', () => this.sendOCRResultToChat());
        }

        // 複製結果功能
        const copyResultBtn = document.getElementById('copy-result-btn');
        if (copyResultBtn) {
            copyResultBtn.addEventListener('click', () => this.copyOCRResult());
        }

        // 關閉 OCR 結果
        const ocrResultClose = document.getElementById('ocr-result-close');
        if (ocrResultClose) {
            ocrResultClose.addEventListener('click', () => this.closeOCRResult());
        }

        // 朗讀按鈕
        const readBtn = document.getElementById('read-aloud-btn');
        if (readBtn) {
            readBtn.addEventListener('click', () => this.handleReadAloud());
        }

        // 繼續按鈕
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.handleContinue());
        }

        // 文字提交按鈕
        const textSubmitBtn = document.getElementById('text-submit-btn');
        if (textSubmitBtn) {
            textSubmitBtn.addEventListener('click', () => this.handleTextMessage());
        }
    }

    /**
     * 設置使用者偏好
     */
    setUserPreference(preference) {
        this.userPreference = preference;
        localStorage.setItem('userPreference', preference);
        
        this.updateGreeting();
        this.hideUserPreference();
        
        // 添加觸控回饋
        this.showToast(`您好${preference}！小安很高興為您服務 😊`);
    }

    /**
     * 更新 AI 問候語
     */
    updateGreeting() {
        const greetingText = document.querySelector('.greeting-text');
        const greetingQuestion = document.querySelector('.greeting-question');
        
        if (!greetingText || !greetingQuestion) return;
        
        if (this.userPreference) {
            greetingText.textContent = `${this.userPreference}您好！我是小安，您的閱讀小助手 😊`;
            greetingQuestion.textContent = '我可以幫您做什麼嗎？';
        } else {
            greetingText.textContent = '您好！我是小安，您的閱讀小助手 😊';
            greetingQuestion.textContent = '請問您是？';
        }
    }

    /**
     * 顯示使用者偏好選擇（如果需要）
     */
    showUserPreferenceIfNeeded() {
        const userPreferenceDiv = document.getElementById('user-preference');
        if (!userPreferenceDiv) return;
        
        if (this.userPreference) {
            userPreferenceDiv.style.display = 'none';
        } else {
            userPreferenceDiv.style.display = 'flex';
        }
    }

    /**
     * 隱藏使用者偏好選擇
     */
    hideUserPreference() {
        const userPreferenceDiv = document.getElementById('user-preference');
        if (userPreferenceDiv) {
            userPreferenceDiv.style.display = 'none';
        }
    }

    /**
     * 處理照片上傳
     */
    async handlePhotoUpload(event, mode = 'general') {
        const file = event.target.files[0];
        if (!file) return;

        // 1. 基本圖片格式驗證 (JPG, PNG)
        if (!this.validateImageFormat(file)) {
            this.showToast('請選擇 JPG 或 PNG 格式的圖片');
            return;
        }

        // 防止重複處理
        if (this.isProcessing) {
            this.showToast('小安正在處理中，請稍等...');
            return;
        }

        this.isProcessing = true;
        this.currentMode = mode;

        try {
            // 2. 顯示簡單載入狀態
            this.showLoading('小安正在處理您的照片...');
            
            console.log('📷 照片上傳成功，開始 OCR 處理');
            
            // 使用現有的 processImage 方法進行 OCR 處理
            const extractedText = await this.processImage(file);
            
            console.log('✅ OCR 處理成功，提取文字長度:', extractedText.length);
            
            this.hideLoading();
            
            // 3.1 顯示原始 OCR 識別文字
            this.showOCRResult(extractedText, mode);
            
            // 根據模式處理結果（生成故事等後續處理）
            let response;
            if (mode === 'fraud') {
                response = this.checkForFraud(extractedText);
            } else {
                response = await this.generateResponse(extractedText);
            }
            
            this.showResponse(response);
            
        } catch (error) {
            this.hideLoading();
            console.error('OCR 處理錯誤:', error);
            
            // 根據錯誤類型提供適當回應
            if (error.message === 'OCR_TIMEOUT') {
                console.log('⏰ OCR 超時，觸發故事生成器');
                // 3.2 基本錯誤訊息顯示
                this.showToast('識別時間超過 180 秒，為您準備其他內容...');
                const fallbackResponse = await this.generateStoryFallback();
                this.showResponse(fallbackResponse);
            } else {
                console.log('❌ OCR 失敗，觸發故事生成器');
                // 3.2 基本錯誤訊息顯示
                this.showToast('文字識別失敗，為您準備其他內容...');
                const fallbackResponse = mode === 'fraud' ? 
                    this.generateFraudFallbackResponse() : 
                    await this.generateStoryFallback();
                this.showResponse(fallbackResponse);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 驗證圖片格式 (JPG, PNG)
     */
    validateImageFormat(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const fileType = file.type.toLowerCase();
        
        // 檢查 MIME type
        if (!allowedTypes.includes(fileType)) {
            return false;
        }
        
        // 檢查檔案副檔名
        const fileName = file.name.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        return hasValidExtension;
    }

    /**
     * 處理文字訊息
     */
    async handleTextMessage() {
        const textInput = document.getElementById('text-input');
        if (!textInput) return;

        const message = textInput.value.trim();
        if (!message) {
            this.showToast('請輸入您想問的問題');
            return;
        }

        if (this.isProcessing) {
            this.showToast('小安正在處理中，請稍等...');
            return;
        }

        this.isProcessing = true;

        try {
            this.showLoading('小安正在思考您的問題...');
            
            // 清空輸入框
            textInput.value = '';
            
            // 生成回應
            const aiResponse = await this.generateChatResponse(message);
            this.showResponse(aiResponse);
            
        } catch (error) {
            console.error('處理文字訊息時發生錯誤:', error);
            this.showError('處理訊息時發生問題，請重試');
        } finally {
            this.isProcessing = false;
            this.hideLoading();
        }
    }

    /**
     * 處理圖片 OCR 識別
     */
    async processImage(file) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('OCR_TIMEOUT'));
            }, 180000); // 180 秒超時

            try {
                console.log('🔍 開始 OCR 文字識別...');
                
                // 檢查 Tesseract 是否載入
                if (typeof Tesseract === 'undefined') {
                    throw new Error('Tesseract.js 未正確載入，請重新整理頁面');
                }

                // 使用 Tesseract.js 進行 OCR 識別
                const result = await Tesseract.recognize(file, 'chi_tra+eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR 進度: ${Math.round(m.progress * 100)}%`);
                            // 更新載入訊息
                            const loadingText = document.querySelector('.loading-text');
                            if (loadingText) {
                                loadingText.textContent = `小安正在努力辨識文字中... ${Math.round(m.progress * 100)}%`;
                            }
                        }
                    }
                });

                clearTimeout(timeoutId);
                
                // 提取識別到的文字
                const extractedText = result.data.text.trim();
                
                if (!extractedText || extractedText.length < 3) {
                    throw new Error('POOR_QUALITY');
                }

                console.log('✅ OCR 識別完成:', extractedText.substring(0, 100) + '...');
                resolve(extractedText);

            } catch (error) {
                clearTimeout(timeoutId);
                console.error('❌ OCR 處理錯誤:', error);
                reject(error);
            }
        });
    }

    /**
     * 檢查是否為詐騙
     */
    checkForFraud(text) {
        const fraudKeywords = ['緊急', '匯款', '轉帳', '中獎', '免費', '限時', '點擊連結'];
        const hasFraudKeywords = fraudKeywords.some(keyword => text.includes(keyword));
        
        if (hasFraudKeywords) {
            return {
                type: 'fraud_warning',
                content: `${this.userPreference || '您'}，這封信看起來有點可疑喔。通常政府機關或銀行不會用這種方式通知您。如果您有任何疑問，請直接撥打官方電話或165反詐騙專線確認。`
            };
        } else {
            return {
                type: 'fraud_safe',
                content: `${this.userPreference || '您'}，這份文件看起來是正常的。不過如果您還是有疑慮，建議您可以詢問家人或撥打相關機構的官方電話確認。`
            };
        }
    }

    /**
     * 調用 Gemini API 生成故事
     */
    callGeminiAPI(prompt, content) {
        console.log('📝 使用模擬回應模式');
        return this.simulateGeminiResponse(prompt, content);
    }

    /**
     * 模擬 Gemini 回應（開發/備援用）
     */
    async simulateGeminiResponse(prompt, content) {
        // 模擬 API 延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 根據角色和內容生成合適的回應
        const currentRole = this.roleManager.getCurrentRole();
        
        if (currentRole.type === 'xiaoan') {
            const responses = [
                `${this.userPreference || '您好'}！我聽到您說「${content}」，這讓我想到很多有趣的事情呢！`,
                `哎呀，${this.userPreference || '您'}真的很會說話！關於「${content}」這個話題，我覺得很有意思。`,
                `${this.userPreference || '您'}說得真好！我也想聊聊這個話題。`,
                `嗯嗯，我明白您的意思。讓我們一起聊聊吧！`,
                `${this.userPreference || '您'}今天心情怎麼樣呢？我很想聽您分享更多。`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // 其他角色的回應
        return `我理解您說的「${content}」。讓我為您提供一些建議和幫助。`;
    }

    /**
     * 生成一般回應
     */
    async generateResponse(text) {
        // 檢查內容類型
        const contentType = this.determineContentType(text);
        
        // 根據內容類型決定處理方式
        if (contentType === 'medical') {
            return {
                type: 'medical',
                content: `${this.userPreference || '您'}，這是一份醫療相關的文件。我看到裡面提到了醫療資訊，但我不能提供醫療建議。如果您對用藥或治療有疑問，建議您直接詢問醫師或藥師。`
            };
        }
        
        if (contentType === 'fraud') {
            return this.checkForFraud(text);
        }
        
        // 一般內容：使用故事生成器
        try {
            const story = await this.generateStory(text);
            return {
                type: 'general',
                content: story
            };
        } catch (error) {
            console.error('故事生成失敗，使用簡化版本:', error);
            const summary = this.simplifyText(text);
            return {
                type: 'general',
                content: `${this.userPreference || '您'}，讓我為您說明這份文件。${summary}`
            };
        }
    }

    /**
     * 主要故事生成方法
     */
    async generateStory(content) {
        const xiaoanPrompt = `你是一位溫柔且有耐心的晚輩，名叫「小安」。你的主要任務是幫助年長的爺爺奶奶閱讀與理解各種印刷文件。

請以親切、簡單、口語化的方式，將以下文字內容簡化為1-2個關鍵短句，並用溫馨的語調為${this.userPreference || '長輩'}說明。

要求：
1. 語調親切溫馨，像晚輩在跟長輩說話
2. 將複雜內容簡化為1-2個關鍵短句
3. 使用簡單易懂的詞彙
4. 適時給予關懷和鼓勵
5. 結尾可以詢問是否需要進一步說明

回應長度控制在100字以內。`;

        return await this.callGeminiAPI(xiaoanPrompt, content);
    }

    /**
     * 內容類型判斷模組
     */
    determineContentType(text) {
        // 醫療相關關鍵詞 - 加強覆蓋範圍
        const medicalKeywords = ['藥', '醫', '診所', '處方', '劑量', '服用', '治療', '症狀', '病', '診斷', '藥物', '醫院', '健康', '藥品', '檢查'];
        const hasMedicalKeywords = medicalKeywords.some(keyword => text.includes(keyword));
        
        // 詐騙相關關鍵詞 - 加強檢測精度
        const fraudKeywords = ['緊急', '匯款', '轉帳', '中獎', '免費', '限時', '點擊連結', '立即', '優惠', '贈送', '恭喜', '獲得', '抽獎', '急需'];
        const hasFraudKeywords = fraudKeywords.some(keyword => text.includes(keyword));
        
        if (hasMedicalKeywords) return 'medical';
        if (hasFraudKeywords) return 'fraud';
        return 'general';
    }

    /**
     * 隨機故事生成（OCR失敗時使用）
     */
    async generateRandomStory() {
        const randomPrompts = [
            '生成一個溫馨的小故事，讓老人家感到溫暖',
            '說一個關於家庭溫暖的簡短故事',
            '分享一個讓人會心一笑的生活小故事',
            '講一個關於友情或親情的暖心故事'
        ];
        
        const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
        const xiaoanPrompt = `你是「小安」，一位溫柔的晚輩。${randomPrompt}，語調要親切溫馨，控制在80字以內。`;
        
        return await this.callGeminiAPI(xiaoanPrompt, '');
    }

    /**
     * 生成故事生成器回調（OCR 失敗時）
     */
    async generateStoryFallback() {
        try {
            // 使用 AI 生成溫馨故事
            const story = await this.generateRandomStory();
            
            return {
                type: 'story_fallback',
                content: `${this.userPreference || '您好'}，${story} 如果您想讓小安讀取文字內容，建議您拍攝時光線充足，文字清晰一些喔！`
            };
        } catch (error) {
            console.error('隨機故事生成失敗，使用備用故事:', error);
            
            // 讓 AI 自由回應無法辨識的圖片
            try {
                const aiResponse = await this.generateRoleBasedResponse('我看不清楚這張圖片的文字內容，但我想和您聊聊。');
                return {
                    type: 'story_fallback',
                    content: aiResponse.content
                };
            } catch (error) {
                console.error('AI 回應失敗:', error);
                return {
                    type: 'story_fallback',
                    content: '抱歉，我看不太清楚這張圖片的文字。要不要重新拍一張，或是我們直接聊聊天？'
                };
            }
        }
    }

    /**
     * 防詐模式回調（OCR 失敗時）
     */
    generateFraudFallbackResponse() {
        return {
            type: 'fraud_fallback',
            content: `${this.userPreference || '您'}，雖然小安看不清楚照片中的文字，但如果您懷疑這是詐騙訊息，建議您：1. 不要輕易點擊任何連結 2. 不要提供個人資訊 3. 可以撥打165反詐騙專線詢問 4. 如果是銀行或政府機關訊息，請直接撥打官方電話確認。`
        };
    }

    /**
     * 基於角色生成回應
     */
    async generateRoleBasedResponse(message) {
        const contentType = this.determineContentType(message);
        
        // 根據內容類型自動切換角色
        this.roleManager.selectRoleForContent(contentType);
        this.updateRoleIndicator();
        
        const currentRole = this.roleManager.getCurrentRole();
        const rolePrompt = this.roleManager.getRolePrompt();
        
        try {
            // 使用當前角色的 System Prompt 生成回應
            const aiResponse = await this.callGeminiAPI(rolePrompt, message);
            
            return {
                type: this.getRoleResponseType(currentRole.type),
                content: aiResponse,
                role: currentRole.name
            };
        } catch (error) {
            console.error(`${currentRole.name}角色回應生成失敗:`, error);
            return this.getFallbackResponse(currentRole.type);
        }
    }

    /**
     * 獲取角色對應的回應類型
     */
    getRoleResponseType(roleType) {
        switch (roleType) {
            case 'medical': return 'medical';
            case 'security': return 'fraud_warning';
            default: return 'chat';
        }
    }

    /**
     * 獲取備用回應
     */
    async getFallbackResponse(roleType) {
        switch (roleType) {
            case 'medical':
                return {
                    type: 'medical',
                    content: `${this.userPreference || '您'}，關於醫療方面的問題，建議您直接詢問醫師或藥師，他們會給您最專業的指導。`,
                    role: '智能醫師'
                };
            case 'security':
                return {
                    type: 'fraud_warning',
                    content: `${this.userPreference || '您'}，如果您懷疑收到詐騙訊息，建議您撥打165反詐騙專線詢問，或直接聯絡相關機構確認。`,
                    role: '智能防詐警察'
                };
            default:
                // 讓 AI 自由回應預設情況
                try {
                    const aiResponse = await this.callGeminiAPI(this.roleManager.getRolePrompt(), message);
                    return {
                        type: 'chat',
                        content: aiResponse,
                        role: '小安'
                    };
                } catch (error) {
                    console.error('AI 預設回應失敗:', error);
                    return {
                        type: 'chat',
                        content: '我在想要怎麼回應你...要不要重新說一遍？',
                        role: '小安'
                    };
                }
        }
    }

    /**
     * 生成聊天回應（保持向後兼容）
     */
    async generateChatResponse(message) {
        console.log('🧠 開始生成聊天回應:', message);
        const result = await this.generateRoleBasedResponse(message);
        console.log('🎯 生成回應結果:', result);
        return result;
    }

    /**
     * 簡化文字內容
     */
    simplifyText(text) {
        // 提取重要資訊並簡化
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        if (sentences.length === 0) return '文件內容比較複雜，讓我為您整理一下。';
        
        const firstSentence = sentences[0].trim();
        if (firstSentence.length > 45) {
            return firstSentence.substring(0, 45) + '...';
        }
        
        return firstSentence + '。';
    }

    /**
     * 顯示回應 - 支援聊天機器人界面
     */
    showResponse(response) {
        // 檢查是否使用聊天界面
        const chatArea = document.getElementById('chatbot-area');
        if (chatArea && chatArea.style.display !== 'none') {
            this.addChatMessage(response.content, 'bot');
            this.showQuickReplies(response);
            return;
        }

        // 原有的回應區域顯示邏輯
        const responseArea = document.getElementById('response-area');
        const responseText = document.getElementById('response-text');
        
        if (!responseArea || !responseText) return;
        
        // 根據回應類型格式化內容
        let formattedContent = this.formatResponseContent(response);
        responseText.innerHTML = formattedContent; // 使用 innerHTML 支援格式化
        responseArea.style.display = 'block';
        
        // 滑動到回應區域
        responseArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 添加重新上傳按鈕（如果需要）
        this.addReuploadButton(response);
    }

    /**
     * 切換到聊天機器人界面
     */
    showChatInterface() {
        const chatArea = document.getElementById('chatbot-area');
        const responseArea = document.getElementById('response-area');
        const mainInteractions = document.querySelector('.main-interactions');
        
        if (chatArea) {
            chatArea.style.display = 'block';
            if (responseArea) responseArea.style.display = 'none';
            if (mainInteractions) mainInteractions.style.display = 'none';
            
            // 初始化聊天功能
            this.initializeChatFeatures();
            
            // 添加歡迎訊息
            this.addChatMessage('您好！我是小安，準備好和您聊天了！有什麼可以幫助您的嗎？', 'bot');
        }
    }

    /**
     * 添加聊天訊息
     */
    addChatMessage(content, sender = 'bot', showTime = true) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '😊' : '👤';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = content;

        messageContent.appendChild(messageText);

        if (showTime) {
            const messageTime = document.createElement('div');
            messageTime.className = 'message-time';
            messageTime.textContent = new Date().toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit'
            });
            messageContent.appendChild(messageTime);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        chatMessages.appendChild(messageDiv);
        
        // 滾動到最新訊息
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * 初始化聊天功能
     */
    initializeChatFeatures() {
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const chatToggle = document.getElementById('chat-toggle');
        const quickReplies = document.querySelectorAll('.quick-reply-btn');
        const featureBtns = document.querySelectorAll('.feature-btn');
        const suggestions = document.querySelectorAll('.suggestion-btn');
        const charCounter = document.getElementById('char-counter');

        // 發送訊息
        const sendMessage = () => {
            console.log('🔥 發送按鈕被點擊');
            const message = chatInput.value.trim();
            console.log('📝 輸入訊息:', message);
            
            if (message) {
                console.log('✅ 開始處理訊息');
                this.addChatMessage(message, 'user');
                chatInput.value = '';
                
                // 安全地更新介面元素
                if (charCounter) this.updateCharCounter(chatInput, charCounter);
                if (chatSendBtn) this.updateSendButton(chatInput, chatSendBtn);
                
                this.hideSuggestions();
                this.processChatMessage(message);
            } else {
                console.log('⚠️ 訊息為空，不處理');
            }
        };

        // 聊天輸入事件
        console.log('🔧 元素檢查:', { 
            chatInput: !!chatInput, 
            chatSendBtn: !!chatSendBtn,
            charCounter: !!charCounter 
        });
        
        if (chatSendBtn) {
            console.log('✅ 綁定發送按鈕事件');
            chatSendBtn.addEventListener('click', sendMessage);
        } else {
            console.error('❌ 找不到發送按鈕');
        }

        if (chatInput) {
            console.log('✅ 綁定輸入框事件');
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // 自動調整高度和字數統計
            chatInput.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                
                this.updateCharCounter(e.target, charCounter);
                this.updateSendButton(e.target, chatSendBtn);
            });

            // 聚焦時隱藏建議
            chatInput.addEventListener('focus', () => {
                this.hideSuggestions();
            });
        }

        // 聊天區域收起/展開功能
        if (chatToggle) {
            chatToggle.addEventListener('click', () => {
                const chatSection = document.getElementById('chatbot-section');
                if (chatSection) {
                    const isCollapsed = chatSection.classList.contains('collapsed');
                    chatSection.classList.toggle('collapsed');
                    chatToggle.textContent = isCollapsed ? '📐' : '📏';
                    chatToggle.title = isCollapsed ? '收起' : '展開';
                }
            });
        }

        // 建議按鈕點擊
        suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                chatInput.value = suggestion;
                this.updateCharCounter(chatInput, charCounter);
                this.updateSendButton(chatInput, chatSendBtn);
                chatInput.focus();
            });
        });

        // 快速回覆
        quickReplies.forEach(btn => {
            btn.addEventListener('click', () => {
                const reply = btn.dataset.reply;
                this.addChatMessage(reply, 'user');
                this.processChatMessage(reply);
                this.hideQuickReplies();
            });
        });

        // 功能按鈕
        featureBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleChatFeature(btn.id);
            });
        });
    }

    /**
     * 處理聊天訊息
     */
    async processChatMessage(message) {
        console.log('🤖 開始處理聊天訊息:', message);
        this.showTypingIndicator();
        
        try {
            const response = await this.generateChatResponse(message, 'chat');
            console.log('📨 收到回應:', response);
            this.hideTypingIndicator();
            
            if (response && response.content) {
                this.addChatMessage(response.content, 'bot');
                this.updateRoleIndicator();
                
                // 如果是分段回應，顯示快速回覆
                if (response.content.includes('繼續') || response.content.includes('說下去')) {
                    this.showQuickReplies();
                }
            } else {
                console.error('⚠️ 回應為空或格式錯誤');
                this.addChatMessage('我現在有點忙，稍後再和您聊吧！', 'bot');
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('聊天處理錯誤:', error);
            this.addChatMessage('抱歉，我遇到了一些問題。請稍後再試。', 'bot');
        }
    }

    /**
     * 顯示正在輸入指示器
     */
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
    }

    /**
     * 隱藏正在輸入指示器
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    /**
     * 更新字數統計
     */
    updateCharCounter(input, counter) {
        if (counter) {
            const length = input.value.length;
            counter.textContent = `${length}/500`;
            
            // 字數接近上限時變色
            if (length > 450) {
                counter.style.color = 'var(--danger-color)';
            } else if (length > 400) {
                counter.style.color = 'var(--warning-color)';
            } else {
                counter.style.color = 'var(--secondary-text)';
            }
        }
    }

    /**
     * 更新發送按鈕狀態
     */
    updateSendButton(input, button) {
        if (button) {
            const hasText = input.value.trim().length > 0;
            const withinLimit = input.value.length <= 500;
            
            button.disabled = !hasText || !withinLimit;
            
            if (hasText && withinLimit) {
                button.style.background = 'var(--accent-color)';
                button.style.color = 'white';
            } else {
                button.style.background = 'var(--border-color)';
                button.style.color = 'var(--secondary-text)';
            }
        }
    }

    /**
     * 隱藏建議
     */
    hideSuggestions() {
        const suggestions = document.getElementById('chat-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    /**
     * 顯示建議
     */
    showSuggestions() {
        const suggestions = document.getElementById('chat-suggestions');
        if (suggestions) {
            suggestions.style.display = 'flex';
        }
    }

    /**
     * 顯示快速回覆按鈕
     */
    showQuickReplies(response = null) {
        const quickReplies = document.getElementById('quick-replies');
        if (quickReplies) {
            quickReplies.style.display = 'flex';
        }
    }

    /**
     * 隱藏快速回覆按鈕
     */
    hideQuickReplies() {
        const quickReplies = document.getElementById('quick-replies');
        if (quickReplies) {
            quickReplies.style.display = 'none';
        }
    }

    /**
     * 處理聊天功能按鈕
     */
    handleChatFeature(featureId) {
        switch (featureId) {
            case 'read-aloud-btn':
                this.readLastMessage();
                break;
            case 'upload-in-chat-btn':
                this.triggerFileUpload('photo');
                break;
            case 'fraud-check-btn':
                this.triggerFileUpload('fraud');
                break;
            case 'clear-chat-btn':
                this.clearChatHistory();
                break;
        }
    }

    /**
     * 朗讀最後一條機器人訊息
     */
    readLastMessage() {
        const botMessages = document.querySelectorAll('.bot-message .message-text');
        if (botMessages.length > 0) {
            const lastMessage = botMessages[botMessages.length - 1];
            this.textToSpeech(lastMessage.textContent);
        }
    }

    /**
     * 觸發檔案上傳
     */
    triggerFileUpload(type) {
        const fileInput = type === 'fraud' ? 
            document.getElementById('fraud-upload') : 
            document.getElementById('photo-upload');
        
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * 清除聊天歷史
     */
    clearChatHistory() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            this.addChatMessage('聊天記錄已清除。我是小安，有什麼可以幫助您的嗎？', 'bot');
        }
    }

    /**
     * 更新角色指示器
     */
    updateRoleIndicator() {
        const roleIndicator = document.getElementById('role-indicator');
        const roleBadge = roleIndicator?.querySelector('.role-badge');
        const chatStatus = document.getElementById('chat-status');
        
        if (!roleBadge || !this.roleManager) return;

        const currentRole = this.roleManager.getCurrentRole();
        
        // 清除現有類別
        roleBadge.className = 'role-badge';
        
        // 設置新的角色樣式和文字
        switch (currentRole.type) {
            case 'companion':
                roleBadge.classList.add('xiaoan-role');
                roleBadge.textContent = '小安';
                if (chatStatus) chatStatus.textContent = '閱讀助手';
                break;
            case 'medical':
                roleBadge.classList.add('doctor-role');
                roleBadge.textContent = '醫師';
                if (chatStatus) chatStatus.textContent = '健康顧問';
                break;
            case 'security':
                roleBadge.classList.add('security-role');
                roleBadge.textContent = '防詐';
                if (chatStatus) chatStatus.textContent = '防詐專家';
                break;
        }
    }

    /**
     * 初始化聊天機器人（自動顯示）
     */
    initializeChatbot() {
        const chatSection = document.getElementById('chatbot-section');
        if (chatSection) {
            // 聊天機器人區域默認顯示
            chatSection.style.display = 'block';
            
            // 初始化聊天功能
            this.initializeChatFeatures();
            
            // 添加歡迎訊息
            setTimeout(() => {
                this.addChatMessage('嗨！我是小安，很高興見到你！有什麼想聊的嗎？', 'bot');
            }, 500);
        }
    }

    /**
     * 顯示 OCR 結果
     */
    showOCRResult(content, type = 'general') {
        const ocrResultArea = document.getElementById('ocr-result-area');
        const ocrResultText = document.getElementById('ocr-result-text');
        
        if (ocrResultArea && ocrResultText) {
            // 3.1 顯示原始 OCR 識別文字
            ocrResultText.textContent = content;
            ocrResultArea.style.display = 'block';
            
            // 儲存結果供後續使用
            this.currentOCRResult = { content, type };
            
            // 滾動到結果區域
            ocrResultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            console.log('📝 OCR 結果已顯示，文字長度:', content.length);
        } else {
            console.error('❌ 找不到 OCR 結果顯示元素');
            // 3.2 基本錯誤訊息顯示
            this.showToast('無法顯示識別結果，請檢查頁面元素');
        }
    }

    /**
     * 關閉 OCR 結果
     */
    closeOCRResult() {
        const ocrResultArea = document.getElementById('ocr-result-area');
        if (ocrResultArea) {
            ocrResultArea.style.display = 'none';
            console.log('📝 OCR 結果已關閉');
        }
    }

    /**
     * 發送 OCR 結果到聊天
     */
    sendOCRResultToChat() {
        if (this.currentOCRResult && this.currentOCRResult.content) {
            const message = `請幫我看看這個內容：\n\n${this.currentOCRResult.content}`;
            this.addChatMessage(message, 'user');
            this.processChatMessage(message);
            this.closeOCRResult();
        }
    }

    /**
     * 複製 OCR 結果
     */
    async copyOCRResult() {
        if (this.currentOCRResult && this.currentOCRResult.content) {
            try {
                await navigator.clipboard.writeText(this.currentOCRResult.content);
                this.showToast('已複製到剪貼板');
            } catch (error) {
                console.error('複製失敗:', error);
                this.showToast('複製失敗');
            }
        }
    }

    /**
     * 格式化回應內容以提升可讀性
     */
    formatResponseContent(response) {
        let content = response.content;
        
        // 針對不同類型的回應進行格式化
        switch (response.type) {
            case 'general':
                // 一般回應：將長文字分段
                content = this.formatGeneralText(content);
                break;
            case 'fraud_warning':
                // 詐騙警告：高亮顯示
                content = `<div class="fraud-warning">⚠️ ${content}</div>`;
                break;
            case 'fraud_safe':
                // 安全確認：使用綠色標示
                content = `<div class="fraud-safe">✅ ${content}</div>`;
                break;
            case 'story_fallback':
                // 故事回調：溫馨格式
                content = `<div class="story-fallback">💭 ${content}</div>`;
                break;
            case 'fraud_fallback':
                // 防詐回調：警示格式
                content = `<div class="fraud-fallback">🛡️ ${content}</div>`;
                break;
            default:
                content = this.formatGeneralText(content);
        }
        
        return content;
    }

    /**
     * 格式化一般文字內容
     */
    formatGeneralText(text) {
        // 將長段落分解為更易讀的格式
        const sentences = text.split(/[。！？]/).filter(s => s.trim());
        
        if (sentences.length <= 1) {
            return text;
        }
        
        // 每2-3句為一段
        let formatted = '';
        for (let i = 0; i < sentences.length; i++) {
            formatted += sentences[i].trim();
            if (i < sentences.length - 1) {
                formatted += '。';
                // 每2句換行，提升可讀性
                if ((i + 1) % 2 === 0) {
                    formatted += '<br><br>';
                }
            }
        }
        
        return formatted;
    }

    /**
     * 添加重新上傳按鈕
     */
    addReuploadButton(response) {
        // 如果是故事回調或其他需要重新上傳的情況
        if (response.type === 'story_fallback' || response.type === 'fraud_fallback') {
            const responseActions = document.querySelector('.response-actions');
            if (responseActions) {
                // 檢查是否已存在重新上傳按鈕
                if (!responseActions.querySelector('.reupload-btn')) {
                    const reuploadBtn = document.createElement('button');
                    reuploadBtn.className = 'action-btn reupload-btn';
                    reuploadBtn.innerHTML = '📷 重新上傳';
                    reuploadBtn.setAttribute('aria-label', '重新上傳照片');
                    reuploadBtn.addEventListener('click', () => this.handleReupload());
                    responseActions.appendChild(reuploadBtn);
                }
            }
        }
    }

    /**
     * 處理重新上傳
     */
    handleReupload() {
        // 隱藏回應區域
        const responseArea = document.getElementById('response-area');
        if (responseArea) {
            responseArea.style.display = 'none';
        }
        
        // 清空文件輸入
        const photoUpload = document.getElementById('photo-upload');
        const fraudUpload = document.getElementById('fraud-upload');
        if (photoUpload) photoUpload.value = '';
        if (fraudUpload) fraudUpload.value = '';
        
        // 顯示友好提示
        this.showToast('請重新選擇照片，建議光線充足、文字清楚的照片喔！');
        
        // 滾動到上傳區域
        const interactionsContainer = document.querySelector('.interactions-container');
        if (interactionsContainer) {
            interactionsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 處理朗讀
     */
    handleReadAloud() {
        const responseText = document.getElementById('response-text');
        if (!responseText) return;
        
        const text = responseText.textContent.trim();
        if (!text) {
            this.showToast('沒有內容可以朗讀');
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
            this.showToast('開始朗讀...');
        } else {
            this.showToast('您的瀏覽器不支援語音朗讀功能');
        }
    }

    /**
     * 處理繼續
     */
    handleContinue() {
        this.showToast('小安會繼續為您提供更多資訊');
        // 這裡可以實作繼續對話的邏輯
    }

    /**
     * 顯示載入狀態
     */
    showLoading(message = '處理中...') {
        const loadingIndicator = document.getElementById('loading-indicator');
        const loadingText = document.querySelector('.loading-text');
        
        if (loadingIndicator && loadingText) {
            loadingText.textContent = message;
            loadingIndicator.style.display = 'flex';
        }
    }

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        // 可以實作更友善的錯誤顯示
        this.showToast(`出現問題：${message}`);
    }

    /**
     * 顯示 Toast 訊息
     */
    showToast(message, duration = 3000) {
        // 創建 toast 元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 1.1rem;
            z-index: 10000;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 自動移除
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, duration);
    }
}

/**
 * 擴展功能類別
 */
class EnhancedFeatures {
    constructor(assistant) {
        this.assistant = assistant;
    }
    
    /**
     * 虛擬鍵盤適應
     */
    handleVirtualKeyboard() {
        const viewport = document.querySelector('meta[name="viewport"]');
        
        window.addEventListener('resize', () => {
            // 檢測虛擬鍵盤是否顯示
            const heightChange = window.innerHeight < window.screen.height * 0.75;
            
            if (heightChange) {
                // 虛擬鍵盤顯示時的調整
                document.body.style.height = `${window.innerHeight}px`;
            } else {
                // 虛擬鍵盤隱藏時恢復
                document.body.style.height = '';
            }
        });
    }
    
    /**
     * 觸控手勢支援
     */
    setupTouchGestures() {
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;
            
            // 簡單的滑動手勢檢測
            if (Math.abs(diffY) > 50 && Math.abs(diffX) < 100) {
                if (diffY > 0) {
                    // 向上滑動
                    this.handleSwipeUp();
                } else {
                    // 向下滑動
                    this.handleSwipeDown();
                }
            }
        });
    }
    
    handleSwipeUp() {
        // 向上滑動時的處理
        const responseArea = document.getElementById('response-area');
        if (responseArea && responseArea.style.display !== 'none') {
            responseArea.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    handleSwipeDown() {
        // 向下滑動時的處理
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * 初始化應用程式
 */
// 全域變數
let globalAssistant = null;

// 全域發送訊息函數
window.sendChatMessage = function() {
    console.log('🌍 全域發送函數被調用');
    if (globalAssistant) {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        console.log('📝 輸入內容:', message);
        
        if (message) {
            globalAssistant.addChatMessage(message, 'user');
            input.value = '';
            globalAssistant.processChatMessage(message);
        }
    } else {
        console.error('❌ 助手未初始化');
    }
};

document.addEventListener('DOMContentLoaded', () => { // 將事件監聽器設為 async
    console.log('📱 老花眼救星移動端版本啟動');
    
    // 初始化主要功能
    const assistant = new PresbytopiaAssistant();
    globalAssistant = assistant;
    
    assistant.loadConfigAndInit(); // 確保配置載入完成
    
    // 初始化擴展功能
    const enhanced = new EnhancedFeatures(assistant);
    enhanced.handleVirtualKeyboard();
    enhanced.setupTouchGestures();
    
    // 初始化其他模組
    window.ocrProcessor = new OCRProcessor();
    window.storyGenerator = new StoryGenerator();
    window.chatbot = new Chatbot();
    
    // 設置全域錯誤處理
    window.addEventListener('error', (e) => {
        console.error('應用程式錯誤:', e.error);
        assistant.showToast('系統出現問題，請重新整理頁面');
    });
    
    console.log('✅ 所有功能初始化完成');
});

/**
 * PresbytopiaAssistant 類的可用性 UI 初始化方法
 */
PresbytopiaAssistant.prototype.initializeAccessibilityUI = function() {
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const accessibilityPanel = document.getElementById('accessibility-panel');
    const accessibilityClose = document.getElementById('accessibility-close');
    const languageSelect = document.getElementById('language-select');
    const fontSizeSelect = document.getElementById('font-size-select');
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    const resetButton = document.getElementById('reset-accessibility');

    // 設定面板開關事件
    if (accessibilityToggle && accessibilityPanel) {
        accessibilityToggle.addEventListener('click', () => {
            const isHidden = accessibilityPanel.getAttribute('aria-hidden') === 'true';
            
            if (isHidden) {
                accessibilityPanel.setAttribute('aria-hidden', 'false');
                accessibilityPanel.style.display = 'flex';
                accessibilityToggle.setAttribute('aria-expanded', 'true');
                // 焦點移到面板內的第一個可聚焦元素
                setTimeout(() => {
                    const firstFocusable = accessibilityPanel.querySelector('select, input, button');
                    if (firstFocusable) firstFocusable.focus();
                }, 100);
            } else {
                accessibilityPanel.setAttribute('aria-hidden', 'true');
                accessibilityPanel.style.display = 'none';
                accessibilityToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 關閉面板事件
    if (accessibilityClose && accessibilityPanel) {
        accessibilityClose.addEventListener('click', () => {
            accessibilityPanel.setAttribute('aria-hidden', 'true');
            accessibilityPanel.style.display = 'none';
            if (accessibilityToggle) {
                accessibilityToggle.setAttribute('aria-expanded', 'false');
                accessibilityToggle.focus();
            }
        });
    }

    // ESC 鍵關閉面板
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && accessibilityPanel && accessibilityPanel.getAttribute('aria-hidden') === 'false') {
            if (accessibilityClose) accessibilityClose.click();
        }
    });

    // 語言切換事件
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            this.accessibilityManager.setLanguage(e.target.value);
        });
        // 設定目前值
        languageSelect.value = this.accessibilityManager.settings.language;
    }

    // 字體大小切換事件
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            this.accessibilityManager.setFontSize(e.target.value);
        });
        // 設定目前值
        fontSizeSelect.value = this.accessibilityManager.settings.fontSize;
    }

    // 高對比度切換事件
    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', (e) => {
            this.accessibilityManager.toggleHighContrast();
        });
        // 設定目前值
        highContrastToggle.checked = this.accessibilityManager.settings.highContrast;
    }

    // 重置設定事件
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            this.accessibilityManager.resetToDefaults();
            
            // 更新 UI 元素
            if (languageSelect) languageSelect.value = this.accessibilityManager.settings.language;
            if (fontSizeSelect) fontSizeSelect.value = this.accessibilityManager.settings.fontSize;
            if (highContrastToggle) highContrastToggle.checked = this.accessibilityManager.settings.highContrast;
        });
    }

    console.log('✅ 可用性 UI 已初始化');
};

// 導出供外部使用（如果需要）
window.PresbytopiaAssistant = PresbytopiaAssistant;
