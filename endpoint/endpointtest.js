const http = require('http');
const https = require('https');
const {url} = require('url');
const fs = require('fs');

const configPath = path.join(process.cwd(), 'config.json');
let CONFIG = {};

try {
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        CONFIG = JSON.parse(configFile);
        console.log(`[Info] 成功載入外部設定檔: ${configPath}`);
        console.table(CONFIG)
        console.log()
    } else {
        console.error(`[Error] 找不到設定檔！請確保執行檔同目錄下有 config.json 檔案。`);
        process.exit(1);
    }
} catch (err) {
    console.error(`[Error] 讀取或解析 config.json 失敗:`, err.message);
    process.exit(1);
}

const requiredKeys = ['host', 'port', 'targetAPI', 'method', 'pathPrefix', 'username', 'password' , 'testStartTimeStr', 'intervalMs', 'timeoutMs', 'payload', 'logFile'];
for (const key of requiredKeys) {
    if (CONFIG[key] === undefined) {
        console.error(`[Error] config.json 缺少必要參數: ${key}`);
        process.exit(1);
    }
}


const targetAPI = new URL(CONFIG.targetAPI);
const protocol = targetAPI.protocol === 'https:' ? https : http;

function now(){
    return new Date().toISOString();
}

function log(message){
    const line = `[${now()}] ${message}\n`;
    console.log(line);
    fs.appendFileSync(CONFIG.logFile, line + '\n');
}

function classifyError(error){
    const msg = (err && err.message ? err.message: "").toLowerCase();
    const code = (err && err.code ? err.code: "");

    if (code === 'ECONNRESET' || msg.includes('socket hang up')) {
            return 'ERROR: Connection reset / Connection Refused';
    }
    if (code === 'ETIMEDOUT' || msg.includes('timeout')) {
            return 'ERROR: Timeout';    
    }
    if (code === 'ECONNREFUSED') {
            return 'ERROR: Connection Refused';
    }
    if(code === 'EHOSTUNREACH' ){
            return 'ERROR: Host Unreachable';    
    }
    if (code === 'ENOTFOUND'){
            return 'ERROR: DNS Not Found';
    }
    if (msg.includes("unexpected end of file") || msg.includes("EOF")){
            return 'ERROR: Unexpected from server';
    }
    return `ERROR: ${msg || code || 'Unknown error'} $ {err.message || ''}`;
}

/*
//Login
async function Login() {
    try {
        const testStartTime = new Date(CONFIG.testStartTimeStr).getTime();
        if (isNaN(testStartTime)) {
            console.error(`\n[Error] 您輸入的測試開始時間 "${CONFIG.testStartTimeStr}" 格式錯誤！\n`);
            return;
        }

        console.log(`[1] 準備登入... 帳號: ${CONFIG.username}`);
        console.log(`=> 目標伺服器: https://${CONFIG.host}:${CONFIG.port}`);
        
        const loginRes = await sendRequest('POST', '/login', { username: CONFIG.username, password: CONFIG.password });
        const sessionId = loginRes.sessionId; 
        if (!sessionId) throw new Error("登入失敗或無法取得 sessionId");
        console.log(`=> 登入成功！取得 sessionId: ${sessionId}\n`);
    }catch (error) {
        console.error("\n[Error] 測試過程中發生錯誤:");
        console.error(error);   
    }
}
*/

//Setup request function
function sendRequest(method, reqPath, data = null, sessionId = null) {
    
    const body = JSON.stringify(CONFIG.payload);
    const options = {
        hostname: CONFIG.host,
        port: CONFIG.port,
        path: CONFIG.pathPrefix + reqPath,
        method: CONFIG.method,
        timeout: CONFIG.timeoutMs,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'connection': 'close',
        }
    };
    if (sessionId) {
            options.headers['sessionid'] = sessionId;
        }

        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

    const req = protocol.request(CONFIG.url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk.toISOString;
        });

        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                log(`SUCCESS: Received response with status ${res.statusCode}`);
            } else {
                log(`ERROR: Received non-2xx response / Response aborted by server: ${res.statusCode} - ${responseData}`);
            }
        });
    });

    req.setTimeout(CONFIG.timeoutMs, () => {
        req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => {
        log(classifyError(err));
    });

    req.write(body);
    req.end();
}

log('Starting endpoint monitoring...');

const timer = setInterval(sendRequest, CONFIG.intervalMs);
//Login()

sendRequest(); // Send immediately on start

process.on('SIGINT', () => {
    log('Stopping endpoint monitoring...');
    clearInterval(timer);
    process.exit(0);
});
















