/**
 * MyAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyAnimation {
  constructor(scene) {
    this.scene = scene;
  }

  update(t) {
    throw new Error('Child class must override update(t)');
  }

  apply() {
    throw new Error('Child class must override apply()');
  }

  done() {
    throw new Error('');
  }
}