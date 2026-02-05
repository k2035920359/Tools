const { spawn } = require('child_process');

/* ==========================
 * Configuration
 * ========================== */

// How many seconds to average over: 1 | 5 | 10 | ...
const AVERAGE_WINDOW_SECONDS = 10;

// Log label
const LABEL = 'RTSP Bitrate';

/* ==========================
 * RTSP Source
 * ========================== */

const rtspUrl =
  'rtsp://admin:Az123456@192.168.15.103:7001/052c6604-e7a1-f8df-7cbe-891c9235d5e2';

/* ==========================
 * FFmpeg Process
 * ========================== */

const ffmpeg = spawn('ffmpeg', [
  '-rtsp_transport', 'tcp',
  '-fflags', '+genpts',
  '-i', rtspUrl,
  '-an',
  '-c', 'copy',
  '-f', 'mpegts',
  'pipe:1'
], {
  stdio: ['ignore', 'pipe', 'pipe']
});

/* ==========================
 * Bitrate Calculation
 * ========================== */

let bytesThisSecond = 0;
let samples = []; // kbps samples

setInterval(() => {
  // convert bytes → kbps
  const kbps = (bytesThisSecond * 8) / 1000;
  bytesThisSecond = 0;

  samples.push(kbps);

  // If window reached, calculate average
  if (samples.length === AVERAGE_WINDOW_SECONDS) {
    const avg =
      samples.reduce((sum, v) => sum + v, 0) / samples.length;

    console.log(
      `📶 ${LABEL} (${AVERAGE_WINDOW_SECONDS}s avg):\t${avg.toFixed(1)} kbps`
    );

    samples = [];
  }
}, 1000);

/* ==========================
 * Stream Handling
 * ========================== */

ffmpeg.stdout.on('data', (chunk) => {
  bytesThisSecond += chunk.length;
});

ffmpeg.stderr.on('data', (data) => {
  // Uncomment only if debugging FFmpeg
  // console.error('[ffmpeg]', data.toString());
});

ffmpeg.on('close', (code) => {
  console.log('FFmpeg exited with code', code);
});
