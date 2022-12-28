import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.keyDownSubscribers = [];
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        this.initKeys();

        this.sceneFolders = new Map();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    clearSceneFolders() {
      this.gui.destroy();
      this.sceneFolders = new Map();
      this.gui = new dat.GUI();
    }

    initScenes(scenes, activeScene, callBack) {
      this.activeScene = activeScene;
      this.gui.add(this, 'activeScene', scenes).name("Selected Scene: ").onChange((activeScene) => {
        this.clearSceneFolders()
        callBack(activeScene);
      });
    }

    initLightFolder() {
        this.sceneFolders.set(
          "lights",
          this.gui.addFolder('Lights')
        )
        this.lights = {}
    }

    initCameras(cameras, defaultCamera, callback) {
      this.activatedCamera = defaultCamera;
      const cameraData = cameras[this.activatedCamera]();
      if (cameraData.allowInteraction) {
        this.setActiveCamera(cameraData.camera);
      }
      callback(cameraData.camera)

      this.sceneFolders.set(
        "cameras",
        this.gui.add(this, 'activatedCamera', Object.keys(cameras)).name('Selected Camera: ').onChange((activeCamera) => {
          const cameraData = cameras[activeCamera]();
          if (cameraData.allowInteraction) {
            this.setActiveCamera(cameraData.camera);
          }
          callback(cameraData.camera);
        })
      )
    }

    createLightSource(key, initialState, switchCallback) {
        this.lights[key] = initialState;
        this.sceneFolders.get("lights").add(this.lights, key).name(key).onChange(switchCallback)
    }

    subscribeKeyDownEvent(callback) {
        this.keyDownSubscribers.push(callback);
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        this.keyDownSubscribers.forEach((callback) => callback(event))
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}