const http = require('http');
const https = require('https');
const { URL } = require('url'); // Fixed destructuring
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'config.json');
let CONFIG = {};

try {
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        CONFIG = JSON.parse(configFile);
        console.log(`[Info] 成功載入設定檔: ${configPath}`);
        console.table(CONFIG);
    } else {
        console.error(`[Error] 找不到設定檔！請檢查 config.json 檔案。`);
        process.exit(1);
    }
} catch (err) {
    console.error(`[Error] 讀取 config.json 失敗:`, err.message);
    process.exit(1);
}

// 驗證必要參數
const requiredKeys = ['url', 'method', 'username', 'password', 'intervalMs', 'timeoutMs', 'logFile'];
for (const key of requiredKeys) {
    if (CONFIG[key] === undefined) {
        console.error(`[Error] config.json 缺少必要參數: ${key}`);
        process.exit(1);
    }
}

const targetURL = new URL(CONFIG.url);
const protocol = targetURL.protocol === 'https:' ? https : http;
let sessionToken = null; // Store the session ID here

function now() {
    return new Date().toISOString();
}

function log(message) {
    const line = `[${now()}] ${message}`;
    console.log(line);
    fs.appendFileSync(CONFIG.logFile, line + '\n');
}

function classifyError(error) {
    const msg = (error && error.message ? error.message : "").toLowerCase();
    const code = (error && error.code ? error.code : "");

    if (code === 'ECONNRESET' || msg.includes('socket hang up')) return 'ERROR: Connection reset';
    if (code === 'ETIMEDOUT' || msg.includes('timeout')) return 'ERROR: Timeout';
    if (code === 'ECONNREFUSED') return 'ERROR: Connection Refused';
    if (code === 'EHOSTUNREACH') return 'ERROR: Host Unreachable';
    if (code === 'ENOTFOUND') return 'ERROR: DNS Not Found';
    
    return `ERROR: ${msg || code || 'Unknown error'}`;
}

// Generic request wrapper to support Promises/Async
function sendRequest(method, pathOverride, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload || CONFIG.payload || {});
        const requestUrl = pathOverride ? new URL(pathOverride, CONFIG.url).href : CONFIG.url;
        
        const options = {
            method: method || CONFIG.method,
            timeout: CONFIG.timeoutMs,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Connection': 'keep-alive',
            }
        };

        // Attach session if we have one
        if (sessionToken) {
            options.headers['Cookie'] = `sessionId=${sessionToken}`; // Or 'Authorization': `Bearer ${sessionToken}`
        }

        const req = protocol.request(requestUrl, options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = responseData ? JSON.parse(responseData) : {};
                        resolve(parsed);
                    } catch (e) {
                        resolve(responseData);
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.setTimeout(CONFIG.timeoutMs, () => {
            req.destroy(new Error('Request timed out'));
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(body);
        req.end();
    });
}

async function startWorkflow() {
    try {
        log('Starting endpoint monitoring...');

        // 1. Perform Login
        console.log(`[1] 準備登入... 帳號: ${CONFIG.username}`);
        console.log(`=> 目標伺服器: ${targetURL.host}`);
        
        // Assuming your login endpoint is at /login relative to the base URL
        const loginRes = await sendRequest('POST', '/login', { 
            username: CONFIG.username, 
            password: CONFIG.password 
        });

        sessionToken = loginRes.sessionId || loginRes.token; 
        if (!sessionToken) throw new Error("登入成功但未傳回 sessionId");
        
        log(`=> 登入成功！取得 Session`);

        // 2. Start Periodic Monitoring
        const monitor = async () => {
            try {
                await sendRequest(CONFIG.method);
                log(`SUCCESS: Received response from ${CONFIG.url}`);
            } catch (err) {
                log(classifyError(err));
            }
        };

        // Run immediately once, then set interval
        await monitor();
        const timer = setInterval(monitor, CONFIG.intervalMs);

        process.on('SIGINT', () => {
            log('Stopping endpoint monitoring...');
            clearInterval(timer);
            process.exit(0);
        });

    } catch (error) {
        console.error("\n[Error] 啟動過程中發生錯誤:");
        console.error(error.message);
        process.exit(1);
    }
}

// Start the app
startWorkflow();