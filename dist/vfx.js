
/*
 * vfx.js v1.0.0
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

'use strict';

var vmath = require('vmath');
var memop = require('memop');

class Effect {
  constructor() {
    this._emitters = [];
  }

  setCamPos(pos) {
    for (let i = 0; i < this._emitters.length; ++i) {
      let emitter = this._emitters[i];
      emitter._camPos = pos;
    }
  }

  start () {
    for (let i = 0; i < this._emitters.length; ++i) {
      let emitter = this._emitters[i];
      if (!emitter.disabled) {
        emitter.tick();
      }
    }
  }

  tick(dt) {
    for (let i = 0; i < this._emitters.length; ++i) {
      let emitter = this._emitters[i];
      if (!emitter.disabled) {
        emitter.tick(dt);
      }
    }
  }

  addEmitter(emitter) {
    if (this._emitters.indexOf(emitter) === -1) {
      this._emitters.push(emitter);
    }
  }

  removeEmitter(emitter) {
    let idx = this._emitters.indexOf(emitter);
    if (idx !== -1) {
      this._emitters.splice(idx, 1);
    }
  }
}

class Particle {
  constructor() {
    this.life = 1.0;
    this.velocity = vmath.vec3.new(0, 1, 0);

    // internal state
    this.age = 0.0;
    this.position = vmath.vec3.new(0, 0, 0);
    this._distanceToCam = 1;
  }

  reset () {
    // internal state
    this.age = 0.0;
    vmath.vec3.set(this.position, 0, 0, 0);
    this._distanceToCam = 1;
  }
}

class Emitter {
  constructor() {
    this.emitRate = 10; // number of particles emitted per spawn metric (per second, per world unit, ...)
    this.maxParticles = 0; // the total number of particles the emitter will emit (if available, otherwise zero)

    // internal states
    this.disabled = true;
    this.age = 0.0;
    this.emittedCount = 0; // number of particles already emitted

    this._nextEmits = 0.0;
    this._particles = new memop.RecyclePool(function () {
      return new Particle();
    }, 100);

    this._camPos = null;
  }

  start() {
    if (!this.disabled) {
      return;
    }

    this.disabled = false;
  }

  stop() {
    if (this.disabled) {
      return;
    }

    this.age = 0.0;
    this.disabled = true;
  }

  tick(dt) {
    if (this.disabled) {
      return;
    }

    this.age += dt;

    // update exists particles
    for (let i = 0; i < this._particles.length; ++i) {
      let p = this._particles.data[i];
      p.age += dt;

      if (p.age >= p.life) {
        p.reset();
        this._particles.remove(i);
        --i;
        continue;
      }

      vmath.vec3.scaleAndAdd(p.position, p.position, p.velocity, dt);

      // calculate sorting
      if (this._camPos) {
        p._distanceToCam = -vmath.vec3.squaredDistance(p.position, this._camPos);
      }
    }

    // check if spawn new particle
    this._nextEmits += this.emitRate * dt;
    if (this._nextEmits >= 1) {
      let spawns = Math.floor(this._nextEmits);
      this._nextEmits -= spawns;

      while (spawns > 0) {
        let p = this._particles.add();
        this.emittedCount += 1;

        vmath.vec3.random(p.velocity, vmath.randomRange(0.1, 10));
        p.life = vmath.randomRange(1,10);

        // calculate sorting
        if (this._camPos) {
          p._distanceToCam = -vmath.vec3.squaredDistance(p.position, this._camPos);
        }

        --spawns;
      }
    }

    if (this._camPos) {
      // NOTE: javascript not support partially sort
      this._particles._data.sort((a, b) => {
        return a._distanceToCam - b._distanceToCam;
      });
    }
  }
}

var index = {
  Effect,
  Emitter,
};

module.exports = index;
//# sourceMappingURL=vfx.js.map
