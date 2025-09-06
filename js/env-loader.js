/**
 * 環境變數載入器
 * 用於載入.env文件中的配置
 */
class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    /**
     * 載入.env文件
     */
    async load() {
        try {
            const response = await fetch('.env');
            const text = await response.text();

            // 解析.env文件內容
            const lines = text.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();

                // 跳過空行和註解
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }

                // 解析KEY=VALUE格式
                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex > 0) {
                    const key = trimmedLine.substring(0, equalIndex).trim();
                    let value = trimmedLine.substring(equalIndex + 1).trim();

                    // 移除引號
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    this.env[key] = value;
                }
            }

            this.loaded = true;
            console.log('Environment variables loaded successfully');
            return this.env;

        } catch (error) {
            console.warn('Could not load .env file:', error);
            // 使用預設值，包含實際的 API Key
            // 如果 .env 載入失敗，不設定預設 API Key，讓依賴方自行處理
            this.env = {};
            this.loaded = true;
            return this.env;
        }
    }

    /**
     * 獲取環境變數值
     */
    get(key, defaultValue = '') {
        if (!this.loaded) {
            console.warn('Environment not loaded yet. Call load() first.');
            return defaultValue;
        }
        return this.env[key] || defaultValue;
    }

    /**
     * 檢查是否已載入
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * 獲取所有環境變數
     */
    getAll() {
        return { ...this.env };
    }
}

// 創建全局實例
window.envLoader = new EnvLoader();
