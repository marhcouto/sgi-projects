import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';
import { cloneCamera } from './utils.js';

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

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    initLightFolder() {
        this.lightFolder = this.gui.addFolder('Lights');
        this.lights = {}
    }

    initCameras(cameras, defaultCamera, callback) {
        this.activatedCamera = defaultCamera;
        let clonedCamera = cloneCamera(cameras[this.activatedCamera]);
        this.setActiveCamera(clonedCamera);
        callback(clonedCamera)
        this.gui.add(this, 'activatedCamera', Object.keys(cameras)).name('Selected Camera: ').onChange((activeCamera) => {
            let clonedCamera = cloneCamera(cameras[activeCamera]);
            this.setActiveCamera(clonedCamera);
            callback(clonedCamera);
        });
    }

    createLightSource(key, initialState, switchCallback) {
        this.lights[key] = initialState;
        this.lightFolder.add(this.lights, key).name(key).onChange(switchCallback)
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