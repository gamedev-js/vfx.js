'use strict';

class ParticleRenderer {
  constructor (regl) {
    this._regl = regl;
    this.drawPoints = regl({
      vert: `
        precision mediump float;
        uniform mat4 model, view, projection;

        attribute vec3 a_pos;
        attribute vec4 a_color;

        varying vec4 color;

        void main() {
          vec4 pos = projection * view * model * vec4(a_pos, 1);

          gl_Position = pos;
          gl_PointSize = 2.0;
          color = a_color;
        }
      `,

      frag: `
        precision mediump float;
        varying vec4 color;

        void main () {
          gl_FragColor = color;
        }
      `,

      primitive: 'points',

      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1
        },
        equation: {
          rgb: 'add',
          alpha: 'add'
        },
        color: [0, 0, 0, 0]
      },

      attributes: {
        a_pos: regl.prop('positions'),
        a_color: regl.prop('colors'),
      },

      uniforms: {
        model: regl.prop('transform'),
      },

      count: regl.prop('count'),
    });

    this.drawBillboards = regl({
      vert: `
        precision mediump float;
        uniform mat4 model, view, projection, invView;

        attribute vec2 a_quad;
        attribute vec3 a_pos;
        attribute vec4 a_color;

        varying vec4 color;
        varying vec2 uv;

        void main() {
          // normal
          // vec4 pos = projection * view * model * vec4(a_pos + vec3(a_quad, 0), 1);

          // billboard
          vec4 pos = view * model * vec4(a_pos, 1);
          pos.xy += a_quad.xy;
          pos = projection * pos;

          uv = vec2(a_quad * -0.5 + 0.5);

          gl_Position = pos;
          gl_PointSize = 2.0;
          color = a_color;
        }
      `,

      frag: `
        precision mediump float;
        uniform sampler2D u_mainTexture;

        varying vec4 color;
        varying vec2 uv;

        void main () {
          gl_FragColor = color * texture2D( u_mainTexture, uv );
        }
      `,

      depth: {
        enable: true,
        mask: false,
        func: 'less',
        range: [0, 1]
      },

      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1
        },
        equation: {
          rgb: 'add',
          alpha: 'add'
        },
        color: [0, 0, 0, 0]
      },

      attributes: {
        a_quad: regl.prop('quads'),
        a_pos: regl.prop('positions'),
        a_color: regl.prop('colors'),
      },

      uniforms: {
        model: regl.prop('transform'),
        u_mainTexture: regl.prop('mainTexture'),
      },

      elements: regl.prop('elements'),

      count: regl.prop('count'),
    });
  }
}

window.ParticleRenderer = ParticleRenderer;