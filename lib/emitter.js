'use strict';

import { randomRange, vec3 } from 'vmath';
import { RecyclePool } from 'memop';
import Particle from './particle';

export default class Emitter {
  constructor() {
    this.emitRate = 10; // number of particles emitted per spawn metric (per second, per world unit, ...)
    this.maxParticles = 0; // the total number of particles the emitter will emit (if available, otherwise zero)

    // internal states
    this.disabled = true;
    this.age = 0.0;
    this.emittedCount = 0; // number of particles already emitted

    this._nextEmits = 0.0;
    this._particles = new RecyclePool(function () {
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

      vec3.scaleAndAdd(p.position, p.position, p.velocity, dt);

      // calculate sorting
      if (this._camPos) {
        p._distanceToCam = -vec3.squaredDistance(p.position, this._camPos);
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

        vec3.random(p.velocity, randomRange(0.1, 10));
        p.life = randomRange(1,10);

        // calculate sorting
        if (this._camPos) {
          p._distanceToCam = -vec3.squaredDistance(p.position, this._camPos);
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