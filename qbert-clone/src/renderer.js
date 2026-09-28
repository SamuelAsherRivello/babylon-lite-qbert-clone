import {
  createEngine,
  createSceneContext,
  createArcRotateCamera,
  enableOrthographicCamera,
  createHemisphericLight,
  createDirectionalLight,
  createBox,
  createSphere,
  createCylinder,
  createTorus,
  createPbrMaterial,
  createTransformNode,
  setParent,
  setSubtreeVisible,
  addToScene,
  registerScene,
  startEngine,
  onBeforeRender,
  resizeEngine,
  loadProceduralSkyEnvironment,
  createTexture2DFromPixels,
} from "@babylonjs/lite";

// From this camera, +Z points down-right and +X down-left.
export const world = (r, c) => ({
  x: (r - c) * 1.08,
  y: -r * 0.53,
  z: c * 1.08,
});
export async function createRenderer(canvas, game, update) {
  if (!navigator.gpu)
    throw new Error("WebGPU is not available in this browser.");
  const engine = await createEngine(canvas, { antialias: true });
  const scene = createSceneContext(engine);
  scene.clearColor = { r: 0.019, g: 0.027, b: 0.034, a: 1 };
  scene.camera = createArcRotateCamera(Math.PI / 4, 0.88, 22, {
    x: 2.1,
    y: -1.55,
    z: 2.1,
  });
  enableOrthographicCamera(scene.camera, { halfHeight: 5.55 });
  addToScene(scene, createHemisphericLight([0, 1, 0], 0.45));
  const key = createDirectionalLight([-0.4, -1, -0.7], 2.2);
  key.diffuse = [1, 0.9, 0.72];
  addToScene(scene, key);
  const rim = createDirectionalLight([1, -0.25, 0.5], 1.8);
  rim.diffuse = [0.48, 0.77, 1];
  addToScene(scene, rim);
  await loadProceduralSkyEnvironment(scene, {
    brdfUrl: import.meta.env.BASE_URL + "assets/brdf-lut.png",
    sunDirection: [-0.7, 1, -0.4],
    luminance: 0.7,
    turbidity: 2,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
  });
  scene.imageProcessing.toneMappingEnabled = true;
  scene.imageProcessing.exposure = 0.95;
  const metal = (color, rough = 0.28, metallic = 0.85) =>
    createPbrMaterial({
      baseColorFactor: [...color, 1],
      metallicFactor: metallic,
      roughnessFactor: rough,
    });
  const steel = metal([0.43, 0.5, 0.57]),
    trim = metal([0.16, 0.21, 0.25]),
    black = metal([0.035, 0.046, 0.054], 0.4, 0.5);
  const silver = metal([0.72, 0.8, 0.87], 0.19),
    gold = metal([1, 0.47, 0.065], 0.25, 0.7),
    cyan = metal([0.06, 0.66, 0.73], 0.3, 0.5),
    orange = metal([1, 0.24, 0.025], 0.22, 0.55);
  const red = metal([0.85, 0.035, 0.04], 0.2, 0.45),
    purple = metal([0.43, 0.06, 0.8], 0.24, 0.6),
    green = metal([0.12, 0.85, 0.25], 0.3, 0.45),
    white = metal([0.92, 0.96, 1], 0.24, 0.15);
  const panels = [metal([0.18, 0.29, 0.35], 0.37, 0.65), cyan, gold];
  // Original deterministic brushed-metal grain, with a broad studio-light reflection.
  const pixels = new Uint8Array(256 * 256 * 4);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const grain = Math.sin(y * 73.31) * 9 + Math.sin(x * 0.7 + y * 3.13) * 3;
      const light = 175 + 55 * Math.exp(-(((x - 90) / 37) ** 2)) + grain;
      const i = (y * 256 + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = light;
      pixels[i + 3] = 255;
    }
  const brushed = createTexture2DFromPixels(engine, pixels, 256, 256, {
    minFilter: "linear",
    magFilter: "linear",
  });
  for (const material of [steel, trim, silver, ...panels])
    material.baseColorTexture = brushed;
  function mesh(shape, opts, mat, x, y, z, parent) {
    const m = shape(engine, opts);
    m.material = mat;
    if (parent) setParent(m, parent);
    m.position.set(x, y, z);
    addToScene(scene, m);
    return m;
  }
  function box(w, h, d, mat, x, y, z, parent) {
    return mesh(
      createBox,
      { width: w, height: h, depth: d },
      mat,
      x,
      y,
      z,
      parent,
    );
  }
  function ball(d, mat, x, y, z, parent) {
    return mesh(
      createSphere,
      { diameter: d, segments: 18 },
      mat,
      x,
      y,
      z,
      parent,
    );
  }
  const tops = [];
  for (const t of game.board) {
    const p = world(t.r, t.c);
    box(1.065, 0.54, 1.065, steel, p.x, p.y - 0.28, p.z);
    box(1.085, 0.045, 1.085, silver, p.x, p.y - 0.025, p.z);
    tops.push(box(0.91, 0.035, 0.91, panels[0], p.x, p.y + 0.015, p.z));
    // Recessed face panels and machined horizontal seams.
    box(0.78, 0.25, 0.012, trim, p.x, p.y - 0.3, p.z + 0.538);
    box(0.012, 0.25, 0.78, trim, p.x + 0.538, p.y - 0.3, p.z);
    for (const o of [-0.34, 0.34]) {
      ball(0.055, silver, p.x + o, p.y - 0.3, p.z + 0.554);
      ball(0.055, silver, p.x + 0.554, p.y - 0.3, p.z + o);
    }
  }
  const discs = [0, 1].map((side) => {
    const p = world(4, side ? 4 : 0),
      root = createTransformNode("rescue-disc");
    root.position.set(
      p.x + (side ? -0.9 : 0),
      p.y + 0.1,
      p.z + (side ? 0 : -0.9),
    );
    const disk = mesh(
      createCylinder,
      { diameter: 1.08, height: 0.12, tessellation: 40 },
      silver,
      0,
      0,
      0,
      root,
    );
    mesh(
      createTorus,
      { diameter: 0.86, thickness: 0.08, tessellation: 36 },
      cyan,
      0,
      0.09,
      0,
      root,
    );
    mesh(
      createCylinder,
      { diameter: 0.53, height: 0.03, tessellation: 32 },
      cyan,
      0,
      0.08,
      0,
      root,
    );
    return { root, disk };
  });
  function makeActor(type) {
    const root = createTransformNode(type);
    if (type === "player") {
      ball(0.54, orange, 0, 0.45, 0, root);
      for (const x of [-0.14, 0.14]) {
        const foot = ball(0.22, silver, x, 0.12, 0.13, root);
        foot.scaling.set(0.8, 0.45, 1.4);
        mesh(
          createCylinder,
          { diameter: 0.07, height: 0.2, tessellation: 10 },
          trim,
          x,
          0.23,
          0.02,
          root,
        );
        ball(0.17, white, x, 0.61, 0.22, root);
        ball(0.078, black, x, 0.62, 0.292, root);
      }
      const nose = mesh(
        createCylinder,
        {
          diameterTop: 0.17,
          diameterBottom: 0.2,
          height: 0.35,
          tessellation: 24,
        },
        orange,
        0,
        0.43,
        0.36,
        root,
      );
      nose.rotation.x = Math.PI / 2;
      const hole = mesh(
        createCylinder,
        { diameter: 0.135, height: 0.01, tessellation: 24 },
        black,
        0,
        0.43,
        0.545,
        root,
      );
      hole.rotation.x = Math.PI / 2;
      mesh(
        createTorus,
        { diameter: 0.175, thickness: 0.035, tessellation: 24 },
        silver,
        0,
        0.43,
        0.55,
        root,
      ).rotation.x = Math.PI / 2;
    } else if (type === "snake") {
      for (let n = 0; n < 3; n++)
        mesh(
          createTorus,
          { diameter: 0.48 - n * 0.07, thickness: 0.12, tessellation: 20 },
          purple,
          0,
          0.13 + n * 0.12,
          0,
          root,
        );
      ball(0.34, purple, 0, 0.62, 0.02, root);
      for (const x of [-0.085, 0.085]) {
        ball(0.09, white, x, 0.67, 0.17, root);
        ball(0.044, black, x, 0.67, 0.21, root);
      }
    } else {
      const mat =
        type === "red"
          ? red
          : type === "egg"
            ? purple
            : type === "side"
              ? silver
              : green;
      const body = ball(type === "side" ? 0.4 : 0.45, mat, 0, 0.28, 0, root);
      if (type === "egg") body.scaling.y = 1.3;
      if (type === "slick" || type === "side")
        for (const x of [-0.11, 0.11]) {
          ball(0.1, white, x, 0.39, 0.18, root);
          ball(0.05, black, x, 0.4, 0.22, root);
        }
      if (type === "side")
        for (const x of [-0.27, 0.27])
          box(0.23, 0.08, 0.1, purple, x, 0.17, 0, root);
    }
    return root;
  }
  const player = makeActor("player");
  const shield = mesh(
    createTorus,
    { diameter: 0.65, thickness: 0.025, tessellation: 24 },
    cyan,
    0,
    0.08,
    0,
    player,
  );
  const pool = Array.from({ length: 7 }, () =>
    Object.fromEntries(
      ["red", "egg", "snake", "green", "slick", "side"].map((t) => [
        t,
        makeActor(t),
      ]),
    ),
  );
  function place(root, p, height = 0) {
    root.position.set(p.x, p.y + 0.065 + height, p.z);
  }
  let elapsed = 0;
  onBeforeRender(scene, (ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    elapsed += dt;
    game.tick(dt);
    game.board.forEach((t, i) => {
      const m =
        t.value === game.target
          ? panels[2]
          : t.value === 1
            ? panels[1]
            : panels[0];
      if (tops[i].material !== m) tops[i].material = m;
    });
    let p = world(game.player.r, game.player.c),
      height = 0;
    if (game.hop) {
      const h = game.hop,
        a = world(h.from.r, h.from.c),
        b = world(h.to.r, h.to.c),
        t = Math.min(1, h.elapsed / h.duration);
      p = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      };
      height = Math.sin(t * Math.PI) * (h.kind === "disc" ? 2 : 0.5);
      if (h.kind === "fall") height -= t * t * 3;
    } else if (game.status === "ready") height = Math.sin(elapsed * 3) * 0.05;
    place(player, p, height);
    player.rotation.y =
      { ul: Math.PI, ur: -Math.PI / 2, dl: Math.PI / 2, dr: 0 }[game.facing] ??
      Math.PI / 4;
    setSubtreeVisible(shield, game.invulnerable > 0);
    shield.rotation.y = elapsed * 2;
    discs.forEach((d, i) => {
      setSubtreeVisible(d.root, game.discs[i]);
      d.disk.rotation.y = elapsed;
    });
    pool.forEach((slot, i) => {
      const e = game.enemies[i];
      for (const [type, root] of Object.entries(slot)) {
        setSubtreeVisible(root, !!e && e.type === type);
        if (!e || e.type !== type) continue;
        let q = world(e.r, e.c),
          h = 0;
        const t = Math.min(1, (game.time - e.movedAt) / 0.2);
        if (e.from && t < 1) {
          const a = world(e.from.r, e.from.c);
          q = {
            x: a.x + (q.x - a.x) * t,
            y: a.y + (q.y - a.y) * t,
            z: a.z + (q.z - a.z) * t,
          };
          h = Math.sin(t * Math.PI) * 0.35;
        }
        place(root, q, h);
        root.rotation.y = Math.PI / 4;
      }
    });
    update();
  });
  const resize = () => resizeEngine(engine);
  new ResizeObserver(resize).observe(canvas);
  await registerScene(scene);
  await startEngine(engine);
  engine._device.lost.then(() =>
    update(new Error("The graphics device disconnected. Reload to reconnect.")),
  );
  return { engine, scene };
}
