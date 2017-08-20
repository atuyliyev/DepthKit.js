//DepthKit.js plugin for Three.js

/**
 * Originally written by
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
*/

/* Made into a plugin for Tzina project by
*  @modified by juniorxsound / http://orfleisher.com
*  @modified by avnerus / http://avner.js.org
*/

//Importing three.js for the sake of testing, should be included in the app before adding depthkit.js
import * as THREE from 'three';
window.THREE = THREE;

//Event emitter for providing event handlers from the class
import EventEmitter from 'event-emitter-es6';

//For easy bundling of the shaders
const glsl = require('glslify');

export default class DepthKit extends EventEmitter {

    constructor(_type = 'mesh', _props, _movie, _poster) {
        super();

        this.manager = new THREE.LoadingManager();
        this.jsonLoader = new THREE.FileLoader();
        this.jsonLoader.setResponseType('json');
        console.log(this.jsonLoader);
        this.jsonLoader.load(
            // resource URL
            '../assets/Chae/Chae_Demo_Upres.txt',

            // Function when resource is loaded
            function (data) {
                // output the text to the console
                console.log(data)
            },

            // Function called when download progresses
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // Function called when download errors
            function (xhr) {
                console.error('An error happened');
            }
        );

        //Load the shaders
        let rgbdFrag = glsl.file('./shaders/rgbd.frag');
        let rgbdVert = glsl.file('./shaders/rgbd.vert');

        //For building the geomtery
        this.VERTS_WIDE = 256;
        this.VERTS_TALL = 256;
        this.precision = 3;

        //Geomtery
        this.geo = this.buildGeomtery(_type);

        //Material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "map": { type: "t" },
                "mindepth": { type: "f", value: 0.0 },
                "maxdepth": { type: "f", value: 0.0 },
                "uvdy": { type: "f", value: 0.5 },
                "uvdx": { type: "f", value: 0.0 },
                "width": { type: "f", value: 0.0 },
                "height": { type: "f", value: 0.0 },
                "opacity": { type: "f", value: 1.0 }
            },

            vertexShader: rgbdVert,
            fragmentShader: rgbdFrag,
            transparent: true
        });

        this.mesh = new THREE.Mesh(this.geo, this.material);

        return this.mesh;
    }

    buildGeomtery(type) {

        //Temporary geometry
        let geo = new THREE.Geometry();

        //Mesh types
        switch (type) {

            //Build a mesh  
            case 'mesh':

                for (let y = 0; y < this.VERTS_TALL; y++) {
                    for (let x = 0; x < this.VERTS_WIDE; x++) {
                        geo.vertices.push(
                            new THREE.Vector3((-640 + x * 5), (480 - y * 5), 0));
                    }
                }
                for (let y = 0; y < this.VERTS_TALL - 1; y++) {
                    for (let x = 0; x < this.VERTS_WIDE - 1; x++) {
                        geo.faces.push(
                            new THREE.Face3(
                                x + y * this.VERTS_WIDE,
                                x + (y + 1) * this.VERTS_WIDE,
                                (x + 1) + y * (this.VERTS_WIDE)
                            ));
                        geo.faces.push(
                            new THREE.Face3(
                                x + 1 + y * this.VERTS_WIDE,
                                x + (y + 1) * this.VERTS_WIDE,
                                (x + 1) + (y + 1) * (this.VERTS_WIDE)
                            ));
                    }
                }

                break;

            //Build a wire mesh  
            case 'wire':

                for (let y = 0; y < this.VERTS_TALL; y++) {
                    for (let x = 0, x2 = this.precision; x < this.VERTS_WIDE; x += this.precision, x2 += this.precision) {
                        geo.vertices.push(new THREE.Vector3(x, y, 0));
                        geo.vertices.push(new THREE.Vector3(x2, y, 0));
                    }
                }

                break;

            //Add case for points

            default:
                console.warn('Oops, a geometry type was not provided');
                break;
        }

        return geo;
    }

    update(dt) {

    }
}