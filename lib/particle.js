'use strict';

import { vec3 } from 'vmath';

export default class Particle {
  constructor() {
    this.life = 1.0;
    this.velocity = vec3.new(0, 1, 0);

    // internal state
    this.age = 0.0;
    this.position = vec3.new(0, 0, 0);
    this._distanceToCam = 1;
  }

  reset() {
    // internal state
    this.age = 0.0;
    vec3.set(this.position, 0, 0, 0);
    this._distanceToCam = 1;
  }
}