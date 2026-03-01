import { mkdir } from 'fs/promises';
import { join } from 'path';

const root = join(import.meta.dir, '..');

const platforms = [
  { target: 'bun-darwin-arm64', pkg: 'darwin-arm64', binary: 'yt-music'     },
  { target: 'bun-darwin-x64',   pkg: 'darwin-x64',   binary: 'yt-music'     },
  { target: 'bun-linux-x64',    pkg: 'linux-x64',    binary: 'yt-music'     },
  { target: 'bun-linux-arm64',  pkg: 'linux-arm64',  binary: 'yt-music'     },
  { target: 'bun-windows-x64',  pkg: 'win32-x64',    binary: 'yt-music.exe' },
];

for (const { target, pkg, binary } of platforms) {
  const outDir = join(root, 'npm', pkg, 'bin');
  const outFile = join(outDir, binary);

  await mkdir(outDir, { recursive: true });

  process.stdout.write(`Building ${target}... `);

  const result = await Bun.$`bun build --compile --target=${target} ${join(root, 'src/index.ts')} --outfile=${outFile}`.quiet();

  if (result.exitCode !== 0) {
    process.stderr.write(`FAILED\n${result.stderr.toString()}\n`);
    process.exit(1);
  }

  process.stdout.write(`done → npm/${pkg}/bin/yt-music\n`);
}

console.log('\nAll platforms built.');
