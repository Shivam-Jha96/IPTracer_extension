import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function calculateCrc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dt = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dt };
}

/**
 * Builds a 100% PKWARE standard ZIP archive using strictly forward slashes (/) for all entries.
 * Avoids Windows backslash issues that cause Mozilla AMO validation errors.
 */
function createStandardZip(files) {
  const localHeaders = [];
  const cdHeaders = [];
  let currentOffset = 0;
  const now = getDosDateTime();

  for (const file of files) {
    // Crucial: normalize to forward slashes
    const normalizedPath = file.path.replace(/\\/g, '/');
    const filenameBuf = Buffer.from(normalizedPath, 'utf8');
    const crc = calculateCrc32(file.data);
    const uncompressedSize = file.data.length;
    const compressedData = zlib.deflateRawSync(file.data);
    const compressedSize = compressedData.length;

    // Local file header (30 bytes)
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4); // version needed: 2.0
    lfh.writeUInt16LE(0x0800, 6); // general purpose bit: UTF-8
    lfh.writeUInt16LE(8, 8); // compression: deflate
    lfh.writeUInt16LE(now.time, 10);
    lfh.writeUInt16LE(now.date, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressedSize, 18);
    lfh.writeUInt32LE(uncompressedSize, 22);
    lfh.writeUInt16LE(filenameBuf.length, 26);
    lfh.writeUInt16LE(0, 28); // extra field len

    localHeaders.push(lfh, filenameBuf, compressedData);

    // Central directory header (46 bytes)
    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4); // version made by
    cdh.writeUInt16LE(20, 6); // version needed
    cdh.writeUInt16LE(0x0800, 8); // UTF-8
    cdh.writeUInt16LE(8, 10); // deflate
    cdh.writeUInt16LE(now.time, 12);
    cdh.writeUInt16LE(now.date, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressedSize, 20);
    cdh.writeUInt32LE(uncompressedSize, 24);
    cdh.writeUInt16LE(filenameBuf.length, 28);
    cdh.writeUInt16LE(0, 30); // extra len
    cdh.writeUInt16LE(0, 32); // comment len
    cdh.writeUInt16LE(0, 34); // disk num
    cdh.writeUInt16LE(0, 36); // internal attr
    cdh.writeUInt32LE(0, 38); // external attr
    cdh.writeUInt32LE(currentOffset, 42); // offset of LFH

    cdHeaders.push(cdh, filenameBuf);
    currentOffset += lfh.length + filenameBuf.length + compressedData.length;
  }

  const cdStartOffset = currentOffset;
  const cdBuf = Buffer.concat(cdHeaders);
  const cdSize = cdBuf.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); // disk num
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(files.length, 8); // entries on this disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdStartOffset, 16);
  eocd.writeUInt16LE(0, 20); // comment len

  return Buffer.concat([...localHeaders, cdBuf, eocd]);
}

function collectFiles(baseDir, relativePrefix = '') {
  const result = [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      result.push(...collectFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      result.push({
        path: relPath.replace(/\\/g, '/'),
        data: fs.readFileSync(fullPath)
      });
    }
  }

  return result;
}

const filesToInclude = [
  'icons',
  'background',
  'popup',
  'services',
  'README.md'
];

console.log('📦 Collecting shared extension files (using forward-slash standard paths)...');

const sharedFiles = [];
for (const item of filesToInclude) {
  const itemPath = path.join(rootDir, item);
  if (fs.existsSync(itemPath)) {
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      sharedFiles.push(...collectFiles(itemPath, item));
    } else {
      sharedFiles.push({
        path: item.replace(/\\/g, '/'),
        data: fs.readFileSync(itemPath)
      });
    }
  }
}

console.log(`Collected ${sharedFiles.length} shared assets/source files.`);

// Read root manifest.json
const rawManifest = fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8');
const baseManifest = JSON.parse(rawManifest);

/**
 * Build target: Edge & Chromium
 * Strict MV3: background.service_worker only, no background.scripts, no browser_specific_settings.
 */
const edgeManifest = JSON.parse(JSON.stringify(baseManifest));
edgeManifest.background = {
  service_worker: 'background/service-worker.js',
  type: 'module'
};
delete edgeManifest.browser_specific_settings;

/**
 * Build target: Firefox AMO & Firefox Android
 * Gecko MV3: background.scripts array, with browser_specific_settings for Gecko & Android.
 */
const firefoxManifest = JSON.parse(JSON.stringify(baseManifest));
firefoxManifest.background = {
  scripts: ['background/service-worker.js'],
  type: 'module'
};
firefoxManifest.browser_specific_settings = baseManifest.browser_specific_settings || {
  gecko: {
    id: 'iptracer@extension.local',
    strict_min_version: '140.0',
    data_collection_permissions: {
      required: ['none']
    }
  },
  gecko_android: {
    strict_min_version: '142.0'
  }
};

const builds = [
  {
    name: 'Microsoft Edge & Universal Chromium',
    filename: 'iptracer-edge.zip',
    manifest: edgeManifest
  },
  {
    name: 'Google Chrome Web Store',
    filename: 'iptracer-chrome.zip',
    manifest: edgeManifest
  },
  {
    name: 'Mozilla Firefox AMO (Desktop & Android)',
    filename: 'iptracer-firefox.zip',
    manifest: firefoxManifest
  },
  {
    name: 'Standard Release (v2.0.0 Edge/Chromium compatible)',
    filename: 'iptracer-v2.0.0.zip',
    manifest: edgeManifest
  }
];

console.log('\n🚀 Packaging browser-specific release distributions...\n');

for (const build of builds) {
  const manifestBuf = Buffer.from(JSON.stringify(build.manifest, null, 2), 'utf8');
  const filesForBuild = [
    { path: 'manifest.json', data: manifestBuf },
    ...sharedFiles
  ];

  const zipBuffer = createStandardZip(filesForBuild);
  const outPath = path.join(distDir, build.filename);
  fs.writeFileSync(outPath, zipBuffer);
  console.log(`✅ [${build.name}] -> dist/${build.filename} (${zipBuffer.length} bytes, ${filesForBuild.length} files)`);
}

console.log('\n✨ All distribution archives built successfully!');
