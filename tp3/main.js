import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import {generateGameState, movePiece} from './checkers/CheckerState.js';
import { MyGameView } from './view/MyGameView.js';

const scenes = {
  glitchedBakery: "glitched_bakery.xml",
  testScene: "test_scene.xml",
    prisonCell: "prison_cell.xml",
    space: "space.xml"
};
Object.freeze(scenes);

function loadScene(myScene, myInterface, filename) {
  myInterface.clearSceneFolders();
  myInterface.initScenes(scenes, filename, (scene) => loadScene(myScene, myInterface, scene));
  myScene.resetScene();
  new MySceneGraph(filename, myScene);
}

function main() {
    const gameState = generateGameState(8);

	// Standard application, scene and interface setup
    const app = new CGFapplication(document.body);
    const myInterface = new MyInterface();
    const myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // create and load graph, and associate it to scene.
	  // Check console for loading errors
    loadScene(myScene, myInterface, scenes.testScene);
    new MyGameView(myScene, gameState);

    // start
    app.run();
}



main();
