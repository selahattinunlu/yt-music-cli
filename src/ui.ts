import chalk from 'chalk';
import type { PlayerState } from './player';
import type { Track } from './types';

function fmt(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function bar(pos: number, total: number, width = 36): string {
  if (!total || isNaN(pos)) return chalk.gray('─'.repeat(width));
  const pct = Math.min(pos / total, 1);
  const filled = Math.floor(pct * width);
  return chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}

function clip(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function clearScreen() {
  process.stdout.write('\x1Bc');
}

export function renderSearch(query: string, hint = '') {
  clearScreen();
  console.log(chalk.cyan.bold('\n  yt-music-cli\n'));
  if (hint) console.log(chalk.gray(`  ${hint}\n`));
  process.stdout.write(chalk.white('  Search: ') + chalk.white.bold(query) + chalk.gray(' █'));
}

export function renderResults(tracks: Track[], selected: number) {
  clearScreen();
  console.log(chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Arama Sonuçları\n'));

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const title = clip(t.title, 48);
    const dur = t.duration ? chalk.gray(` [${fmt(t.duration)}]`) : '';
    const uploader = t.uploader ? chalk.gray.italic(`  ${clip(t.uploader, 22)}`) : '';

    if (i === selected) {
      process.stdout.write(chalk.bgCyan.black(`  ▶ ${(i + 1).toString().padStart(2)}. ${title.padEnd(50)}`));
      console.log(dur);
    } else {
      console.log(chalk.gray(`  ${(i + 1).toString().padStart(2)}. `) + chalk.white(title) + dur + uploader);
    }
  }

  console.log(chalk.gray('\n  ↑↓  Gezin    Enter  Seç    Q  Geri\n'));
}

export function renderPlayer(state: PlayerState, queue: Track[], fetchingMix: boolean) {
  clearScreen();

  const title = clip(state.title || 'Yükleniyor...', 54);
  const status = state.paused ? chalk.yellow('⏸  Duraklatıldı') : chalk.green('▶  Çalıyor');
  const progress = bar(state.timePos, state.duration);
  const time = `${fmt(state.timePos)} / ${fmt(state.duration)}`;

  console.log(chalk.cyan.bold('\n  yt-music-cli\n'));
  console.log(`  ${status}`);
  console.log(`\n  ${chalk.white.bold(title)}\n`);
  console.log(`  ${progress}  ${chalk.gray(time)}\n`);

  if (fetchingMix && queue.length === 0) {
    console.log(chalk.gray('  Mix yükleniyor...\n'));
  } else if (queue.length > 0) {
    console.log(chalk.gray('  Sırada:'));
    for (let i = 0; i < Math.min(queue.length, 4); i++) {
      console.log(chalk.gray(`    ${i + 1}. ${clip(queue[i].title, 52)}`));
    }
    if (queue.length > 4) {
      console.log(chalk.gray(`    +${queue.length - 4} şarkı daha`));
    }
    console.log();
  }

  console.log(chalk.gray('  Space Duraklat/Devam    N Sonraki    ←→ ±10s    S Arama    Q Çıkış\n'));
}
