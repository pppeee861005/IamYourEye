/**
 * 日誌管理器模組
 * 版本: 1.2.1
 * 模組: 日誌管理模組
 * 狀態: 獨立運行
 * 功能: 統一日誌記錄、錯誤追蹤、效能監控
 * 更新: 簡化介面，提升使用者體驗
 */

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // 最大日誌數量
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        };
        this.currentLevel = this.logLevels.INFO; // 預設日誌等級
        this.storageKey = 'app_logs';

        this.loadLogs();
        this.setupConsoleOverride();

        // 簡易日誌方法
        this.simpleLog = this.createSimpleLogger();
    }

    /**
     * 載入儲存的日誌
     */
    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
                // 限制日誌數量
                if (this.logs.length > this.maxLogs) {
                    this.logs = this.logs.slice(-this.maxLogs);
                }
            }
        } catch (error) {
            console.warn('載入日誌失敗:', error);
            this.logs = [];
        }
    }

    /**
     * 保存日誌到本地儲存
     */
    saveLogs() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('保存日誌失敗:', error);
        }
    }

    /**
     * 設定日誌等級
     */
    setLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLevel = this.logLevels[level];
            this.info('Logger', `日誌等級已設定為: ${level}`);
        }
    }

    /**
     * 建立日誌項目
     */
    createLogEntry(level, module, message, data = null) {
        return {
            timestamp: new Date().toISOString(),
            level: level,
            module: module,
            message: message,
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }

    /**
     * 添加日誌
     */
    addLog(level, module, message, data = null) {
        if (this.logLevels[level] < this.currentLevel) {
            return; // 低於當前等級的日誌不記錄
        }

        const logEntry = this.createLogEntry(level, module, message, data);
        this.logs.push(logEntry);

        // 限制日誌數量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // 移除最舊的日誌
        }

        // 保存到本地儲存
        this.saveLogs();

        // 同時輸出到控制台
        this.outputToConsole(level, module, message, data);

        return logEntry;
    }

    /**
     * 輸出到控制台
     */
    outputToConsole(level, module, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}] [${module}]`;

        switch (level) {
            case 'DEBUG':
                console.debug(`${prefix} ${message}`, data || '');
                break;
            case 'INFO':
                console.info(`${prefix} ${message}`, data || '');
                break;
            case 'WARN':
                console.warn(`${prefix} ${message}`, data || '');
                break;
            case 'ERROR':
                console.error(`${prefix} ${message}`, data || '');
                break;
            case 'FATAL':
                console.error(`${prefix} [FATAL] ${message}`, data || '');
                break;
        }
    }

    /**
     * 覆蓋原生 console 方法
     */
    setupConsoleOverride() {
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        // 覆蓋 console.log
        console.log = (...args) => {
            this.addLog('INFO', 'Console', args.join(' '));
            originalConsole.log.apply(console, args);
        };

        // 覆蓋 console.info
        console.info = (...args) => {
            this.addLog('INFO', 'Console', args.join(' '));
            originalConsole.info.apply(console, args);
        };

        // 覆蓋 console.warn
        console.warn = (...args) => {
            this.addLog('WARN', 'Console', args.join(' '));
            originalConsole.warn.apply(console, args);
        };

        // 覆蓋 console.error
        console.error = (...args) => {
            this.addLog('ERROR', 'Console', args.join(' '));
            originalConsole.error.apply(console, args);
        };

        // 覆蓋 console.debug
        console.debug = (...args) => {
            this.addLog('DEBUG', 'Console', args.join(' '));
            originalConsole.debug.apply(console, args);
        };
    }

    /**
     * 除錯日誌
     */
    debug(module, message, data = null) {
        return this.addLog('DEBUG', module, message, data);
    }

    /**
     * 資訊日誌
     */
    info(module, message, data = null) {
        return this.addLog('INFO', module, message, data);
    }

    /**
     * 警告日誌
     */
    warn(module, message, data = null) {
        return this.addLog('WARN', module, message, data);
    }

    /**
     * 錯誤日誌
     */
    error(module, message, data = null) {
        return this.addLog('ERROR', module, message, data);
    }

    /**
     * 致命錯誤日誌
     */
    fatal(module, message, data = null) {
        return this.addLog('FATAL', module, message, data);
    }

    /**
     * 記錄使用者動作
     */
    logUserAction(action, details = null) {
        return this.addLog('INFO', 'UserAction', `使用者動作: ${action}`, details);
    }

    /**
     * 記錄 API 請求
     */
    logApiRequest(endpoint, method, status, duration = null) {
        const message = `API 請求: ${method} ${endpoint} - 狀態: ${status}`;
        const data = duration ? { duration: `${duration}ms` } : null;
        return this.addLog('INFO', 'API', message, data);
    }

    /**
     * 記錄錯誤
     */
    logError(module, error, context = null) {
        const message = `錯誤: ${error.message || error}`;
        const data = {
            stack: error.stack,
            context: context
        };
        return this.addLog('ERROR', module, message, data);
    }

    /**
     * 記錄效能指標
     */
    logPerformance(metric, value, unit = 'ms') {
        return this.addLog('INFO', 'Performance', `效能指標: ${metric} = ${value}${unit}`);
    }

    /**
     * 獲取日誌
     */
    getLogs(level = null, module = null, limit = 100) {
        let filteredLogs = [...this.logs];

        // 過濾等級
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }

        // 過濾模組
        if (module) {
            filteredLogs = filteredLogs.filter(log => log.module === module);
        }

        // 限制數量
        return filteredLogs.slice(-limit);
    }

    /**
     * 獲取日誌統計
     */
    getLogStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byModule: {},
            recentErrors: []
        };

        // 統計各等級數量
        Object.keys(this.logLevels).forEach(level => {
            stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
        });

        // 統計各模組數量
        const modules = [...new Set(this.logs.map(log => log.module))];
        modules.forEach(module => {
            stats.byModule[module] = this.logs.filter(log => log.module === module).length;
        });

        // 最近的錯誤
        stats.recentErrors = this.getLogs('ERROR', null, 10);

        return stats;
    }

    /**
     * 清除日誌
     */
    clearLogs() {
        this.logs = [];
        this.saveLogs();
        this.info('Logger', '日誌已清除');
    }

    /**
     * 匯出日誌
     */
    exportLogs(format = 'json') {
        const data = {
            exportTime: new Date().toISOString(),
            appVersion: window.APP_CONFIG?.APP_VERSION || 'unknown',
            logs: this.logs,
            stats: this.getLogStats()
        };

        if (format === 'csv') {
            // 轉換為 CSV 格式
            const csvHeader = 'timestamp,level,module,message,data\n';
            const csvRows = this.logs.map(log =>
                `"${log.timestamp}","${log.level}","${log.module}","${log.message}","${JSON.stringify(log.data)}"`
            ).join('\n');
            return csvHeader + csvRows;
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * 記錄應用程式啟動
     */
    logAppStart() {
        this.info('App', '應用程式啟動', {
            version: window.APP_CONFIG?.APP_VERSION,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 記錄應用程式錯誤
     */
    logAppError(error, context = null) {
        this.logError('App', error, context);
    }

    /**
     * 創建簡易日誌方法
     */
    createSimpleLogger() {
        return {
            // 快速記錄方法
            success: (message) => this.info('App', `✅ ${message}`),
            error: (message) => this.error('App', `❌ ${message}`),
            warning: (message) => this.warn('App', `⚠️ ${message}`),
            info: (message) => this.info('App', `ℹ️ ${message}`),
            debug: (message) => this.debug('App', `🔍 ${message}`),

            // 功能特定記錄
            userAction: (action) => this.logUserAction(action),
            apiCall: (endpoint, status) => this.logApiRequest(endpoint, 'POST', status),
            performance: (metric, value) => this.logPerformance(metric, value),

            // 應用程式事件
            appStart: () => this.logAppStart(),
            featureUsed: (feature) => this.info('Feature', `功能使用: ${feature}`),
            buttonClick: (buttonId) => this.logUserAction(`按鈕點擊: ${buttonId}`),
            pageView: (page) => this.info('Navigation', `頁面瀏覽: ${page}`),

            // 狀態記錄
            loading: (item) => this.info('Loading', `載入中: ${item}`),
            loaded: (item) => this.success(`載入完成: ${item}`),
            processing: (item) => this.info('Processing', `處理中: ${item}`),
            completed: (item) => this.success(`處理完成: ${item}`)
        };
    }

    /**
     * 顯示日誌統計摘要
     */
    showLogSummary() {
        const stats = this.getLogStats();
        console.log('📊 日誌統計摘要:');
        console.log(`總計: ${stats.total} 條日誌`);
        console.log('各等級統計:', stats.byLevel);
        console.log('各模組統計:', stats.byModule);

        if (stats.recentErrors.length > 0) {
            console.log('最近錯誤:');
            stats.recentErrors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.timestamp}: ${error.message}`);
            });
        }
    }

    /**
     * 快速診斷應用程式狀態
     */
    diagnose() {
        const diagnosis = {
            timestamp: new Date().toISOString(),
            version: window.APP_CONFIG?.APP_VERSION || 'unknown',
            logs: this.getLogStats(),
            features: window.APP_CONFIG?.FEATURES_ENABLED || {},
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                } : 'N/A'
            }
        };

        console.log('🔍 應用程式診斷報告:');
        console.table(diagnosis);
        return diagnosis;
    }
}

// 創建全域實例
window.logger = new Logger();

// 應用程式啟動時記錄
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.logger) {
            window.logger.logAppStart();
        }
    }, 100);
});

// 全域錯誤處理
window.addEventListener('error', (event) => {
    if (window.logger) {
        window.logger.logAppError(event.error, {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// 未捕獲的 Promise 錯誤處理
window.addEventListener('unhandledrejection', (event) => {
    if (window.logger) {
        window.logger.logAppError(new Error(event.reason), {
            type: 'unhandledrejection',
            promise: event.promise
        });
    }
});
