
import * as THREE from 'three';
import BaseTHREE from './BaseTHREE';

import { SlumberEntity } from './SlumberEntity';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import {
    OrbitControls,
    // MapControls,
} from "three/examples/jsm/controls/OrbitControls.js";

import { SlumberData } from '@/types/index';

import { Ref, ref, inject, onMounted } from "vue";

export class SlumberTHREE {

    BaseTHREE: BaseTHREE | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    controls: OrbitControls | null;

    clock: THREE.Clock;
    delta: number;
    interval: number;

    entity: SlumberEntity | null;

    constructor() {
        console.log('DigitalTwin constructor');

        this.BaseTHREE = null;

        this.scene = null;
        this.camera = null;
        this.controls = null;

        this.clock = new THREE.Clock(); /** Internal clock to keep track of time */

        this.delta = 0; /** Value of difference between last and this render */
        this.interval = 1 / 60; /** Framerate for rendering */

        this.entity = null;

    }

    init(container: HTMLElement, sizerContainer: HTMLElement) {
        this.initTHREE(container, sizerContainer);
    }

    forceResize() {
        this.BaseTHREE?.onWindowResize();
    }

    initTHREE(container: HTMLElement, sizerContainer: HTMLElement) {
        this.BaseTHREE = new BaseTHREE(this, container, sizerContainer);
    }

    initSlumber(scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;

        
        this.entity = new SlumberEntity();


        if(this.scene && this.entity && this.entity.mesh)
        this.scene.add(this.entity.mesh);

    }

    handleRaycast = (raycaster: THREE.Raycaster) => {
        return;
    }

    handleClick = (raycaster: THREE.Raycaster) => {

        // console.log(raycaster, "click");
        // this.views[this.currentView].handleClick(raycaster);
    }

    run() {
        // Limit the FPS for smoother transitions
        this.delta += this.clock.getDelta();

        if (this.delta > this.interval) {
            this.theLoop();
        }

        this.delta = this.delta % this.interval;

    }

    updateData = (data: SlumberData) => {
        if(this.entity == null) return;

        this.entity.slumberData.speed = data.speed;
        this.entity.slumberData.density = data.density;
        this.entity.slumberData.strength = data.strength;
        this.entity.slumberData.frequency = data.frequency;
        this.entity.slumberData.amplitude = data.amplitude;
        this.entity.slumberData.intensity = data.intensity;
        
        this.entity.slumberData.color_1 = {
            hue: data.color_1.hue,
            saturation: data.color_1.saturation,
            lightness: data.color_1.lightness
        };

        this.entity.slumberData.color_2 = {
            hue: data.color_2.hue,
            saturation: data.color_2.saturation,
            lightness: data.color_2.lightness
        };

    
    }

    setEntityScale = (scale: number) => {  
        if(this.entity == null) return;

        this.entity.scale = scale;
    }

    theLoop() {
        // this.views[this.currentView].update();

        if(this.entity){
            this.entity.update(this.clock.getElapsedTime());
        }
    }

}