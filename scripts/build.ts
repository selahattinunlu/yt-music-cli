import { mkdir } from 'fs/promises';
import { join } from 'path';

const root = join(import.meta.dir, '..');

const platforms = [
  { target: 'bun-darwin-arm64', pkg: 'darwin-arm64' },
  { target: 'bun-darwin-x64',   pkg: 'darwin-x64'   },
  { target: 'bun-linux-x64',    pkg: 'linux-x64'    },
  { target: 'bun-linux-arm64',  pkg: 'linux-arm64'  },
];

for (const { target, pkg } of platforms) {
  const outDir = join(root, 'npm', pkg, 'bin');
  const outFile = join(outDir, 'yt-music');

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
