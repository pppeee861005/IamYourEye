/**
 * Gemini AI 聊天模組
 * 版本: 1.0.0
 * 模組: Gemini Chat 模組
 * 狀態: 獨立運行
 * 功能: 處理 Gemini AI 聊天介面和 API 呼叫
 */

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // 載入API金鑰和模型設定
    const GEMINI_API_KEY = window.APP_CONFIG.GEMINI_API_KEY;
    const GEMINI_MODEL = window.APP_CONFIG.GEMINI_MODEL;

    // 測試 API 金鑰是否有效
    async function testApiKey() {
        try {
            const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
            const testResponse = await fetch(testUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello"
                        }]
                    }]
                })
            });

            if (testResponse.status === 400) {
                console.log('✅ API 金鑰格式正確，但請求可能有其他問題');
                return true;
            } else if (testResponse.status === 200) {
                console.log('✅ API 金鑰完全有效');
                return true;
            } else {
                console.error('❌ API 金鑰可能無效，狀態碼:', testResponse.status);
                return false;
            }
        } catch (error) {
            console.error('❌ API 金鑰測試失敗:', error);
            return false;
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        appendMessage('user', message);
        userInput.value = '';

        try {
            // 首次使用時測試 API 金鑰
            if (!sendMessage.apiTested) {
                console.log('🔍 正在測試 API 金鑰...');
                const isApiValid = await testApiKey();
                sendMessage.apiTested = true;

                if (!isApiValid) {
                    throw new Error('API 金鑰驗證失敗');
                }
            }
            // 驗證 API 金鑰是否存在
            if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
                throw new Error('API 金鑰未設定，請聯繫開發者');
            }

            // 使用正確的 Gemini API 端點格式
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

            if (window.logger) {
                window.logger.info('GeminiChat', '準備發送 API 請求', {
                    url: apiUrl.replace(GEMINI_API_KEY, '***API_KEY***'),
                    model: GEMINI_MODEL,
                    messageLength: message.length
                });
            }

            // 呼叫Gemini API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            if (window.logger) {
                window.logger.logApiRequest(apiUrl.replace(GEMINI_API_KEY, '***API_KEY***'), 'POST', response.status);
            }

            if (!response.ok) {
                const errorText = await response.text();
                if (window.logger) {
                    window.logger.error('GeminiChat', 'API 請求失敗', {
                        status: response.status,
                        statusText: response.statusText,
                        errorText: errorText
                    });
                }
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (window.logger) {
                window.logger.debug('GeminiChat', 'API 回應成功', {
                    hasCandidates: !!data.candidates,
                    candidateCount: data.candidates ? data.candidates.length : 0
                });
            }

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates received from API');
            }

            if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                throw new Error('Invalid response format from API');
            }

            const botResponse = data.candidates[0].content.parts[0].text;
            appendMessage('bot', botResponse);

        } catch (error) {
            if (window.logger) {
                window.logger.logError('GeminiChat', error, {
                    model: GEMINI_MODEL,
                    apiKeyPrefix: GEMINI_API_KEY.substring(0, 10) + '...',
                    url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
                });
            }

            let errorMessage = '抱歉，目前無法回應。';

            if (error.message.includes('API 金鑰未設定')) {
                errorMessage += 'API 金鑰尚未設定，請聯繫開發者進行設定。';
            } else if (error.message.includes('400')) {
                errorMessage += 'API 請求格式錯誤。請檢查網路連線，或聯繫開發者。';
            } else if (error.message.includes('401')) {
                errorMessage += 'API 金鑰無效或過期。請聯繫開發者更新金鑰。';
            } else if (error.message.includes('403')) {
                errorMessage += 'API 存取被拒絕。請檢查金鑰權限設定。';
            } else if (error.message.includes('429')) {
                errorMessage += 'API 請求過於頻繁，請稍後再試。';
            } else if (error.message.includes('500')) {
                errorMessage += 'Google 伺服器暫時無法使用，請稍後再試。';
            } else if (error.message.includes('Invalid response format')) {
                errorMessage += 'API 回應格式異常，請聯繫開發者。';
            } else {
                errorMessage += `系統錯誤：${error.message}`;
            }

            // 提供除錯資訊（開發模式）
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                errorMessage += '\n\n除錯資訊：請檢查瀏覽器控制台以獲取詳細錯誤資訊。';
            }

            appendMessage('bot', errorMessage);
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // 捲動至最新訊息
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
