import test from "node:test";
import assert from "node:assert/strict";
import { Game, valid, index, KEY_DIRECTION } from "../src/game.js";
const advance = (g, s) => {
  for (let t = 0; t < s; t += 0.025) g.tick(0.025);
};
const start = () => {
  const g = new Game(() => 0.4);
  g.reset();
  g.spawnAt = Infinity;
  return g;
};
const hop = (g, d) => {
  assert.equal(g.move(d), true);
  advance(g, 0.25);
};
test("28 unique pyramid tiles, index mapping and invalid edges", () => {
  const g = start();
  assert.equal(g.board.length, 28);
  g.board.forEach((t, i) => assert.equal(index(t.r, t.c), i));
  assert.equal(valid(7, 3), false);
  assert.equal(valid(2, 3), false);
});
test("keyboard directions use four diagonal commands", () => {
  assert.equal(KEY_DIRECTION.w, KEY_DIRECTION.ArrowUp);
  assert.equal(KEY_DIRECTION.a, "dl");
  assert.equal(KEY_DIRECTION.s, "dr");
  assert.equal(KEY_DIRECTION.d, "ur");
});
test("landing changes color once, scores, and locks input during a hop", () => {
  const g = start();
  g.move("dr");
  assert.equal(g.move("dr"), false);
  advance(g, 0.25);
  assert.deepEqual(g.player, { r: 1, c: 1 });
  assert.equal(g.score, 25);
  hop(g, "ul");
  hop(g, "dr");
  assert.equal(g.score, 50);
  assert.equal(g.completed, 2);
});
test("fall loses one life and preserves colored tiles", () => {
  const g = start();
  hop(g, "dl");
  hop(g, "ur");
  g.move("ul");
  advance(g, 0.6);
  assert.equal(g.lives, 2);
  assert.equal(g.score, 50);
  assert.equal(g.completed, 2);
  assert.deepEqual(g.player, { r: 0, c: 0 });
});
test("both discs consume once, return to apex, and award snake bonus", () => {
  for (const side of [0, 1]) {
    const g = start();
    g.player = { r: 4, c: side ? 4 : 0 };
    g.enemies = [{ id: 1, type: "snake", r: 5, c: 2, next: Infinity }];
    g.move(side ? "ur" : "ul");
    advance(g, 1.2);
    assert.equal(g.discs[side], false);
    assert.equal(g.lives, 3);
    assert.equal(g.score, 525);
    assert.equal(g.enemies.length, 0);
    assert.deepEqual(g.player, { r: 0, c: 0 });
    g.player = { r: 4, c: side ? 4 : 0 };
    g.move(side ? "ur" : "ul");
    advance(g, 0.6);
    assert.equal(g.lives, 2);
  }
});
test("round clear bonus and four rounds advance the level", () => {
  const g = start();
  g.board.forEach((t) => (t.value = 1));
  g.board[index(1, 1)].value = 0;
  hop(g, "dr");
  assert.equal(g.status, "round-clear");
  assert.equal(g.score, 1125);
  g.nextRound();
  assert.equal(g.round, 2);
  g.round = 4;
  g.status = "round-clear";
  g.nextRound();
  assert.equal(g.level, 2);
  assert.equal(g.target, 2);
  assert.equal(g.completed, 0);
});
test("two-hop and reverting color rules", () => {
  const g = start();
  g.level = 2;
  g.setupRound();
  g.spawnAt = Infinity;
  hop(g, "dr");
  assert.equal(g.completed, 0);
  hop(g, "ul");
  hop(g, "dr");
  assert.equal(g.completed, 1);
  g.level = 3;
  g.setupRound();
  hop(g, "dr");
  hop(g, "ul");
  hop(g, "dr");
  assert.equal(g.board[index(1, 1)].value, 0);
  g.level = 4;
  g.setupRound();
  g.board[index(1, 1)].value = 2;
  hop(g, "dr");
  assert.equal(g.board[index(1, 1)].value, 1);
});
test("pause freezes state and ignores moves", () => {
  const g = start();
  g.pause();
  advance(g, 5);
  assert.equal(g.time, 0);
  assert.equal(g.move("dl"), false);
  g.pause();
  hop(g, "dl");
  assert.equal(g.score, 25);
});
test("hostile collision, respawn immunity and game over", () => {
  const g = start();
  g.invulnerable = 0;
  g.enemies = [{ type: "red", r: 0, c: 0, next: Infinity }];
  g.collide();
  assert.equal(g.lives, 2);
  g.enemies = [{ type: "red", r: 0, c: 0, next: Infinity }];
  g.collide();
  assert.equal(g.lives, 2);
  g.invulnerable = 0;
  g.lives = 1;
  g.collide();
  assert.equal(g.status, "game-over");
  assert.equal(g.move("dr"), false);
  g.reset();
  assert.equal(g.lives, 3);
  assert.equal(g.score, 0);
});
test("green ball freezes, gremlin can be caught, bonus life threshold", () => {
  const g = start();
  g.enemies = [{ type: "green", r: 0, c: 0, next: Infinity }];
  g.collide();
  assert.equal(g.freeze, 4);
  assert.equal(g.score, 100);
  g.enemies = [{ type: "slick", r: 0, c: 0, next: Infinity }];
  g.collide();
  assert.equal(g.score, 400);
  g.addScore(7600);
  assert.equal(g.lives, 4);
  g.addScore(8000);
  assert.equal(g.lives, 5);
});
test("egg hatches, snake pursues, gremlin erases and side enemy climbs", () => {
  const g = start();
  const egg = { type: "egg", r: 5, c: 2 };
  g.stepEnemy(egg);
  assert.equal(egg.type, "snake");
  g.player = { r: 4, c: 2 };
  g.stepEnemy(egg);
  assert.deepEqual({ r: egg.r, c: egg.c }, { r: 5, c: 2 });
  g.board[index(1, 0)].value = 1;
  g.stepEnemy({ type: "slick", r: 0, c: 0 });
  assert.equal(g.board[index(1, 0)].value, 0);
  const side = { type: "side", r: 6, c: 6, side: 1 };
  g.stepEnemy(side);
  assert.equal(side.r, 5);
  assert.equal(side.c, 5);
});
test("freeze stops enemy movement and spawn clock", () => {
  const g = start();
  g.freeze = 2;
  g.enemies = [{ type: "red", r: 1, c: 0, next: 0 }];
  advance(g, 1);
  assert.equal(g.enemies[0].r, 1);
  assert.ok(g.freeze < 2);
});
test("spawn roster includes all distinct behaviors", () => {
  const g = start();
  const seen = new Set();
  for (let n = 0; n < 8; n++) {
    g.enemies = [];
    g.spawn();
    seen.add(g.enemies[0].type);
  }
  assert.deepEqual([...seen].sort(), ["egg", "green", "red", "side", "slick"]);
});
