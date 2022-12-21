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
    throw 'Child class must override update(t)'
  }

  apply() {
    throw 'Child class must override apply()'
  }
}