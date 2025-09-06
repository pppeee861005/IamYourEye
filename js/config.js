window.APP_CONFIG = {
    GEMINI_API_KEY: window.envLoader ? window.envLoader.get('GEMINI_API_KEY') : 'YOUR_FALLBACK_API_KEY', // 從環境變數或提供預設值
    GEMINI_MODEL: 'gemini-2.0-flash-exp', // 預設模型
    GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models' // 預設 API Base URL
};
