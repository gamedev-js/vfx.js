'use strict';

export default class Effect {
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