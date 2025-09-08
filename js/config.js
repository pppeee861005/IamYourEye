/**
 * 應用程式配置檔案
 * 版本: 1.2.1
 * 模組: 共用配置模組
 * 狀態: 獨立運行
 * 更新: 2025-01-08 - 修復 OCRProcessor 匯入錯誤和故事顯示區域缺失問題
 */

// 版本管理系統
const VERSION_INFO = {
    APP_VERSION: '1.2.1',
    BUILD_DATE: '2025-01-08',
    BUILD_TIME: '10:00:00',
    COMMIT_HASH: 'a4c5ab29f7a621eb4e8f7ff210b3a1db15545f33',
    MODULE_VERSIONS: {
        gemini_chat: '1.2.1',
        ocr_processor: '1.2.1',
        main_app: '1.2.1',
        story_generator: '1.2.1',
        logger: '1.2.1',
        config: '1.2.1'
    },
    FEATURES: [
        'OCR 文字識別',
        'AI 故事生成',
        '多角色聊天機器人',
        '無障礙設計',
        '本地儲存',
        '錯誤日誌記錄'
    ],
    LAST_UPDATED: '2025-01-08 10:00:00'
};

window.APP_CONFIG = {
    // API 配置
    GEMINI_API_KEY: 'AIzaSyA3PNeVa_KxVu3AyjnyxlTHTRVzQ-1teHU', // 直接設定 API Key 以避免環境變數載入問題
    GEMINI_MODEL: 'gemini-2.0-flash', // 使用最新的高性能模型
    GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models', // 預設 API Base URL

    // 版本資訊
    ...VERSION_INFO,

    // 應用程式設定
    APP_NAME: '老花眼救星',
    APP_DESCRIPTION: '專為長者設計的智慧閱讀助手',
    AUTHOR: '老花眼救星團隊',
    SUPPORT_EMAIL: 'support@vision-helper.com',

    // 功能開關
    FEATURES_ENABLED: {
        ocr: true,
        story_generation: true,
        chat: true,
        accessibility: true,
        logging: true
    },

    // 效能設定
    PERFORMANCE: {
        max_image_size: 10 * 1024 * 1024, // 10MB
        ocr_timeout: 180000, // 3分鐘
        api_timeout: 30000, // 30秒
        max_logs: 1000
    }
};

// 版本顯示函數
window.APP_CONFIG.getVersionString = function() {
    return `${this.APP_NAME} v${this.APP_VERSION} (${this.BUILD_DATE})`;
};

window.APP_CONFIG.getFullVersionInfo = function() {
    return {
        version: this.APP_VERSION,
        buildDate: this.BUILD_DATE,
        buildTime: this.BUILD_TIME,
        commitHash: this.COMMIT_HASH,
        modules: this.MODULE_VERSIONS,
        features: this.FEATURES,
        lastUpdated: this.LAST_UPDATED
    };
};

// 應用程式啟動日誌
console.log(`🚀 ${window.APP_CONFIG.getVersionString()} 啟動中...`);
console.log(`📋 功能模組: ${window.APP_CONFIG.FEATURES.join(', ')}`);
console.log(`🔧 建置資訊: ${window.APP_CONFIG.BUILD_DATE} ${window.APP_CONFIG.BUILD_TIME}`);
