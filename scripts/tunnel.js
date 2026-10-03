import fs from 'node:fs';
import { bin, install, Tunnel } from 'cloudflared';
import QRCode from 'qrcode';

const LOCAL_URL = 'http://localhost:5173';

if (!fs.existsSync(bin)) {
  console.log('Laster ned cloudflared …');
  await install(bin);
}

const tunnel = Tunnel.quick(LOCAL_URL);

tunnel.once('url', async (url) => {
  console.log(await QRCode.toString(url, { type: 'terminal', small: true }));
  console.log(`Wildspot på mobil: ${url}`);
  console.log('Skann QR-koden med mobilkameraet. Stopp tunnelen med Ctrl+C.\n');
});

tunnel.on('error', (error) => console.error('Tunnelfeil:', error.message));
process.on('SIGINT', () => {
  tunnel.stop();
  process.exit();
});
