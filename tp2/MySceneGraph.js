import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { MyCylinder } from './primitives/MyCylinder.js';
import { MySphere } from './primitives/MySphere.js';
import { MyTorus } from './primitives/MyTorus.js';
import { degreeToRad } from './utils.js';

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);

        this.curMaterial = 0;
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        this.views = {};

        if (children.length === 0) {
            return 'must have at least one view!'
        }

        let defaultView = this.reader.getString(viewsNode, 'default');
        if (defaultView == null) {
            return 'unable to parse views. Must define default view'
        }
        this.defaultView = defaultView;

        for (let i = 0; i < children.length; i++) {
            let curNode = children[i];
            let validView = curNode.nodeName === 'perspective' ||
                curNode.nodeName === 'ortho'
            if (!validView) {
                return `invalid view tag <${children[i].nodeName}>`
            }

            // Get id of the current view.
            var viewId = this.reader.getString(curNode, 'id');
            if (viewId == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            if (curNode.nodeName === 'perspective') {
                let near = this.reader.getFloat(curNode, 'near');
                if (!(near != null && !isNaN(near))) {
                    return "unable to parse near of the view for ID = " + viewId;
                }

                let far = this.reader.getFloat(curNode, 'far');
                if (!(far != null && !isNaN(far))) {
                    return "unable to parse far of the view for ID = " + viewId;
                }

                let angle = this.reader.getFloat(curNode, 'angle');
                if (!(angle != null && !isNaN(angle))) {
                    return "unable to parse angle of the view for ID = " + viewId;
                }

                let readFrom = false;
                let readTo = false;
                let grandChildren = curNode.children;
                let to;
                let from;


                for (let i = 0; i < grandChildren.length; i++) {
                    let curGrandChildren = grandChildren[i];
                    let validChildren = curGrandChildren.nodeName === 'from' ||
                        curGrandChildren.nodeName === 'to'

                    if (!validChildren) {
                        return `invalid view tag <${curGrandChildren.nodeName}>`
                    }

                    if (curGrandChildren.nodeName === 'from') {
                        if (readFrom) {
                            return `duplicated child ${curGrandChildren.nodeName} for view with id ${viewId}`
                        } else {
                            readFrom = true;
                        }
                        
                        const fromArray = this.parseCoordinates3D(curGrandChildren, 'view for ID ${viewId} and children ${curGrandChildren.nodeName}');
                        if (!Array.isArray(fromArray)) {
                            return fromArray;
                        }
                        from = vec3.fromValues(fromArray[0], fromArray[1], fromArray[2]);
                    }

                    if (curGrandChildren.nodeName === 'to') {
                        if (readTo) {
                            return `duplicated child ${curGrandChildren.nodeName} for view with id ${viewId}`
                        } else {
                            readTo = true;
                        }

                        const toArray = this.parseCoordinates3D(curGrandChildren, 'view for ID ${viewId} and children ${curGrandChildren.nodeName}');
                        if (!Array.isArray(toArray)) {
                            return toArray;
                        }
                        to = vec3.fromValues(toArray[0], toArray[1], toArray[2]);
                    }
                }

                if (!readFrom) {
                    return `missing from in view with id: ${viewId}`;
                }
                if (!readTo) {
                    return `missing to in view with id: ${viewId}`;
                }

                this.views[viewId] = new CGFcamera(degreeToRad(angle), near, far, from, to);
            }

            if (curNode.nodeName === 'ortho') {
                let near = this.reader.getFloat(curNode, 'near');
                if (!(near != null && !isNaN(near))) {
                    return "unable to parse near of the view for ID = " + viewId;
                }

                let far = this.reader.getFloat(curNode, 'far');
                if (!(far != null && !isNaN(far))) {
                    return "unable to parse far of the view for ID = " + viewId;
                }

                let left = this.reader.getFloat(curNode, 'left');
                if (!(left != null && !isNaN(left))) {
                    return "unable to parse left of the view for ID = " + viewId;
                }

                let right = this.reader.getFloat(curNode, 'right');
                if (!(right != null && !isNaN(right))) {
                    return "unable to parse right of the view for ID = " + viewId;
                }

                let top = this.reader.getFloat(curNode, 'top');
                if (!(top != null && !isNaN(top))) {
                    return "unable to parse top of the view for ID = " + viewId;
                }

                let bottom = this.reader.getFloat(curNode, 'bottom');
                if (!(bottom != null && !isNaN(bottom))) {
                    return "unable to parse bottom of the view for ID = " + viewId;
                }

                let readFrom = false;
                let readTo = false;
                let readUp = false;
                let grandChildren = curNode.children;
                let to;
                let from;
                let up = vec3.fromValues(0, 1, 0);

                for (let i = 0; i < grandChildren.length; i++) {
                    let curGrandChildren = grandChildren[i];
                    let validChildren = curGrandChildren.nodeName === 'from' ||
                        curGrandChildren.nodeName === 'to' ||
                        curGrandChildren.nodeName === 'up'

                    if (!validChildren) {
                        return `invalid view tag <${curGrandChildren.nodeName}>`
                    }

                    if (curGrandChildren.nodeName === 'from') {
                        if (readFrom) {
                            return `duplicated child ${curGrandChildren.nodeName} for view with id ${viewId}`
                        } else {
                            readFrom = true;
                        }

                        const fromArray = this.parseCoordinates3D(curGrandChildren, 'view for ID ${viewId} and children ${curGrandChildren.nodeName}');
                        if (!Array.isArray(fromArray)) {
                            return fromArray;
                        }
                        from = vec3.fromValues(fromArray[0], fromArray[1], fromArray[2]);
                    }

                    if (curGrandChildren.nodeName === 'to') {
                        if (readTo) {
                            return `duplicated child ${curGrandChildren.nodeName} for view with id ${viewId}`
                        } else {
                            readTo = true;
                        }
                        
                        const toArray = this.parseCoordinates3D(curGrandChildren, 'view for ID ${viewId} and children ${curGrandChildren.nodeName}');
                        if (!Array.isArray(toArray)) {
                            return toArray;
                        }
                        to = vec3.fromValues(toArray[0], toArray[1], toArray[2]);
                    }

                    if (curGrandChildren.nodeName === 'up') {
                        if (readUp) {
                            return `duplicated child ${curGrandChildren.nodeName} for view with id ${viewId}`
                        } else {
                            readUp = true;
                        }

                        const upArray = this.parseCoordinates3D(curGrandChildren, 'view for ID ${viewId} and children ${curGrandChildren.nodeName}');
                        if (!Array.isArray(upArray)) {
                            return upArray;
                        }
                        up = vec3.fromValues(upArray[0], upArray[1], upArray[2]);
                    }
                }

                if (!readFrom) {
                    return `missing from in view with id: ${viewId}`;
                }
                if (!readTo) {
                    return `missing to in view with id: ${viewId}`;
                }

                this.views[viewId] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
            }
        }

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = {};
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = aux;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
            
            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        let textureList = texturesNode.children;

        this.textures = {};

        for (let i = 0; i < textureList.length; i++) {
            let curTexture = textureList[i];

            // Get id of the current texture.
            const textureID = this.reader.getString(curTexture, 'id');
            if (textureID == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";

            const texturePath = this.reader.getString(curTexture, 'file');
            if (textureID == null) {
                return `no file defined for texture with id ${textureID}`;
            }

            this.textures[textureID] = new CGFtexture(this.scene, texturePath);
        }
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = {};

        let emissionComponent;
        let ambientComponent;
        let specularComponent;
        let diffuseComponent;

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            let readAmbient = false;
            let readDiffuse = false;
            let readEmission = false;
            let readSpecular = false;

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            let shininess = this.reader.getFloat(children[i], 'shininess')
            if (!(shininess != null && !isNaN(shininess))) {
                return `unable to parse shininess of the material with ID = ${materialID}`;
            }

            const materialComponents = children[i].children;
            for (let i = 0; i < materialComponents.length; i++) {
                let curMaterialComponent = materialComponents[i];
                let validMaterialComponent = curMaterialComponent.nodeName === 'emission' ||
                    curMaterialComponent.nodeName === 'ambient' ||
                    curMaterialComponent.nodeName === 'diffuse' ||
                    curMaterialComponent.nodeName === 'specular';

                if (!validMaterialComponent) {
                    return `invalid material component ${curMaterialComponent.nodeName} for material with id: ${materialID}`
                }

                if (curMaterialComponent.nodeName === 'emission' && readEmission) {
                    return `duplicated attribute emission for material with id: ${materialID}`
                }
                if (curMaterialComponent.nodeName === 'ambient' && readAmbient) {
                    return `duplicated attribute ambient for material with id: ${materialID}`
                }
                if (curMaterialComponent.nodeName === 'diffuse' && readDiffuse) {
                    return `duplicated attribute diffuse for material with id: ${materialID}`
                }
                if (curMaterialComponent.nodeName === 'specular' && readSpecular) {
                    return `duplicated attribute specular for material with id: ${materialID}`
                }

                const color = {}

                color['red'] = this.reader.getFloat(curMaterialComponent, 'r');
                if (!(color['red'] != null && !isNaN(color['red']))) {
                    return `unable to parse red component of ${curMaterialComponent.nodeName} at material with ID = ${materialID}`;
                }

                color['green'] = this.reader.getFloat(curMaterialComponent, 'g');
                if (!(color['green'] != null && !isNaN(color['green']))) {
                    return `unable to parse green component of ${curMaterialComponent.nodeName} at material with ID = ${materialID}`;
                }

                color['blue'] = this.reader.getFloat(curMaterialComponent, 'b');
                if (!(color['blue'] != null && !isNaN(color['blue']))) {
                    return `unable to parse blue component of ${curMaterialComponent.nodeName} at material with ID = ${materialID}`;
                }

                color['alpha'] = this.reader.getFloat(curMaterialComponent, 'a');
                if (!(color['alpha'] != null && !isNaN(color['alpha']))) {
                    return `unable to parse alpha component of ${curMaterialComponent.nodeName} at material with ID = ${materialID}`;
                }

                switch (curMaterialComponent.nodeName) {
                    case 'emission':
                        emissionComponent = color;
                        readEmission = true;
                        break;
                    case 'ambient':
                        ambientComponent = color;
                        readAmbient = true;
                        break;
                    case 'diffuse':
                        diffuseComponent = color;
                        readDiffuse = true;
                        break;
                    case 'specular':
                        specularComponent = color;
                        readSpecular = true;
                        break;
                }
            }

            if (!readDiffuse) {
                return `missing attribute diffuse from material with id: ${materialID}`;
            }
            if (!readAmbient) {
                return `missing attribute ambient from material with id: ${materialID}`;
            }
            if (!readSpecular) {
                return `missing attribute specular from material with id: ${materialID}`;
            }
            if (!readEmission) {
                return `missing attribute emission from material with id: ${materialID}`;
            }
    
            this.materials[materialID] = new CGFappearance(this.scene);
            this.materials[materialID].setAmbient(ambientComponent.red, ambientComponent.green, ambientComponent.blue, ambientComponent.alpha);
            this.materials[materialID].setDiffuse(diffuseComponent.red, diffuseComponent.green, diffuseComponent.blue, diffuseComponent.alpha);
            this.materials[materialID].setEmission(emissionComponent.red, emissionComponent.green, emissionComponent.blue, emissionComponent.alpha);
            this.materials[materialID].setSpecular(specularComponent.red, specularComponent.green, specularComponent.blue, specularComponent.alpha);
            this.materials[materialID].setShininess(shininess);
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        const children = transformationsNode.children;

        this.transformations = {};

        let grandChildren = [];

        // Any number of transformations.
        for (let i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            const transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            let transfMatrix = mat4.create();

            for (let j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        const coordinates = this.parseCoordinates3D(grandChildren[j], `translate transformation for ID ${transformationID}`);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        const scaleFactor = this.parseCoordinates3D(grandChildren[j], `scale transformation for ID ${transformationID}`);
                        if (!Array.isArray(scaleFactor))
                            return scaleFactor;
                        
                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, scaleFactor)
                        break;
                    case 'rotate':
                        const rotationData = this.parseRotation(grandChildren[j], `rotation transformation for ID ${transformationID}`);
                        
                        //Some type checking
                        if (typeof rotationData === 'string')
                            return rotationData;
                        
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotationData.angle, rotationData.axis);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    parseRectangle(primitiveId, node) {
        console.log(node)
        // x1
        var x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1)))
            return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

        // y1
        var y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1)))
            return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

        // x2
        var x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2) && x2 > x1))
            return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

        // y2
        var y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2) && y2 > y1))
            return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

        return new MyRectangle(this.scene, x1, x2, y1, y2);
    }

    parseTriangle(primitiveId, node) {
        console.log(node)
        let x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1))) {
            return `unable to parse x1 of the primitive coordinates for ID = ${primitiveId}`;
        }

        let y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1))) {
            return `unable to parse y1 of the primitive coordinates for ID = ${primitiveId}`
        }

        let z1 = this.reader.getFloat(node, 'z1');
        if (!(z1 != null && !isNaN(z1))) {
            return `unable to parse z1 of the primitive coordinates for ID = ${primitiveId}`
        }

        let x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2))) {
            return `unable to parse x2 of the primitive coordinates for ID = ${primitiveId}`
        }

        let y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2))) {
            return `unable to parse y2 of the primitive coordinates for ID = ${primitiveId}`
        }

        let z2 = this.reader.getFloat(node, 'z2');
        if (!(z2 != null && !isNaN(z2))) {
            return `unable to parse z2 of the primitive coordinates for ID = ${primitiveId}`
        }

        let x3 = this.reader.getFloat(node, 'x3');
        if (!(x3 != null && !isNaN(x3))) {
            return `unable to parse x3 of the primitive coordinates for ID = ${primitiveId}`
        }

        let y3 = this.reader.getFloat(node, 'y3');
        if (!(y3 != null && !isNaN(y3))) {
            return `unable to parse y3 of the primitive coordinates for ID = ${primitiveId}`
        }

        let z3 = this.reader.getFloat(node, 'z3');
        if (!(z3 != null && !isNaN(z3))) {
            return `unable to parse z3 of the primitive coordinates for ID = ${primitiveId}`
        }

        return new MyTriangle(this.scene, x1, y1, z1,
            x2, y2, z2,
            x3, y3, z3
        );
    }

    parseCylinder(primitiveId, node) {
        let base = this.reader.getFloat(node, 'base');
        if (!(base != null && !isNaN(base))) {
            return `unable to parse base of the primitive coordinates for ID = ${primitiveId}`;
        }

        let top = this.reader.getFloat(node, 'top');
        if (!(top != null && !isNaN(top))) {
            return `unable to parse top of the primitive coordinates for ID = ${primitiveId}`;
        }

        let height = this.reader.getFloat(node, 'height');
        if (!(height != null && !isNaN(height))) {
            return `unable to parse height of the primitive coordinates for ID = ${primitiveId}`;
        }

        let slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            return `unable to parse slices of the primitive coordinates for ID = ${primitiveId}`;
        }

        let stacks = this.reader.getInteger(node, 'stacks');
        if (!(stacks != null && !isNaN(stacks))) {
            return `unable to parse stacks of the primitive coordinates for ID = ${primitiveId}`;
        }

        return new MyCylinder(this.scene, base, top, height, slices, stacks);
    }

    parseSphere(primitiveId, node) {
        let radius = this.reader.getFloat(node, 'radius');
        if (!(radius != null && !isNaN(radius))) {
            return `unable to parse radius of the primitive coordinates for ID = ${primitiveId}`;
        }

        let slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            return `unable to parse slices of the primitive coordinates for ID = ${primitiveId}`;
        }

        let stacks = this.reader.getInteger(node, 'stacks');
        if (!(stacks != null && !isNaN(stacks))) {
            return `unable to parse stacks of the primitive coordinates for ID = ${primitiveId}`;
        }

        return new MySphere(this.scene, radius, slices, stacks);
    }

    parseTorus(primitiveId, node) {
        let inner = this.reader.getFloat(node, 'inner');
        if (!(inner != null && !isNaN(inner))) {
            return `unable to parse inner of the primitive coordinates for ID = ${primitiveId}`;
        }

        let outer = this.reader.getFloat(node, 'outer');
        if (!(outer != null && !isNaN(outer))) {
            return `unable to parse outer of the primitive coordinates for ID = ${primitiveId}`;
        }

        let slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            return `unable to parse slices of the primitive coordinates for ID = ${primitiveId}`;
        }

        let loops = this.reader.getInteger(node, 'loops');
        if (!(loops != null && !isNaN(loops))) {
            return `unable to parse loops of the primitive coordinates for ID = ${primitiveId}`;
        }

        return new MyTorus(this.scene, inner, outer, slices, loops);
    }

    parsePatch(primitiveId, node) {
        console.log(node);
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = {};

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;
            let primitiveParsingResult;

            // Retrieves the primitive coordinates.
            switch (primitiveType) {
                case 'rectangle':
                    primitiveParsingResult = this.parseRectangle(primitiveId, grandChildren[0]);    
                    break;
                case 'triangle':
                    primitiveParsingResult = this.parseTriangle(primitiveId, grandChildren[0]);
                    break;
                case 'cylinder':
                    primitiveParsingResult = this.parseCylinder(primitiveId, grandChildren[0]);
                    break;
                case 'sphere':
                    primitiveParsingResult = this.parseSphere(primitiveId, grandChildren[0]);
                    break;
                case 'torus':
                    primitiveParsingResult = this.parseTorus(primitiveId, grandChildren[0]);
                    break;
                case 'patch':
                    primitiveParsingResult = this.parsePatch(primitiveId, grandChildren[0]);
                    break;
                default:
                    return `unknown primitive type ${primitiveType}`;
            }
            
            if (typeof primitiveParsingResult === 'string') {
                return primitiveParsingResult;
            }

            this.primitives[primitiveId] = primitiveParsingResult;
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = {};

        var grandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            if (transformationIndex === -1) {
                return `missing node transformation from component with id: ${componentID}`
            }
            if (materialsIndex === -1) {
                return `missing node material from component with id: ${componentID}`
            }
            if (textureIndex === -1) {
                return `missing node texture from component with id: ${componentID}`
            }
            if (childrenIndex === -1) {
                return `missing node children from component with id: ${componentID}`
            }

            // Transformations
            const transformation = this.parseComponentTransformations(componentID, grandChildren[transformationIndex]);
            if(typeof transformation === 'string') {
                return transformation;
            }

            // Materials
            const materialList = this.parseComponentMaterials(componentID, grandChildren[materialsIndex]);
            if (!Array.isArray(materialList)) {
                return materialList;
            }

            // Texture
            const texture = this.parseComponentTextures(componentID, grandChildren[textureIndex]);
            if (typeof texture === 'string') {
                return texture
            }

            // Children
            const childrenList = this.parseComponentChildren(componentID, grandChildren[childrenIndex]);
            if (!Array.isArray(childrenList)) {
                return childrenList;
            }
            this.components[componentID] = {
                transformation: transformation,
                materials: materialList,
                texture: texture,
                children: childrenList
            };
        }

        console.log('Parsed components');
        return null;
    }

    parseComponentChildren(componentID, childrenNode) {
        const childrenArr = childrenNode.children;
        if (childrenArr.length == null) {
            return `expected at least one child when parsing component with id: ${componentID}`;
        }

        const childrenObj = []
        for (let i = 0; i < childrenArr.length; i++) {
            const curChild = childrenArr[i];
            const childID = this.reader.getString(curChild, 'id');
            if (curChild.nodeName === 'componentref') {
                childrenObj.push({
                    type: 'component',
                    id: childID
                });
            } else if (curChild.nodeName === 'primitiveref') {
                if (this.primitives[childID] == null) {
                    return `primitive with id ${childID} does not exist when parsing component's ${componentID} children`;
                }
                childrenObj.push({
                    type: 'primitive',
                    id: childID
                });
            } else {
                return `unexpected node with name '${curChild.nodeName}' when parsing component's ${componentID} children`
            }
        }

        return childrenObj;
    }

    /*
        This function returns an object with data about a componen't texture.
        It's propreties are:
        type: it's a string one of [id_ref, inherit, none]
        id (only when type is id_ref): the id of the referenced component
        lenS (only when type is id_ref): the length in S
        lenT (only when type is id_ref): the length in T
    */
    parseComponentTextures(componentID, textureNode) {
        if (textureNode.children.length !== 0) {
            return `expected no children at texture of node ${componentID}`;
        }

        const textureID = this.reader.getString(textureNode, 'id');
        if (textureID == null) {
            return `expected ID at texture of node ${componentID}`;
        }

        if (textureID === 'inherit' || textureID === 'none') {
            let inheritOrNoneHaveLengths = this.reader.hasAttribute(textureNode, 'length_s') ||
                this.reader.hasAttribute(textureNode, 'length_t');
            if (inheritOrNoneHaveLengths) {
                return `unexpected length_s or length_t of component's ${componentID} texture`
            }
            return {
                type: textureID
            }
        }

        if (!this.reader.hasAttribute(textureNode, 'length_s')) {
            return `expected length_s at texture of component with id ${componentID}`;
        }
        if (!this.reader.hasAttribute(textureNode, 'length_t')) {
            return `expected length_t at texture of component with id ${componentID}`;
        }

        const lenS = this.reader.getFloat(textureNode, 'length_s');
        const lenT = this.reader.getFloat(textureNode, 'length_t');

        if (isNaN(lenS)) {
            return `unable to parse length_s of the texture at component with id: ${componentID}`;
        }
        
        if (isNaN(lenT)) {
            return `unable to parse length_s of the texture at component with id: ${componentID}`;
        }
        return {
            type: 'id_ref',
            id: textureID,
            lenS: lenS,
            lenT: lenT
        };
    }

    // Returns an array with a component material id's
    parseComponentMaterials(componentID, materialsNode) {
        const materialList = materialsNode.children; 
        const materialIds = [];
        if (materialList.length === 0) {
            return `component with id '${componentID}' must have at least one material`;
        }

        for (let i = 0; i < materialList.length; i++) {
            const curMaterial = materialList[i];
            if (curMaterial.nodeName !== 'material') {
                return `unknown node ${curMaterial.nodeName} at component with id: ${componentID}`;
            }

            const materialID = this.reader.getString(curMaterial, 'id');
            if (materialID == null) {
                return `material does not contain id at component with id: ${componentID}`;
            }

            if (materialID === 'inherit') {
                materialIds.push(materialID);
            } else {
                const curMaterialObj = this.materials[materialID];
                if (curMaterialObj == null) {
                    return `material with id '${materialID}' referenced at component '${componentID}' does not exist`;
                }
                materialIds.push(materialID);
            }
        }
        return materialIds;
    }

    // Returns a matrix that represents a multiplication on all the transformations that must be applied to an object
    parseComponentTransformations(componentID, transformationsNode) {
        const transformationsList = transformationsNode.children;
        const finalTransformation = mat4.create();

         for (let i = 0; i < transformationsList.length; i++) {
            const curTransformationNode = transformationsList[i];
            
            switch (curTransformationNode.nodeName) {
                case 'translate':
                    const translateArray = this.parseCoordinates3D(curTransformationNode, `translate at component with id: ${componentID}`);
                    if (!Array.isArray(translateArray)) {
                        return translateArray;
                    }
                    mat4.translate(finalTransformation, finalTransformation, vec3.fromValues(translateArray[0], translateArray[1], translateArray[2]));
                    break;
                case 'rotate':
                    const rotationData = this.parseRotation(curTransformationNode, `rotate at component with id: ${componentID}`);
                    if (typeof rotationData === 'string') {
                        return rotationData;
                    }
                    mat4.rotate(finalTransformation, finalTransformation, rotationData.angle, rotationData.axis);
                    break;
                case 'scale':
                    const scaleArray = this.parseCoordinates3D(curTransformationNode, `scale at component with id: ${componentID}`);
                    if (!Array.isArray(scaleArray)) {
                        return scaleArray;
                    }
                    mat4.scale(finalTransformation, finalTransformation, vec3.fromValues(scaleArray[0], scaleArray[1], scaleArray[2]));
                    break;
                case 'transformationref':
                    if (transformationsList.length > 1) {
                        // TODO: get this errors to happen
                        return `transformationref needs to be the only transformation in component with id: ${componentID}`;
                    }
                    const transformationID = this.reader.getString(curTransformationNode, 'id');
                    if (transformationID == null) {
                        return `missing id from transformationref in component with id: ${componentID}`;
                    }

                    const curTransformation = this.transformations[transformationID];
                    if (curTransformation == null) {
                        return `transformationref references id '${transformationID}' but such transformation does not exist. Component ID: ${componentID}`;
                    }
                    mat4.multiply(finalTransformation, finalTransformation, curTransformation);
                    break;
                default:
                    return `invalid transfomation node: ${curTransformationNode.nodeName}`;
            }
        }
        return finalTransformation;
    }

    /* Returns data about a rotaion. It's format is
        angle: rotation angle in radians
        axis: vec3 that represents the axis of rotation

    */
    parseRotation(node, messageError) {
        let axis = this.reader.getString(node, 'axis');
        if (axis.length != 1) {
            return `expected a character as axis but got a string with length ${axis.length} at the ${messageError}`;
        }

        let vectorizedAxis;
        if (axis === 'x') {
            vectorizedAxis = vec3.fromValues(1, 0, 0);
        } else if (axis === 'y') {
            vectorizedAxis = vec3.fromValues(0, 1, 0);
        } else if (axis === 'z') {
            vectorizedAxis = vec3.fromValues(0, 0, 1);
        } else {
            return `invalid axis expected one of [x, y, z] but got '${axis}' at the ${messageError}`;
        }

        let angle = this.reader.getFloat(node, 'angle');
        if (angle == null || isNaN(angle)) {
            return `unable to parse angle of the ${messageError}`;
        }

        return {
            angle: degreeToRad(angle),
            axis: vectorizedAxis
        }
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }


    graphTraversal(component, parentMaterial, parentComponentTexture) {

        // Transformations
        this.scene.pushMatrix();
        this.scene.multMatrix(component.transformation);

        // Materials
        let material = parentMaterial;
        let curMaterial = component.materials[this.curMaterial % component.materials.length]
        if (curMaterial != "inherit") {
            material = this.materials[curMaterial];
        }

        // Textures
        let lenS = 1, lenT = 1, parentLenS = 1, parentLenT = 1;
        if (component.texture.type == "id_ref") {
            material.setTexture(this.textures[component.texture.id]);
            lenS = component.texture.lenS;
            lenT = component.texture.lenT;
        } else if (component.texture.type == "inherit") {
            if (parentComponentTexture == null) {
                console.warn(`Component with id ${componentID} has texture inherit but it's parent has no texture`);
            } else {
                material.setTexture(this.textures[parentComponentTexture.id]);
                lenS = parentComponentTexture.lenS;
                lenT = parentComponentTexture.lenT;
            }
        } else {
            material.setTexture(null);
        }

        if (parentComponentTexture != null) {
            parentLenS = parentComponentTexture.lenS;
            parentLenT = parentComponentTexture.lenT
        }
        material.apply();

        for (let child of component.children) {

            // Primitives
            if (child.type == 'primitive') {
                this.primitives[child.id].updateTexCoords(lenS, lenT);
                this.primitives[child.id].display();
                this.primitives[child.id].updateTexCoords(parentLenS, parentLenT);
                continue;
            } 

            // Sub components
            if (this.components[child.id] == null) {
                return `component with id ${child.id} does not exist`;
            }
            this.graphTraversal(this.components[child.id], material, component.texture);
        }

        // Resetting        
        if (parentMaterial != null)
            parentMaterial.apply();
        this.scene.popMatrix();
    }

    onKeyPress(event) {
        if (event.code === "KeyM") {
            this.curMaterial += 1
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.graphTraversal(this.components[this.idRoot], null, null);
    }
}
