#!/usr/bin/env node

/*useage:
#node multi-rtsp-bitrate.js
*/



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
  },
  {
    name: 'Cam-21',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/9b22104a-86a2-ccc4-36d0-47b0262f658c'
  },
  {
    name: 'Cam-22',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/b3791e6a-61e2-c705-6d7e-7ca8e02632d9'
  },
  {
    name: 'Cam-23',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/b4372200-7ce4-7277-577a-58a199ca28a0'
  },
  {
    name: 'Cam-24',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/bbf6e391-beb5-828a-64f7-86677fb65430'
  },
  {
    name: 'Cam-25',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/c0398dd6-f3a2-6c9f-13eb-8073621c9ae4'
  },
  {
    name: 'Cam-26',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/c0f154ef-5d71-7e7f-17cd-9b9b83fad044'
  },
  {
    name: 'Cam-27',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/d2ba635a-3c8a-3acf-6d8d-29f138537f31'
  },
  {
    name: 'Cam-28',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/dd756ef8-db2b-da45-19ec-23930854bc08'
  },
  {
    name: 'Cam-29',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/e2f8f3e0-bdfa-b083-7334-e161ccfe092d'
  },
  {
    name: 'Cam-30',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/e3e9a385-7fe0-3ba5-5482-a86cde7faf48'
  },
  {
    name: 'Cam-31',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/ebda0d86-cf4f-06c3-4b77-e1f5dbd4a7ca'
  },
  {
    name: 'Cam-32',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/ed9f9a07-9433-f5a4-1430-efb8d1624ee2'
  },
  {
    name: 'Cam-33',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/627b12a0-32bc-5585-a418-fabbfa2a2274'
  },
  {
    name: 'Cam-34',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/7e2fd286-e537-3db2-b3c4-55e4b187d628'
  },
  {
    name: 'Cam-35',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/88caf2ac-abfa-e03c-867b-565fa66470a7'
  },
  {
    name: 'Cam-36',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/99cb9a71-b657-354c-bd60-6bb27b7fe9f3'
  },
  {
    name: 'Cam-37',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/a6352c0f-543d-2f0d-8344-f5a7cbd3ab56'
  },
  {
    name: 'Cam-38',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/a8c2ab15-c4b1-0f8a-9e7e-b28b1a17e9b7'
  },
  {
    name: 'Cam-39',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/b6a279d3-0244-8d69-aa30-aca5e05cbfc4'
  },
  {
    name: 'Cam-40',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/38158a25-0d4c-0997-d6e4-61d5a92cb624'
  },
  {
    name: 'Cam-41',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/4ac07a78-1c9b-fa00-d19d-aee6b5129177'
  },
  {
    name: 'Cam-42',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/4dcdc1cd-7af5-7a7f-c82d-fadf147de363'
  },
  {
    name: 'Cam-43',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/721ed9f4-c273-3858-c4b6-b58a3a100783'
  },
  {
    name: 'Cam-44',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/fd310d25-ff13-26ee-d4d1-632763f17c8b'
  },
  {
    name: 'Cam-45',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/3410497c-58b2-9b7e-ef90-1c8eb7d1266c'
  },
  {
    name: 'Cam-46',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/3645c7ee-ca91-e579-e753-1d85af1fd08c'
  },
  {
    name: 'Cam-47',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/65021eeb-5c53-2e8e-f0d9-b4cf650ee793'
  },
  {
    name: 'Cam-48',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/b8893d32-6d5c-6246-e3ad-ed15488ca86d'
  },
  {
    name: 'Cam-49',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/d14ddcec-4e8b-f659-ef96-91013252541c'
  },
  {
    name: 'Cam-50',
    url: 'rtsp://admin:Az123456@192.168.15.103:7001/e55ad9ae-eae3-95f9-f01c-bad6530efb49'
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




