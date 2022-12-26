import { CGFscene } from '../lib/CGF.js';
import { CGFaxis, CGFcamera, CGFshader } from '../lib/CGF.js';
import {degreeToRad} from "./utils.js";

export const UPDATE_FREQ = 100;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface) {
    super();
    this.updateCallbacks = new Map();
    this.interface = myinterface;
  }

  registerForUpdate(key, callback) {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, callback);
    }
  }

  unregisterForUpdate(key) {
    this.updateCallbacks.delete(key);
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;
    this.globalPulse = 0;

    this.initCameras();

    this.enableTextures(true);

    this.globalPulse = 0
    this.shader = new CGFshader(this.gl, 'scenes/shaders/SGI_TP1_XML_T03_G11/shader.vert', 'scenes/shaders/SGI_TP1_XML_T03_G11/shader.frag');

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(UPDATE_FREQ);
    this.setPickEnabled(true);
  }


  initHiglightedList() {

    let switchHighlight = (id) => {
      return (enabled) => this.updateObjectHighlighting(id, enabled);
    }

    for (let entry of this.graph.highlightedComponentsData) {
      this.interface.createHighlightedEntry(entry.id, entry.active, switchHighlight(entry.id));
    }
  }


  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
  }
  /**
   * Initializes the scene lights with the values read from the XML file.
   */
  initLights() {
    let i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (let key in this.graph.lights) {
      if (i >= 8)
        break;              // Only eight lights allowed by WebGL.

      if (this.graph.lights.hasOwnProperty(key)) {
        let light = this.graph.lights[key];

        this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
        this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
        this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
        this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

        if (light[1] === "spot") {
          this.lights[i].setSpotCutOff(light[6]);
          this.lights[i].setSpotExponent(light[7]);
          this.lights[i].setSpotDirection(light[8][0] - light[2][0], light[8][1] - light[2][1], light[8][2] - light[2][2]);
        }

        this.lights[i].setVisible(true);
        if (light[0])
          this.lights[i].enable();
        else
          this.lights[i].disable();

        this.lights[i].update();

        // This is a trick to trap the value of i inside a function so that a different callback is called for each light
        let freezerFunction = (idx) => {
          return (enabled) => this.updateLightState(idx, enabled)
        }

        this.interface.createLightSource(key, light[0], freezerFunction(i));

        i++;
      }
    }
  }

  updateLightState(index, enabled) {
    this.lights[index].setVisible(true);
    if (enabled) {
      this.lights[index].enable();
    } else {
      this.lights[index].disable();
    }
  }

  updateObjectHighlighting(id, enabled) {
    if (enabled) {
      this.graph.components[id].highlighted.active = true;
    } else {
      this.graph.components[id].highlighted.active = false;
    }
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }

  /** Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

    const views = { ...this.graph.views };
    views['playerView'] = () => {
      return {
        camera: this.gameView.playerCamera,
        allowInteraction: false
      }
    };
    this.interface.initCameras(views, this.graph.defaultView, (camera) => this.camera = camera);

    setTimeout(() => this.gameView.playerCamera.changeSide(), 3000);

    this.interface.initLightFolder();

    this.interface.initHighlightedFolder();

    this.initHiglightedList();

    this.initLights();

    this.interface.subscribeKeyDownEvent(this.graph.onKeyPress.bind(this.graph))

    this.sceneInited = true;

    this.setUpdatePeriod(UPDATE_FREQ);
  }

  update(t) {
    this.graph.update(t);

    for (const updateCb of this.updateCallbacks.values()) {
      updateCb(t);
    }
  }

  /**
   * Displays the scene.
   */
  display() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();
    this.axis.display();

    if (this.sceneInited) {
      // Lights index.

      // Reads the lights from the scene graph.
      for (let i = 0; i < this.lights.length; i++) {
        this.lights[i].update();
      }

      // Draw axis
      this.setDefaultAppearance();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();

      this.gameView.displayBoard();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }
}