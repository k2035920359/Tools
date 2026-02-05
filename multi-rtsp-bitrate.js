const { spawn } = require('child_process');

/* ==========================
 * Global Config
 * ========================== */

const AVERAGE_WINDOW_SECONDS = 10;
const PASS_THRESHOLD_KBPS = 800;

/* ==========================
 * RTSP List for 20 channels
 * ========================== */

const RTSP_SOURCES = [
  {
    name: 'Cam-1',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/5a40feed-bfd6-dec4-4a31-a169c00692fd'
  },
  {
    name: 'Cam-2',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/052c6604-e7a1-f8df-7cbe-891c9235d5e2'
  },
  {
    name: 'Cam-3',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/0d118584-3d2d-ed7e-71da-bc08499daeaa'
  },
  {
    name: 'Cam-4',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/135c455e-b8a3-f5c4-5f00-6593975ef3fe'
  },
  {
    name: 'Cam-5',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/16753fe9-322d-0399-1b7f-a930f24e4cd9'
  },
  {
    name: 'Cam-6',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/21135e44-911c-c49a-740a-cadbb38670e0'
  },
  {
    name: 'Cam-7',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/38c5e727-b304-d188-0733-8619d09baae5'
  },
  {
    name: 'Cam-8',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/3ce36e62-7416-4f42-0339-0adca55a9091'
  },
  {
    name: 'Cam-9',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/4474473d-9c83-aff3-033a-9e9d4882d6f3'
  },
  {
    name: 'Cam-10',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/55cf7b60-e07e-9a8a-5d65-f9b57e048989'
  },
  {
    name: 'Cam-11',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/6f646896-0df9-7bf5-65dd-e9f362081a5b'
  },
  {
    name: 'Cam-12',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/758dbd64-c7da-6980-64fc-fab79b45e6cc'
  },
  {
    name: 'Cam-13',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/76bdce35-c788-c7cf-78c1-950674299d28'
  },
  {
    name: 'Cam-14',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/77572705-3f39-57e8-02dc-5bd747538615'
  },
  {
    name: 'Cam-15',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/7c537dfc-eda0-9c29-3df6-ea781c20a9d7'
  },
  {
    name: 'Cam-16',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/7cde947f-e163-7dda-20a6-2e2344005251'
  },
  {
    name: 'Cam-17',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/8435c97c-7830-ecc7-6551-6da396f2e39d'
  },
  {
    name: 'Cam-18',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/915a0554-3db6-a681-62e9-f1208830308e'
  },
  {
    name: 'Cam-19',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/92d4bde9-1687-5399-4305-f302e4052956'
  },
  {
    name: 'Cam-20',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/978b757c-32f8-f0cf-4508-296015be90ea'
  }
];

/* ==========================
 * RTSP Monitor Class
 * ========================== */

class RtspBitrateMonitor {
  constructor(name, url) {
    this.name = name;
    this.url = url;

    this.bytesThisSecond = 0;
    this.samples = [];
    this.ffmpeg = null;

    this.start();
  }

  start() {
    console.log(`▶ Starting monitor: ${this.name}`);

    this.ffmpeg = spawn(
      'ffmpeg',
      [
        '-rtsp_transport', 'tcp',
        '-stimeout', '5000000',
        '-fflags', '+genpts',
        '-i', this.url,
        '-an',
        '-c', 'copy',
        '-f', 'mpegts',
        'pipe:1'
      ],
      { stdio: ['ignore', 'pipe', 'ignore'] }
    );

    this.ffmpeg.stdout.on('data', (chunk) => {
      this.bytesThisSecond += chunk.length;
    });

    this.ffmpeg.on('close', (code) => {
      console.log(`⚠ ${this.name} FFmpeg exited (${code}), retrying...`);
      setTimeout(() => this.start(), 2000);
    });
  }

  tick() {
    const kbps = (this.bytesThisSecond * 8) / 1000;
    this.bytesThisSecond = 0;

    this.samples.push(kbps);
    if (this.samples.length > AVERAGE_WINDOW_SECONDS) {
      this.samples.shift();
    }

    const avg =
      this.samples.reduce((s, v) => s + v, 0) / this.samples.length;
    const status = avg > PASS_THRESHOLD_KBPS ? '✅ PASS' : '❌ FAIL';

    console.log(
      `📶 ${this.name.padEnd(10)} ` +
      `now: ${kbps.toFixed(0).padStart(5)} kbps | ` +
      `avg(${this.samples.length}s): ${avg.toFixed(0).padStart(5)} kbps | ` + status
     
    );
  }
}

/* ==========================
 * Start All Monitors
 * ========================== */

const monitors = RTSP_SOURCES.map(
  (src) => new RtspBitrateMonitor(src.name, src.url)
);

setInterval(() => {
  monitors.forEach((m) => m.tick());
}, 1000);




