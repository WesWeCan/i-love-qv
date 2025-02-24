
import * as THREE from "three";

import {
    OrbitControls,
    // MapControls,
} from "three/examples/jsm/controls/OrbitControls.js";
import { LightProbeGenerator } from "three/examples/jsm/lights/LightProbeGenerator.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { FocusShader } from "three/examples/jsm/shaders/FocusShader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader.js";
import { SobelOperatorShader } from "three/examples/jsm/shaders/SobelOperatorShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

import {
    Lensflare,
    LensflareElement,
} from "three/examples/jsm/objects/Lensflare.js";

// import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from 'three/examples/jsm/shaders/GodRaysShader.js';

// import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

import { Ref, ref, inject, onMounted } from "vue";
import { SlumberTHREE } from "./SlumberTHREE";


export default class BaseTHREE {


    threeContainer : HTMLElement;
    sizerContainer : HTMLElement;

    width : number;
    height : number;

    mouse : THREE.Vector2;
    mousePos : THREE.Vector3;
    mouseDown : boolean;
    mouseDrag : boolean;

    raycaster : THREE.Raycaster;
    renderer : THREE.WebGLRenderer;
    scene : THREE.Scene;
    camera : THREE.PerspectiveCamera;
    composer : EffectComposer;
    controls : OrbitControls;
    stats : Stats;

    slumber : SlumberTHREE;


    settings : {
        showStats: boolean,
        enableEffects: boolean
    }

    API : {
        lightProbeIntensity: number,
        directionalLightIntensity: number,
        envMapIntensity: number
    }


    constructor(slumber : SlumberTHREE, threeContainer : HTMLElement, sizerContainer : HTMLElement) {

        this.threeContainer = threeContainer;
        this.sizerContainer = sizerContainer;

        console.log(this.threeContainer, this.threeContainer);

        this.API = {
            lightProbeIntensity: 1.0,
            directionalLightIntensity: 0.2,
            envMapIntensity: 1,
        };

        this.settings = {
            showStats: false,
            enableEffects: true,
        };


        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.mouse = new THREE.Vector2(1, 1);
        this.mousePos = new THREE.Vector3();
        this.mouseDown = false;
        this.mouseDrag = false;

        this.raycaster = this.setupRaycaster();
        this.renderer = this.setupRenderer();
        this.scene = this.setupScene();
        this.camera = this.setupCamera();
        this.composer = this.setupComposer();
        this.controls = this.setupControls();
       
        this.setupLights();
        this.stats = this.setupStats();


        this.slumber = slumber;
        this.slumber.initSlumber(this.scene, this.camera, this.controls);

        this.init();
        this.animate();

        

    }

    setupRaycaster() {
        const raycaster = new THREE.Raycaster();
        raycaster.layers.set(1);

        return raycaster;
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });


        // renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setSize(this.threeContainer.clientWidth, this.threeContainer.clientHeight);
    
        // renderer.xr.enabled = true;
        renderer.setClearColor(0x000000, 0);

        return renderer;

    }

    setupScene() {
        const scene = new THREE.Scene();
        // scene.background = new THREE.Color(0.9, 0.9, 0.9);
        // scene.background = new THREE.Color("#0e1111");
        scene.background = new THREE.Color(0,0,0);
        // scene.fog = new THREE.Fog(scene.background, 3500, 15000);

        return scene;
    }


    setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        

        camera.position.set(0, 0, 6);

        
        
        return camera;
    }

    setupComposer() {


        const composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);

        // let afterimagePass = new AfterimagePass();
        // afterimagePass.uniforms["damp"].value = 0.85;
        // composer.addPass(afterimagePass);

        // let fxaaPass = new ShaderPass(FXAAShader);
        // composer.addPass(fxaaPass);

        // // glitch pass
        // let glitchPass = new GlitchPass();
        // glitchPass.renderToScreen = true;

        // // change frequency
        // // glitchPass.goWild = true;

        // composer.addPass(glitchPass);

        return composer;

    }

    setupControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        // controls.dampingFactor = 0.05;
        // controls.enablePan = false;
        // controls.autoRotate = true;
        // controls.autoRotateSpeed = 0.35;
        // controls.minDistance = 150;
        // controls.maxDistance = 1780;
        
        controls.enableZoom = false;
       



        return controls;
    }

    setupLights() {

        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        // dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(1,1,1);
        dirLight.position.multiplyScalar(1000);

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        const d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;
        // this.scene.add(dirLight);

        const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
        // this.scene.add( dirLightHelper );

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        // hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 1000, 0);
        this.scene.add(hemiLight);

        const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
        // this.scene.add( hemiLightHelper );

        // const light = new THREE.PointLight(0xffffff, 3, -1);
        // light.position.set(0, 0, 0);
        // this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 100); // soft white light
        // this.scene.add(ambientLight);
    }

    setupStats() {
        const stats = new Stats();
        // this.threeContainer.appendChild(stats.dom);

        return stats;
    }

    updateStats() {

        this.stats.update();
       
    }


    updateRaycast() {
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // console.log(this.raycaster.intersectObjects(this.scene.children, true));

        this.slumber?.handleRaycast(this.raycaster);
    }


    onClick(event : MouseEvent) {
        event.preventDefault();



        if(!this.mouseDrag) {
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.slumber.handleClick(this.raycaster);
        this.render();
        }

        this.mouseDown = false;
        this.mouseDrag = false;
    }

    onMouseMove(event : MouseEvent) {

        if(this.mouseDown) {
            this.mouseDrag = true;
        }

        // Convert mouse coordinates to -1 - +1 range
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.mousePos.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0
        );

        this.mousePos.unproject(this.camera);
        // this.slumber.mouse = this.mousePos;

    }

    onMouseDown(event : MouseEvent) {
        this.mouseDown = true;
        console.log("mouse down");
    }


    init() {
        this.threeContainer.appendChild(this.renderer.domElement);

        console.log(this.scene.children);

        window.addEventListener("resize", (event) => { this.onWindowResize() });

        // add resize observer to sizer container
        const resizeObserver = new ResizeObserver((entries) => {
            console.log("resize observed");
            this.onWindowResize();
        });

        resizeObserver.observe(this.sizerContainer);


        document.addEventListener("pointermove", (event) => { this.onMouseMove(event) });
        document.addEventListener("pointerdown", (event) => { this.onMouseDown(event) });
        this.renderer.domElement.addEventListener("click", (event) => { this.onClick(event) });
    }

    animate(){
        this.slumber.run();

        this.controls.update();

        // TWEEN.update();

        this.updateRaycast();

        this.render();

        this.updateStats();

        requestAnimationFrame(() => { this.animate() });
    };


    render() {
        // if (this.slumberInterface.value.settings.enableEffects) {
        if (true) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        // this.width = window.innerWidth;
        // this.height = window.innerHeight;

        console.log("resize");

        // get the current render size

        let renderSize = new THREE.Vector2();
        this.renderer.getSize(renderSize);


        this.width = this.sizerContainer.clientWidth;
        this.height = this.sizerContainer.clientHeight;

        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
       
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.render();

        // setTimeout(() => {
        //     console.log("resize");
        //     this.onWindowResize();
            
        // }, 100);

        
    }


}

