import chalk from 'chalk';
import type { PlayerState } from './player';
import type { Track, Playlist } from './types';

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

export function renderSearch(query: string, hint = '', hasFavorites = false) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli\n') + '\n';
  if (hint) out += chalk.gray(`  ${hint}\n`) + '\n';
  out += chalk.white('  Search: ') + chalk.white.bold(query) + chalk.gray(' █');
  if (hasFavorites && !query) {
    out += chalk.gray('\n\n  L  Favoriler');
  }
  process.stdout.write(out);
}

export function renderResults(tracks: Track[], selected: number) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Arama Sonuçları\n') + '\n';

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const title = clip(t.title, 48);
    const dur = t.duration ? chalk.gray(` [${fmt(t.duration)}]`) : '';
    const uploader = t.uploader ? chalk.gray.italic(`  ${clip(t.uploader, 22)}`) : '';

    if (i === selected) {
      out += chalk.bgCyan.black(`  ▶ ${(i + 1).toString().padStart(2)}. ${title.padEnd(50)}`) + dur + '\n';
    } else {
      out += chalk.gray(`  ${(i + 1).toString().padStart(2)}. `) + chalk.white(title) + dur + uploader + '\n';
    }
  }

  out += chalk.gray('\n  ↑↓  Gezin    Enter  Seç    Q  Geri\n') + '\n';
  process.stdout.write(out);
}

const CLR = '\x1B[K'; // clear to end of line

export function renderPlayer(state: PlayerState, queue: Track[], fetchingMix: boolean, favorite = false) {
  const favIcon = favorite ? chalk.red(' ♥') : '';
  const title = clip(state.title || 'Yükleniyor...', 54) + favIcon;
  const status = state.paused ? chalk.yellow('⏸  Duraklatıldı') : chalk.green('▶  Çalıyor');
  const progress = bar(state.timePos, state.duration);
  const time = `${fmt(state.timePos)} / ${fmt(state.duration)}`;

  const lines = [
    '',
    chalk.cyan.bold('  yt-music-cli'),
    '',
    `  ${status}`,
    '',
    `  ${chalk.white.bold(title)}`,
    '',
    `  ${progress}  ${chalk.gray(time)}`,
    '',
  ];

  if (fetchingMix && queue.length === 0) {
    lines.push(chalk.gray('  Mix yükleniyor...'), '');
  } else if (queue.length > 0) {
    lines.push(chalk.gray('  Sırada:'));
    for (let i = 0; i < Math.min(queue.length, 4); i++) {
      lines.push(chalk.gray(`    ${i + 1}. ${clip(queue[i].title, 52)}`));
    }
    if (queue.length > 4) {
      lines.push(chalk.gray(`    +${queue.length - 4} şarkı daha`));
    }
    lines.push('');
  }

  lines.push(chalk.gray('  Space Duraklat/Devam    P Önceki    N Sonraki    ←→ ±10s    F Favori    L Liste'), '');
  lines.push(chalk.gray('  A Playlist\'e Ekle    O Playlistler    S Arama    Q Çıkış'), '');

  // Cursor home, overwrite each line with clear-to-end, then clear remaining below
  process.stdout.write('\x1B[H' + lines.map(l => l + CLR).join('\n') + '\x1B[J');
}

export function renderFavorites(favorites: Track[], selected: number) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Favoriler\n') + '\n';

  if (favorites.length === 0) {
    out += chalk.gray('  Henüz favori şarkı yok.\n') + '\n';
    out += chalk.gray('  Q  Geri\n') + '\n';
    process.stdout.write(out);
    return;
  }

  for (let i = 0; i < favorites.length; i++) {
    const t = favorites[i];
    const title = clip(t.title, 48);
    const dur = t.duration ? chalk.gray(` [${fmt(t.duration)}]`) : '';
    const uploader = t.uploader ? chalk.gray.italic(`  ${clip(t.uploader, 22)}`) : '';

    if (i === selected) {
      out += chalk.bgCyan.black(`  ♥ ${(i + 1).toString().padStart(2)}. ${title.padEnd(50)}`) + dur + '\n';
    } else {
      out += chalk.red('  ♥ ') + chalk.gray(`${(i + 1).toString().padStart(2)}. `) + chalk.white(title) + dur + uploader + '\n';
    }
  }

  out += chalk.gray('\n  ↑↓  Gezin    Enter  Çal    Q  Geri\n') + '\n';
  process.stdout.write(out);
}

export function renderPlaylistList(playlists: Playlist[], selected: number) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Playlistler\n') + '\n';

  if (playlists.length === 0) {
    out += chalk.gray('  Henüz playlist yok.\n') + '\n';
    out += chalk.gray('  C  Yeni Playlist    Q  Geri\n') + '\n';
    process.stdout.write(out);
    return;
  }

  for (let i = 0; i < playlists.length; i++) {
    const p = playlists[i];
    const count = chalk.gray(` (${p.tracks.length} şarkı)`);
    const name = clip(p.name, 44);

    if (i === selected) {
      out += chalk.bgCyan.black(`  ▶ ${(i + 1).toString().padStart(2)}. ${name.padEnd(46)}`) + count + '\n';
    } else {
      out += chalk.gray(`  ${(i + 1).toString().padStart(2)}. `) + chalk.white(name) + count + '\n';
    }
  }

  out += chalk.gray('\n  ↑↓  Gezin    Enter  Aç    C  Yeni    D  Sil    Q  Geri\n') + '\n';
  process.stdout.write(out);
}

export function renderPlaylistDetail(playlist: Playlist, selected: number) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray(`  ─  ${clip(playlist.name, 30)}\n`) + '\n';

  if (playlist.tracks.length === 0) {
    out += chalk.gray('  Bu playlist boş.\n') + '\n';
    out += chalk.gray('  Q  Geri\n') + '\n';
    process.stdout.write(out);
    return;
  }

  for (let i = 0; i < playlist.tracks.length; i++) {
    const t = playlist.tracks[i];
    const title = clip(t.title, 48);
    const dur = t.duration ? chalk.gray(` [${fmt(t.duration)}]`) : '';
    const uploader = t.uploader ? chalk.gray.italic(`  ${clip(t.uploader, 22)}`) : '';

    if (i === selected) {
      out += chalk.bgCyan.black(`  ▶ ${(i + 1).toString().padStart(2)}. ${title.padEnd(50)}`) + dur + '\n';
    } else {
      out += chalk.gray(`  ${(i + 1).toString().padStart(2)}. `) + chalk.white(title) + dur + uploader + '\n';
    }
  }

  out += chalk.gray('\n  ↑↓  Gezin    Enter  Çal    D  Şarkıyı Sil    Q  Geri\n') + '\n';
  process.stdout.write(out);
}

export function renderPlaylistPicker(playlists: Playlist[], selected: number, trackTitle: string) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Playlist\'e Ekle\n') + '\n';
  out += chalk.white(`  Şarkı: ${clip(trackTitle, 50)}\n`) + '\n';

  if (playlists.length === 0) {
    out += chalk.gray('  Henüz playlist yok. Önce bir playlist oluşturun.\n') + '\n';
    out += chalk.gray('  C  Yeni Playlist    Q  İptal\n') + '\n';
    process.stdout.write(out);
    return;
  }

  for (let i = 0; i < playlists.length; i++) {
    const p = playlists[i];
    const count = chalk.gray(` (${p.tracks.length} şarkı)`);
    const name = clip(p.name, 44);

    if (i === selected) {
      out += chalk.bgCyan.black(`  ▶ ${(i + 1).toString().padStart(2)}. ${name.padEnd(46)}`) + count + '\n';
    } else {
      out += chalk.gray(`  ${(i + 1).toString().padStart(2)}. `) + chalk.white(name) + count + '\n';
    }
  }

  out += chalk.gray('\n  ↑↓  Gezin    Enter  Ekle    C  Yeni Playlist    Q  İptal\n') + '\n';
  process.stdout.write(out);
}

export function renderNewPlaylistInput(name: string) {
  let out = '\x1B[H\x1B[2J';
  out += chalk.cyan.bold('\n  yt-music-cli') + chalk.gray('  ─  Yeni Playlist\n') + '\n';
  out += chalk.white('  İsim: ') + chalk.white.bold(name) + chalk.gray(' █\n') + '\n';
  out += chalk.gray('  Enter  Oluştur    Esc  İptal\n') + '\n';
  process.stdout.write(out);
}
