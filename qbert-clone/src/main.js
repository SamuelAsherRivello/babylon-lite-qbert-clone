import "./style.css";
import versionText from "../../version.txt?raw";
import { Game, KEY_DIRECTION } from "./game.js";
import { createRenderer } from "./renderer.js";

const version = versionText.trim().replace("version=", "");
const read = (k, f) => {
  try {
    return localStorage.getItem(k) ?? f;
  } catch {
    return f;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, String(v));
  } catch {
    /* Storage is optional. */
  }
};
let best = Number(read("qbert.best", "0")) || 0,
  muted = read("qbert.muted", "false") === "true",
  audio,
  loaded = false,
  errorMessage = "",
  help = false;
const game = new Game();
document.querySelector("#app").innerHTML = `
  <div class="surround" aria-hidden="true"></div>
  <div id="ui_layer">
    <header class="corner top-left"><span class="brandmark">Q</span><div><strong>Qbert Clone</strong><small>THE METAL EDITION</small></div></header>
    <nav class="corner top-right"><a href="https://github.com/SamuelAsherRivello/babylon-lite-qbert-clone" target="_blank" rel="noopener">SOURCE <span>↗</span></a></nav>
    <aside class="side-copy left-copy" aria-hidden="true"><span class="eyebrow">PRECISION / PLAY</span><h2>ONE MORE<br>HOP.</h2><div class="rule-line"></div><p>28 surfaces.<br>One electric instinct.</p><span class="serial">SERIES 01 — TITANIUM</span></aside>
    <aside class="side-copy right-copy"><span class="eyebrow">OPERATOR NOTES</span><div class="note"><b>01</b><p>Change every top<br>to <em>amber.</em></p></div><div class="note"><b>02</b><p>Stay one hop ahead<br>of the coil.</p></div><div class="note"><b>03</b><p>Blue discs bring<br>you home.</p></div><div class="mini-pyramid" aria-hidden="true">◇<br>◇ ◇<br>◇ ◇ ◇</div></aside>
    <div class="corner bottom-left"><button id="sound" aria-label="Toggle sound"></button><button id="fullscreen" aria-label="Toggle fullscreen">⛶ <span>FULLSCREEN</span></button></div>
    <div class="corner bottom-right"><i></i><span id="gpu-label">INITIALIZING</span><span>v${version}</span></div>
  </div>
  <main class="cabinet" aria-label="Qbert Clone arcade game">
    <div class="screw s1"></div><div class="screw s2"></div><div class="screw s3"></div><div class="screw s4"></div>
    <div class="cabinet-inner">
      <header class="marquee"><div class="edition">RIVELLO ARCADE <span>№ 001</span></div><h1>QBERT<span>CLONE</span></h1><div class="subtitle"><span></span> HOP. TRANSFORM. SURVIVE. <span></span></div></header>
      <section class="scoreboard" aria-label="Scoreboard"><div><small>SCORE</small><strong id="score">000000</strong></div><div class="best"><small>PERSONAL BEST</small><strong id="best">000000</strong></div><div class="lives-box"><small>LIVES</small><strong id="lives">● ● ●</strong></div></section>
      <section class="arena"><canvas id="game" aria-label="Isometric metal pyramid game board"></canvas>
        <div class="arena-top"><span id="round">LEVEL 01 <b>/ ROUND 01</b></span><button id="pause" aria-label="Pause game" title="Pause (P or Escape)">Ⅱ</button></div>
        <div class="target"><span class="target-chip"></span><span id="target-label">TARGET COLOR</span><strong id="progress">00 / 28</strong></div>
        <div id="notice" aria-live="polite"></div>
        <div id="overlay"><div class="overlay-card"><div class="overlay-icon">◇</div><span id="overlay-kicker" class="eyebrow">SYSTEM CHECK</span><h2 id="overlay-title">Warming up<br>the metal.</h2><p id="overlay-copy">Initializing the WebGPU engine…</p><button id="primary" class="primary" hidden>LET’S HOP <span>↗</span></button><button id="secondary" class="text-button" hidden>HOW TO PLAY</button></div></div>
      </section>
      <footer class="console"><div class="control-copy"><span class="eyebrow">MAKE YOUR MOVE</span><p>WASD / ARROW KEYS<br><span>or tap a direction</span></p><button id="help" class="text-button">HOW TO PLAY <span>?</span></button></div><div class="dpad" aria-label="Virtual direction controller">
        <button data-dir="ul" aria-label="Hop upper left" title="W / Up">↖<small>W ↑</small></button><button data-dir="ur" aria-label="Hop upper right" title="D / Right">↗<small>D →</small></button><button data-dir="dl" aria-label="Hop lower left" title="A / Left">↙<small>A ←</small></button><button data-dir="dr" aria-label="Hop lower right" title="S / Down">↘<small>S ↓</small></button>
      </div></footer><div class="cabinet-bottom">WEBGPU <span>•</span> BABYLON LITE <span>•</span> ORIGINAL METALWORK</div>
    </div>
  </main>`;
const $ = (s) => document.querySelector(s);
function sound(type) {
  if (muted || !audio) return;
  const frequencies = {
    hop: 330,
    paint: 660,
    death: 95,
    disc: 880,
    clear: 1046,
    freeze: 520,
    extra: 1320,
  };
  const osc = audio.createOscillator(),
    gain = audio.createGain();
  osc.type = type === "death" ? "sawtooth" : "sine";
  osc.frequency.setValueAtTime(frequencies[type] || 440, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    (frequencies[type] || 440) * (type === "death" ? 0.3 : 1.5),
    audio.currentTime + 0.12,
  );
  gain.gain.setValueAtTime(0.045, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.19);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.2);
}
function unlock() {
  if (!audio)
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  audio?.resume().catch(() => {});
}
let overlayKey = "";
function update(error) {
  if (error) {
    errorMessage = error.message;
    loaded = false;
  }
  if (game.score > best) {
    best = game.score;
    save("qbert.best", best);
  }
  $("#score").textContent = String(game.score).padStart(6, "0");
  $("#best").textContent = String(best).padStart(6, "0");
  $("#lives").textContent =
    game.lives <= 5
      ? "● ".repeat(Math.max(0, game.lives)).trim()
      : `● ×${game.lives}`;
  $("#round").innerHTML =
    `LEVEL ${String(game.level).padStart(2, "0")} <b>/ ROUND ${String(game.round).padStart(2, "0")}</b>`;
  $("#progress").textContent =
    `${String(game.completed).padStart(2, "0")} / 28`;
  $("#target-label").textContent =
    game.target === 2
      ? "TWO HOPS → AMBER"
      : game.revert
        ? "AMBER • REVISITS REVERT"
        : "TARGET COLOR";
  $("#notice").textContent =
    game.noticeTime > 0 ? game.notice : game.freeze > 0 ? "TIME FREEZE" : "";
  $("#pause").disabled =
    !loaded || !["playing", "paused"].includes(game.status);
  $("#pause").textContent = game.status === "paused" ? "▶" : "Ⅱ";
  $("#sound").innerHTML =
    `${muted ? "◌" : "◖"} <span>SOUND ${muted ? "OFF" : "ON"}</span>`;
  $("#sound").setAttribute("aria-pressed", String(!muted));
  $("#gpu-label").textContent = loaded
    ? "WEBGPU ONLINE"
    : errorMessage
      ? "WEBGPU REQUIRED"
      : "INITIALIZING";
  const key = errorMessage
    ? "error"
    : !loaded
      ? "loading"
      : help
        ? "help"
        : game.status;
  $("#overlay").hidden = key === "playing";
  if (key !== overlayKey) {
    overlayKey = key;
    let title, copy, kicker, primary, secondary;
    if (key === "loading") {
      kicker = "SYSTEM CHECK";
      title = "Warming up<br>the metal.";
      copy = "Initializing the WebGPU engine…";
    }
    if (key === "error") {
      kicker = "GRAPHICS OFFLINE";
      title = "WebGPU required";
      copy =
        "Open in a current Chrome or Edge with graphics acceleration enabled. " +
        errorMessage;
      primary = "RETRY";
    }
    if (key === "ready") {
      kicker = "THE METAL EDITION";
      title = "A classic.<br>A new surface.";
      copy =
        "Hop across the pyramid. Turn every top amber. Stay one step ahead.";
      primary = "LET’S HOP";
      secondary = "HOW TO PLAY";
    }
    if (key === "paused") {
      kicker = "TAKE A BREATHER";
      title = "Holding position.";
      copy = "Your pyramid will be right here.";
      primary = "RESUME";
      secondary = "RESTART RUN";
    }
    if (key === "game-over") {
      kicker = "RUN COMPLETE";
      title = "One more hop?";
      copy = `You scored ${game.score.toLocaleString()} points.<br>Personal best: ${best.toLocaleString()}.`;
      primary = "PLAY AGAIN";
      secondary = "HOW TO PLAY";
    }
    if (key === "round-clear") {
      kicker = "PYRAMID COMPLETE";
      title = "Solid gold.";
      copy = `Every surface transformed.<br>${game.score.toLocaleString()} points • Ready for the next round?`;
      primary = "NEXT ROUND";
    }
    if (key === "help") {
      kicker = "FIELD MANUAL";
      title = "Master the pyramid.";
      copy =
        "<strong>W / ↑ = ↖ &nbsp; D / → = ↗<br>A / ← = ↙ &nbsp; S / ↓ = ↘</strong><br>Turn all 28 tops amber. Falling or red, purple and silver enemies costs a life.<br><br>Hop outward from a blue disc’s edge to return to the top. Lure the purple coil to score 500.<br><br>Catch green balls to freeze enemies; catch green gremlins before they undo tiles. P / Esc pauses. Four rounds per level.";
      primary = "GOT IT";
    }
    $("#overlay-kicker").textContent = kicker || "";
    $("#overlay-title").innerHTML = title || "";
    $("#overlay-copy").innerHTML = copy || "";
    $("#primary").hidden = !primary;
    $("#primary").textContent = primary || "";
    $("#secondary").hidden = !secondary;
    $("#secondary").textContent = secondary || "";
    $("#overlay").classList.toggle("manual", key === "help");
  }
  while (game.events.length) sound(game.events.shift());
  document.body.dataset.state = key;
}
function showHelp() {
  if (game.status === "playing") game.pause();
  help = true;
  update();
}
$("#primary").onclick = () => {
  unlock();
  if (errorMessage) {
    location.reload();
    return;
  }
  if (help) {
    help = false;
    if (game.status === "paused") game.pause();
  } else if (game.status === "paused") game.pause();
  else if (game.status === "round-clear") game.nextRound();
  else game.reset();
  update();
};
$("#secondary").onclick = () => {
  unlock();
  if (game.status === "paused") {
    help = false;
    game.reset();
    update();
  } else showHelp();
};
$("#pause").onclick = () => {
  game.pause();
  update();
};
$("#help").onclick = showHelp;
$("#sound").onclick = () => {
  unlock();
  muted = !muted;
  save("qbert.muted", muted);
  update();
};
$("#fullscreen").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    game.message("FULLSCREEN UNAVAILABLE");
  }
};
let held = null,
  heldFor = 0;
function move(dir) {
  unlock();
  if (loaded && !help) game.move(dir);
}
for (const button of document.querySelectorAll("[data-dir]")) {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    held = button.dataset.dir;
    heldFor = 0;
    move(held);
    button.classList.add("pressed");
  });
  const release = () => {
    held = null;
    button.classList.remove("pressed");
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("click", (event) => {
    if (event.detail === 0) move(button.dataset.dir);
  });
}
window.addEventListener("keydown", (event) => {
  if (
    event.target instanceof HTMLElement &&
    event.target.matches("input,textarea,select")
  )
    return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key,
    dir = KEY_DIRECTION[key];
  if (dir) {
    event.preventDefault();
    if (!event.repeat) {
      held = dir;
      heldFor = 0;
      move(dir);
    }
  }
  if (key === "p" || key === "Escape") {
    event.preventDefault();
    if (help) help = false;
    else game.pause();
    update();
  }
  if ((key === "Enter" || key === " ") && !$("#primary").hidden) {
    event.preventDefault();
    $("#primary").click();
  }
});
window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (KEY_DIRECTION[key] === held) held = null;
});
function suspend() {
  held = null;
  if (game.status === "playing") game.pause();
  update();
}
window.addEventListener("blur", suspend);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) suspend();
});
let last = performance.now();
function inputFrame(now) {
  const dt = (now - last) / 1000;
  last = now;
  if (held && loaded && !help) {
    heldFor += dt;
    if (heldFor > 0.28) game.move(held);
  }
  requestAnimationFrame(inputFrame);
}
requestAnimationFrame(inputFrame);
update();
createRenderer($("#game"), game, update)
  .then(() => {
    loaded = true;
    update();
  })
  .catch((error) => {
    console.error(error);
    update(error);
  });
// Read-only diagnostics make runtime verification possible without altering game state.
window.qbert = {
  snapshot: () => ({
    status: game.status,
    score: game.score,
    lives: game.lives,
    level: game.level,
    round: game.round,
    completed: game.completed,
    player: { ...game.player },
    enemies: game.enemies.map((e) => ({ type: e.type, r: e.r, c: e.c })),
    webgpu: loaded,
    version,
  }),
};
