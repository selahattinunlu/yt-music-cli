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
  process.stdout.write('\x1B[H\x1B[2J');
}

function cursorHome() {
  process.stdout.write('\x1B[H');
}

function clearBelow() {
  process.stdout.write('\x1B[J');
}

export function renderSearch(query: string, hint = '', hasFavorites = false) {
  clearScreen();
  console.log(chalk.cyan.bold('\n  yt-music-cli\n'));
  if (hint) console.log(chalk.gray(`  ${hint}\n`));
  process.stdout.write(chalk.white('  Search: ') + chalk.white.bold(query) + chalk.gray(' █'));
  if (hasFavorites && !query) {
    console.log(chalk.gray('\n\n  L  Favoriler'));
  }
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

export function renderPlayer(state: PlayerState, queue: Track[], fetchingMix: boolean, favorite = false) {
  cursorHome();

  const favIcon = favorite ? chalk.red(' ♥') : '';
  const title = clip(state.title || 'Yükleniyor...', 54) + favIcon;
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

  console.log(chalk.gray('  Space Duraklat/Devam    P Önceki    N Sonraki    ←→ ±10s    F Favori    L Liste    S Arama    Q Çıkış\n'));
  clearBelow();
}

export function renderFavorites(favorites: Track[], selected: number) {
  clearScreen();
  console.log(chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Favoriler\n'));

  if (favorites.length === 0) {
    console.log(chalk.gray('  Henüz favori şarkı yok.\n'));
    console.log(chalk.gray('  Q  Geri\n'));
    return;
  }

  for (let i = 0; i < favorites.length; i++) {
    const t = favorites[i];
    const title = clip(t.title, 48);
    const dur = t.duration ? chalk.gray(` [${fmt(t.duration)}]`) : '';
    const uploader = t.uploader ? chalk.gray.italic(`  ${clip(t.uploader, 22)}`) : '';

    if (i === selected) {
      process.stdout.write(chalk.bgCyan.black(`  ♥ ${(i + 1).toString().padStart(2)}. ${title.padEnd(50)}`));
      console.log(dur);
    } else {
      console.log(chalk.red('  ♥ ') + chalk.gray(`${(i + 1).toString().padStart(2)}. `) + chalk.white(title) + dur + uploader);
    }
  }

  console.log(chalk.gray('\n  ↑↓  Gezin    Enter  Çal    Q  Geri\n'));
}
