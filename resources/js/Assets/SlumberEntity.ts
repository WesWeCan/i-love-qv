import * as THREE from "three";

import { vertexShader, fragmentShader } from "./Shaders";

import { SlumberData } from '@/types/index';

export class SlumberEntity {

    mesh: THREE.Mesh | null = null;
    radius: number;

    randomStartingTime: number;
    slumberData: SlumberData;

    scale: number;


    constructor() {

        this.mesh = null;

        this.radius = 18;

        this.randomStartingTime = Math.random() * 1000;

        // this.uniforms = {
        //     speed: -0.2,
        //     density: 0.2,
        //     strength: 2,
        //     frequency: 5.0,
        //     amplitude: 6.0,
        //     intensity: 1.0,
        //     red: 1.0,
        //     green: 1.0,
        //     blue: 1.0
        // }

        this.scale = 1;


        this.slumberData = {
            speed: 0.2,
            density: 1.5,
            strength: 0.2,
            frequency: 3.0,
            amplitude: 6.0,
            intensity: 7.0,

            color_1: {
                hue: 360,
                saturation: 100,
                lightness: 50
            },

            color_2: {
                hue: 200,
                saturation: 100,
                lightness: 50
            }
        }

        this.create();
    }



    create() {

        console.log("Creating SlumberEntity");
        console.table(this.slumberData);

        this.mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1, 64),
            new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: this.slumberData.speed },
                uNoiseDensity: { value: this.slumberData.density },
                uNoiseStrength: { value: this.slumberData.strength },
                uFrequency: { value: this.slumberData.frequency },
                uAmplitude: { value: this.slumberData.amplitude },
                uIntensity: { value: this.slumberData.intensity },
                rV: { value: this.slumberData.color_1.hue },
                gV: { value: this.slumberData.color_1.saturation },
                bV: { value: this.slumberData.color_1.lightness },
                rV2: { value: this.slumberData.color_2.hue },
                gV2: { value: this.slumberData.color_2.saturation },
                bV2: { value: this.slumberData.color_2.lightness },
            },
            })
        );

    }

    update(time : number) {
        if(this.mesh == null) return;

        // Update uniforms
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time + this.randomStartingTime;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uSpeed.value = this.slumberData.speed;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uNoiseDensity.value = this.slumberData.density;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uNoiseStrength.value = this.slumberData.strength;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uFrequency.value = this.slumberData.frequency;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uAmplitude.value = this.slumberData.amplitude;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.uIntensity.value = this.slumberData.intensity;


        let color1 = this.convertColor(this.slumberData.color_1.hue, this.slumberData.color_1.saturation, this.slumberData.color_1.lightness);
        let color2 = this.convertColor(this.slumberData.color_2.hue, this.slumberData.color_2.saturation, this.slumberData.color_2.lightness);

        (this.mesh.material as THREE.ShaderMaterial).uniforms.rV.value = color1.r;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.gV.value = color1.g;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.bV.value = color1.b;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.rV2.value = color2.r;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.gV2.value = color2.g;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.bV2.value = color2.b;

        // scale    
        this.mesh.scale.set(this.scale, this.scale, this.scale);

        // console.table(this.uniforms);
    }


    setScale(scale: number) {
        this.scale = scale;
    }


    convertColor(h: number | string, s: number | string, l: number | string) {
        
        h = Number(h);
        s = Number(s);
        l = Number(l);

        let rgb = this.hsl2Rgb(h,s,l);
        // let rgb_normalized = rgb.map((v: number) => v / 255);

        const rgb_normalized = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255
        }

        return rgb_normalized;

    }

    hsl2Rgb = (h : number, s : number, l : number) => {
        s /= 100;
        l /= 100;
        let c: number
        let x: number
        let m: number
        let rgb: number[] = [0, 0, 0];
    
        c = (1 - Math.abs(2 * l - 1)) * s;
        x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        m = l - c / 2;
        if (h >= 0 && h < 60) rgb = [c, x, 0];
        if (h >= 60 && h < 120) rgb = [x, c, 0];
        if (h >= 120 && h < 180) rgb = [0, c, x];
        if (h >= 180 && h < 240) rgb = [0, x, c];
        if (h >= 240 && h < 300) rgb = [x, 0, c];
        if (h >= 300 && h <= 360) rgb = [c, 0, x];
    
    
        let result = rgb.map((v: number) => {
            return (255 * (v + m)) | 0;
        });
    
        return result
    };


}



