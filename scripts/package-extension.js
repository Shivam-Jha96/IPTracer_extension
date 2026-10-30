import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const filesToInclude = [
  'manifest.json',
  'icons',
  'background',
  'popup',
  'services',
  'README.md'
];

console.log('Building cross-browser packages...');

const zipPath = path.join(distDir, 'iptracer-v2.0.0.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
  const includeStr = filesToInclude.map(f => `'${path.join(rootDir, f)}'`).join(',');
  const cmd = `Compress-Archive -Path ${includeStr} -DestinationPath '${zipPath}' -Force`;
  execSync(`powershell.exe -NoProfile -Command "${cmd}"`, { stdio: 'inherit' });
  console.log(`✅ Universal Chrome & Firefox extension bundle created: ${zipPath}`);
} catch (err) {
  console.error('Packaging failed:', err.message);
}
