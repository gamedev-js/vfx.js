document.addEventListener('readystatechange', () => {
  if ( document.readyState !== 'complete' ) {
    return;
  }

  // modules
  // const {vec3, randomRange} = window.vmath;
  const ddraw = window.ddraw;
  const sgraph = window.sgraph;
  const vfx = window.vfx;
  const pstats = window.pstats;

  let stats = pstats.new(document.body, {
    values: {
      fps: { desc: 'Framerate (FPS)', below: 30, average: 500 },
      particles: { desc: 'Total Particles' },
      memory: { desc: 'Memory', extension: 'memory.used', average: 200, threshold: true },
    },
    extensions: [
      'memory'
    ],
  });

  // init global
  let canvasEL = document.getElementById('canvas');
  let shell = new ddraw.Shell(canvasEL);
  let renderer = shell._renderer;
  let particleRenderer = new window.ParticleRenderer(renderer._regl);

  let mainTexture = renderer._regl.texture();

  // init textures
  window.resl({
    manifest: {
      cube: {
        type: 'image',
        src: './cube.png',
      },
      logo: {
        type: 'image',
        src: './logo.png',
      }
    },
    onError(err) {
      console.error(err);
    },
    onDone(assets) {
      mainTexture({
        data: assets.logo,
        wrapS: 'repeat',
        wrapT: 'repeat',
        mag: 'linear',
        min: 'nearest mipmap linear',
        mipmap: 'nice',
        flipY: true
      });
    },
  });

  //
  let maxCount = 1024;
  let vertStride = 9;

  // dynamic buffer
  let vbufferArray = new Float32Array(maxCount * vertStride * 4);
  let vbuffer = renderer._regl.buffer({
    length: vbufferArray.length * 4, /* bytes */
    usage: 'dynamic',
  });

  let ibufferArray = new Uint16Array(maxCount * 6);
  let dst = 0;
  for (let i = 0; i < maxCount; ++i) {
    let baseIndex = i * 4;
    ibufferArray[dst++] = baseIndex;
    ibufferArray[dst++] = baseIndex + 1;
    ibufferArray[dst++] = baseIndex + 2;
    ibufferArray[dst++] = baseIndex;
    ibufferArray[dst++] = baseIndex + 2;
    ibufferArray[dst++] = baseIndex + 3;
  }
  let ibuffer = renderer._regl.elements({
    primitive: 'triangles',
    data: ibufferArray,
    usage: 'static',
    type: 'uint16'
  });


  // init scene
  let root = new sgraph.Node('root');

  let effect = new vfx.Effect();
  let emitter = new vfx.Emitter();
  emitter.emitRate = 10;
  emitter.start();
  effect.addEmitter(emitter);

  let quadVerts = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
  ];

  // frame
  shell.frame(() => {
    stats('fps').frame();
    stats('memory').snapshot();

    effect.setCamPos(shell._orbit._curEye);
    effect.tick(shell._dt);

    let totalParticles = 0;

    for (let i = 0; i < effect._emitters.length; ++i) {
      let emitter = effect._emitters[i];
      if (emitter.disabled) {
        continue;
      }

      totalParticles += emitter._particles.length;

      // submit buffer
      for ( let j = 0; j < emitter._particles.length; ++j ) {
        let particle = emitter._particles.data[j];

        for (let v = 0; v < 4; ++v) {
          let offset = vertStride * (4 * j + v);

          // quad
          vbufferArray[offset + 0] = quadVerts[v][0];
          vbufferArray[offset + 1] = quadVerts[v][1];

          // pos
          vbufferArray[offset + 2] = particle.position.x;
          vbufferArray[offset + 3] = particle.position.y;
          vbufferArray[offset + 4] = particle.position.z;

          // color
          vbufferArray[offset + 5] = 1;
          vbufferArray[offset + 6] = 1;
          vbufferArray[offset + 7] = 1;
          vbufferArray[offset + 8] = 1.0 - particle.age / particle.life;
        }
      }

      let stride = 8 + 12 + 16;
      vbuffer.subdata(vbufferArray.subarray(0, emitter._particles.length * vertStride * 4));
      renderer.addCommand(particleRenderer.drawBillboards, {
        quads: {
          buffer: vbuffer,
          offset: 0,
          stride: stride,
          size: 2,
          type: renderer._regl._gl.FLOAT
        },
        positions: {
          buffer: vbuffer,
          offset: 8,
          stride: stride,
          size: 3,
          type: renderer._regl._gl.FLOAT
        },
        colors: {
          buffer: vbuffer,
          offset: 20,
          stride: stride,
          size: 4,
          type: renderer._regl._gl.FLOAT
        },
        transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        mainTexture: mainTexture,
        count: emitter._particles.length * 6,
        elements: ibuffer,
      }, true);
    }

    stats('particles').value = totalParticles;
    stats().tick();

    renderer.drawNode(root);
  });
});