import { createConnection, type Socket } from 'net';
import { EventEmitter } from 'events';
import { existsSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const IS_WIN = process.platform === 'win32';
const SOCKET = IS_WIN
  ? '\\\\.\\pipe\\yt-music-mpv'
  : join(tmpdir(), 'yt-music-mpv.sock');

export interface PlayerState {
  title: string;
  paused: boolean;
  timePos: number;
  duration: number;
  volume: number;
}

export class Player extends EventEmitter {
  private proc: ReturnType<typeof Bun.spawn> | null = null;
  private socket: Socket | null = null;
  private buf = "";
  private reqId = 0;
  private pending = new Map<number, (r: any) => void>();

  state: PlayerState = {
    title: "",
    paused: false,
    timePos: 0,
    duration: 0,
    volume: 100,
  };

  async start() {
    if (!IS_WIN) {
      try { unlinkSync(SOCKET); } catch {}
    }

    this.proc = Bun.spawn(
      [
        "mpv",
        "--no-video",
        "--no-terminal",
        `--input-ipc-server=${SOCKET}`,
        "--idle=yes",
      ],
      { stderr: "ignore", stdout: "ignore" },
    );

    await this.waitForSocket();
    await this.connect();
    await this.observe();
  }

  private async waitForSocket(timeout = 5000): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (IS_WIN) {
        const ok = await new Promise<boolean>((resolve) => {
          const s = createConnection(SOCKET)
            .on('connect', () => { s.destroy(); resolve(true); })
            .on('error', () => resolve(false));
        });
        if (ok) return;
      } else {
        if (existsSync(SOCKET)) return;
      }
      await Bun.sleep(50);
    }
    throw new Error(`mpv socket did not appear within ${timeout}ms: ${SOCKET}`);
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createConnection(SOCKET)
        .on("connect", resolve)
        .on("error", reject)
        .on("data", (d) => this.onData(d.toString()));
    });
  }

  private async observe() {
    await this.send("observe_property", 1, "media-title");
    await this.send("observe_property", 2, "pause");
    await this.send("observe_property", 3, "time-pos");
    await this.send("observe_property", 4, "duration");
    await this.send("observe_property", 5, "volume");
  }

  private onData(data: string) {
    this.buf += data;
    const lines = this.buf.split("\n");
    this.buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);

        if (msg.request_id !== undefined) {
          this.pending.get(msg.request_id)?.(msg);
          this.pending.delete(msg.request_id);
        }

        if (msg.event === "property-change") {
          this.onPropChange(msg.name, msg.data);
        } else if (msg.event === "end-file") {
          this.emit("end-file", msg);
        } else if (msg.event === "start-file") {
          this.emit("start-file");
        }
      } catch {}
    }
  }

  private onPropChange(name: string, value: any) {
    if (value == null) return;
    switch (name) {
      case "media-title":
        this.state.title = value;
        break;
      case "pause":
        this.state.paused = value;
        break;
      case "time-pos":
        this.state.timePos = value;
        break;
      case "duration":
        this.state.duration = value;
        break;
      case "volume":
        this.state.volume = Math.round(value);
        break;
    }
    this.emit("state");
  }

  private send(...args: any[]): Promise<any> {
    return new Promise((resolve) => {
      const id = ++this.reqId;
      this.pending.set(id, resolve);
      this.socket!.write(
        JSON.stringify({ command: args, request_id: id }) + "\n",
      );
    });
  }

  async loadTrack(url: string) {
    await this.send("loadfile", url, "replace");
  }

  async togglePause() {
    await this.send("cycle", "pause");
  }
  async seek(secs: number) {
    await this.send("seek", secs, "relative");
  }

  async quit() {
    try {
      await this.send("quit");
    } catch {}
    this.socket?.destroy();
    this.proc?.kill();
  }

  async setVolume(level: number) {
    const clamped = Math.max(0, Math.min(100, level));
    await this.send("set_property", "volume", clamped);
  }

  async getVolume() {
    const result = await this.send("get_property", "volume");
    return result?.data ?? 100;
  }
}
