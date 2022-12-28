import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import {generateGameState, movePiece} from './checkers/CheckerState.js';
import { MyGameView } from './view/MyGameView.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
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

	// get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	// or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 

    const filename = getUrlVars()['file'] || "SGI_TP1_XML_T03_G11_v03.xml";

    // create and load graph, and associate it to scene.
	// Check console for loading errors
    const myGraph = new MySceneGraph(filename, myScene);
    const myGameView = new MyGameView(myScene, gameState);

    // start
    app.run();
}



main();
