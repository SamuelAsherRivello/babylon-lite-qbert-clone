export const ROWS = 7;
export const DIRECTIONS = { ul: [-1, -1], ur: [-1, 0], dl: [1, 0], dr: [1, 1] };
export const KEY_DIRECTION = {
  w: "ul",
  ArrowUp: "ul",
  d: "ur",
  ArrowRight: "ur",
  a: "dl",
  ArrowLeft: "dl",
  s: "dr",
  ArrowDown: "dr",
};
export const valid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c <= r;
export const index = (r, c) => (r * (r + 1)) / 2 + c;
export const tiles = () =>
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: r + 1 }, (_, c) => ({ r, c, value: 0 })),
  ).flat();

export class Game {
  constructor(random = Math.random) {
    this.random = random;
    this.events = [];
    this.reset();
    this.status = "ready";
  }
  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.round = 1;
    this.nextLife = 8000;
    this.serial = 0;
    this.setupRound();
    this.status = "playing";
  }
  setupRound() {
    this.board = tiles();
    this.player = { r: 0, c: 0 };
    this.hop = null;
    this.enemies = [];
    this.discs = [true, true];
    this.time = 0;
    this.spawnAt = 4;
    this.spawnCount = 0;
    this.freeze = 0;
    this.invulnerable = 1.7;
    this.notice = "COLOR EVERY TOP";
    this.noticeTime = 2.5;
    this.target = this.level === 1 || this.level === 3 ? 1 : 2;
    this.revert = this.level >= 3;
  }
  emit(type) {
    this.events.push(type);
  }
  addScore(n) {
    this.score += n;
    while (this.score >= this.nextLife) {
      this.lives++;
      this.nextLife += 8000;
      this.emit("extra");
    }
  }
  get completed() {
    return this.board.filter((t) => t.value === this.target).length;
  }
  message(text) {
    this.notice = text;
    this.noticeTime = 2;
  }
  pause() {
    if (this.status === "playing") this.status = "paused";
    else if (this.status === "paused") this.status = "playing";
  }
  nextRound() {
    if (this.status !== "round-clear") return;
    this.round++;
    if (this.round > 4) {
      this.round = 1;
      this.level++;
    }
    this.setupRound();
    this.status = "playing";
  }
  move(direction) {
    if (this.status !== "playing" || this.hop || !DIRECTIONS[direction])
      return false;
    const [dr, dc] = DIRECTIONS[direction],
      { r, c } = this.player;
    let to = { r: r + dr, c: c + dc },
      kind = "jump";
    if (!valid(to.r, to.c)) {
      const side =
        r === 4 && c === 0 && direction === "ul"
          ? 0
          : r === 4 && c === r && direction === "ur"
            ? 1
            : -1;
      if (side >= 0 && this.discs[side]) {
        this.discs[side] = false;
        kind = "disc";
        to = { r: 0, c: 0 };
        const snakes = this.enemies.filter((e) => e.type === "snake").length;
        this.addScore(snakes * 500);
        this.enemies = this.enemies.filter((e) => e.type !== "snake");
        this.emit("disc");
      } else kind = "fall";
    }
    this.hop = {
      from: { r, c },
      to,
      elapsed: 0,
      duration: kind === "disc" ? 1.1 : kind === "fall" ? 0.48 : 0.22,
      kind,
    };
    this.facing = direction;
    this.emit("hop");
    return true;
  }
  land() {
    const hop = this.hop;
    this.hop = null;
    if (hop.kind === "fall") {
      this.die();
      return;
    }
    this.player = { ...hop.to };
    if (hop.kind === "disc") this.invulnerable = 1.5;
    const tile = this.board[index(this.player.r, this.player.c)];
    if (tile.value < this.target) {
      tile.value++;
      this.addScore(25);
      this.emit("paint");
    } else if (this.revert) tile.value = this.target === 2 ? 1 : 0;
    this.collide();
    if (this.status === "playing" && this.completed === 28) {
      this.addScore(
        1000 +
          (this.level - 1) * 250 +
          (this.round - 1) * 100 +
          this.discs.filter(Boolean).length * 50,
      );
      this.status = "round-clear";
      this.enemies = [];
      this.emit("clear");
    }
  }
  die() {
    this.lives--;
    this.emit("death");
    this.enemies = [];
    this.hop = null;
    this.freeze = 0;
    this.player = { r: 0, c: 0 };
    this.invulnerable = 2;
    this.spawnAt = this.time + 3;
    this.message("@!#?@!");
    if (this.lives <= 0) this.status = "game-over";
  }
  collide() {
    if (this.hop || this.status !== "playing") return;
    for (const e of [...this.enemies])
      if (e.r === this.player.r && e.c === this.player.c) {
        if (e.type === "green") {
          this.enemies = this.enemies.filter((x) => x !== e);
          this.freeze = 4;
          this.addScore(100);
          this.message("TIME FREEZE");
          this.emit("freeze");
        } else if (e.type === "slick") {
          this.enemies = this.enemies.filter((x) => x !== e);
          this.addScore(300);
          this.emit("paint");
        } else if (this.invulnerable <= 0) {
          this.die();
          break;
        }
      }
  }
  spawn() {
    const cycle = ["red", "egg", "red", "green", "slick", "red", "side", "egg"];
    const type = cycle[this.spawnCount++ % cycle.length];
    if (this.enemies.length >= 7) return;
    const side = this.random() < 0.5 ? 0 : 1;
    const e = {
      id: ++this.serial,
      type,
      r: type === "side" ? 6 : 0,
      c: type === "side" ? (side ? 6 : 0) : 0,
      side,
      next: this.time + 1.05,
      from: null,
      movedAt: this.time,
    };
    this.enemies.push(e);
  }
  stepEnemy(e) {
    e.from = { r: e.r, c: e.c };
    e.movedAt = this.time;
    if (e.type === "snake") {
      const choices = Object.values(DIRECTIONS)
        .map(([dr, dc]) => ({ r: e.r + dr, c: e.c + dc }))
        .filter((p) => valid(p.r, p.c));
      const distance = (p) =>
        Math.abs(p.c - this.player.c) +
        Math.abs(p.r - p.c - (this.player.r - this.player.c));
      choices.sort((a, b) => distance(a) - distance(b));
      Object.assign(e, choices[0]);
    } else if (e.type === "side") {
      e.r--;
      e.c = e.side ? e.r : 0;
    } else {
      e.r++;
      if (this.random() > 0.5) e.c++;
    }
    if (!valid(e.r, e.c)) {
      this.enemies = this.enemies.filter((x) => x !== e);
      return;
    }
    if (e.type === "egg" && e.r === 6) {
      e.type = "snake";
      this.message("THE COIL IS HUNTING");
    }
    if (e.type === "slick") this.board[index(e.r, e.c)].value = 0;
    e.next =
      this.time +
      Math.max(0.48, 1.15 - this.level * 0.07 - this.round * 0.025) +
      (e.type === "snake" ? 0.1 : 0);
  }
  tick(dt) {
    if (this.status !== "playing") return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.noticeTime = Math.max(0, this.noticeTime - dt);
    if (this.hop) {
      this.hop.elapsed += dt;
      if (this.hop.elapsed >= this.hop.duration) this.land();
    }
    if (this.status !== "playing") return;
    if (this.freeze > 0) {
      this.freeze = Math.max(0, this.freeze - dt);
      for (const e of this.enemies) e.next += dt;
      this.spawnAt += dt;
    } else {
      if (this.time >= this.spawnAt) {
        this.spawn();
        this.spawnAt =
          this.time + Math.max(1.6, 3.8 - this.level * 0.2 - this.round * 0.15);
      }
      for (const e of [...this.enemies])
        if (this.time >= e.next) this.stepEnemy(e);
    }
    this.collide();
  }
}
