<script setup lang="ts">


import * as THREE from 'three';

		import Stats from 'three/addons/libs/stats.module.js';

		import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
		import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
		import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
		import { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted } from 'three/addons/shaders/ToonShader.js';


        import { nextTick, onMounted, ref } from 'vue';

		let stats;

        const container = ref<HTMLElement>();

		let camera, scene, renderer;

		let materials, current_material;

		let light, pointLight, ambientLight;

		let effect, resolution;

		let effectController;

		let time = 0;

		const clock = new THREE.Clock();

		

        let blobs : Blob[] = [];



        onMounted(() => {

            nextTick(() => {
                console.log('mounted');
                init();
            });

            
        });


        const numberOfBlobs = 100;
      




		function init() {
         


            

            for (let i = 0; i < numberOfBlobs; i++) {
                blobs.push(new Blob(0.5, 0.5, 0.5));
            }
			

			// CAMERA

			camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.set( - 500, 500, 1500 );

			// SCENE

			scene = new THREE.Scene();
			scene.background = new THREE.Color( 0x050505 );

			// LIGHTS

			light = new THREE.DirectionalLight( 0xffffff, 3 );
			light.position.set( 0.5, 0.5, 1 );
			scene.add( light );

			pointLight = new THREE.PointLight( 0xff7c00, 3, 0, 0 );
			pointLight.position.set( 0, 0, 100 );
			scene.add( pointLight );

			ambientLight = new THREE.AmbientLight( 0x323232, 3 );
			scene.add( ambientLight );

			// MATERIALS

			materials = generateMaterials();
			current_material = 'plastic';

			// MARCHING CUBES

			resolution = 100;

			effect = new MarchingCubes( resolution, materials[ current_material ], true, true, 100000 );
			effect.position.set( 0, 0, 0 );
			effect.scale.set( 500, 500, 500 );

			effect.enableUvs = false;
			effect.enableColors = false;

			scene.add( effect );

			// RENDERER

			renderer = new THREE.WebGLRenderer();
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setAnimationLoop( animate );
			container.value.appendChild( renderer.domElement );

			// CONTROLS

			const controls = new OrbitControls( camera, renderer.domElement );
			controls.minDistance = 500;
			controls.maxDistance = 5000;

			// STATS

			stats = new Stats();
			container.value.appendChild( stats.dom );

			// GUI

			setupGui();

			// EVENTS

			window.addEventListener( 'resize', onWindowResize );

		}

		//

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function generateMaterials() {

			// environment map

			const path = 'textures/cube/SwedishRoyalCastle/';
			const format = '.jpg';
			const urls = [
				path + 'px' + format, path + 'nx' + format,
				path + 'py' + format, path + 'ny' + format,
				path + 'pz' + format, path + 'nz' + format
			];

			const cubeTextureLoader = new THREE.CubeTextureLoader();

			const reflectionCube = cubeTextureLoader.load( urls );
			const refractionCube = cubeTextureLoader.load( urls );
			refractionCube.mapping = THREE.CubeRefractionMapping;

			// toons

			const toonMaterial1 = createShaderMaterial( ToonShader1, light, ambientLight );
			const toonMaterial2 = createShaderMaterial( ToonShader2, light, ambientLight );
			const hatchingMaterial = createShaderMaterial( ToonShaderHatching, light, ambientLight );
			const dottedMaterial = createShaderMaterial( ToonShaderDotted, light, ambientLight );

			const texture = new THREE.TextureLoader().load( 'textures/uv_grid_opengl.jpg' );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.colorSpace = THREE.SRGBColorSpace;

			const materials = {
				'shiny': new THREE.MeshStandardMaterial( { color: 0x9c0000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 } ),
				'chrome': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } ),
				'liquid': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 } ),
				'matte': new THREE.MeshPhongMaterial( { specular: 0x494949, shininess: 1 } ),
				'flat': new THREE.MeshLambertMaterial( { /*TODO flatShading: true */ } ),
				'textured': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 1, map: texture } ),
				'colors': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true } ),
				'multiColors': new THREE.MeshPhongMaterial( { shininess: 2, vertexColors: true } ),
				'plastic': new THREE.MeshPhongMaterial( { specular: 0xc1c1c1, shininess: 250 } ),
				'toon1': toonMaterial1,
				'toon2': toonMaterial2,
				'hatching': hatchingMaterial,
				'dotted': dottedMaterial
			};

			return materials;

		}

		function createShaderMaterial( shader, light, ambientLight ) {

			const u = THREE.UniformsUtils.clone( shader.uniforms );

			const vs = shader.vertexShader;
			const fs = shader.fragmentShader;

			const material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );

			material.uniforms[ 'uDirLightPos' ].value = light.position;
			material.uniforms[ 'uDirLightColor' ].value = light.color;

			material.uniforms[ 'uAmbientLightColor' ].value = ambientLight.color;

			return material;

		}

		//

		function setupGui() {

			const createHandler = function ( id ) {

				return function () {

					current_material = id;

					effect.material = materials[ id ];
					effect.enableUvs = ( current_material === 'textured' ) ? true : false;
					effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;

				};

			};

			effectController = {

				material: 'shiny',

				speed: 1.0,
				numBlobs: 5,
				resolution: 100,
				isolation: 800,

				floor: false,
				wallx: false,
				wallz: false,

				dummy: function () {}

			};

			let guiFolder;

			const gui = new GUI();

			// material (type)

			guiFolder = gui.addFolder( 'Materials' );

			for ( const m in materials ) {

				effectController[ m ] = createHandler( m );
				guiFolder.add( effectController, m ).name( m );

			}

			// simulation

			guiFolder = gui.addFolder( 'Simulation' );

			guiFolder.add( effectController, 'speed', 0.1, 8.0, 0.05 );
			guiFolder.add( effectController, 'numBlobs', 1, 50, 1 );
			guiFolder.add( effectController, 'resolution', 14, 100, 1 );
			guiFolder.add( effectController, 'isolation', 10, 800, 1 );

			guiFolder.add( effectController, 'floor' );
			guiFolder.add( effectController, 'wallx' );
			guiFolder.add( effectController, 'wallz' );

		}


		// this controls content of marching cubes voxel field

class Blob {
            x: number;
            y: number;
            z: number;
            vx: number;
            vy: number;
            vz: number;
            
            constructor(x: number, y: number, z: number) {
                        this.x = (Math.random() * 2) - 1;
                        this.y = (Math.random() * 2) - 1;
                        this.z = (Math.random() * 2) - 1;
                        this.vx = 0;
                        this.vy = 0;
                        this.vz = 0;
            }
}

function simulateBlobs() {
            const repelStrength = 0.08;
            const attractStrength = 0.2;
            const centerAttraction = 0.05;
            const dampening = .95;
            const dt = 0.1;
            const maxDistance = 0.2;

            for (let i = 0; i < blobs.length; i++) {
                        const blob = blobs[i];
                        const toCenterX = 0.5 - blob.x;
                        const toCenterY = 0.5 - blob.y;
                        const toCenterZ = 0.5 - blob.z;
                        const distanceToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY + toCenterZ * toCenterZ);
                        
                        if (distanceToCenter > 0) {
                            // Reduce center force when close to center
                            const centerForceMultiplier = Math.min(1, distanceToCenter * 15);
                            const centerForce = centerAttraction * dt * centerForceMultiplier / distanceToCenter;
                            blob.vx += toCenterX * centerForce;
                            blob.vy += toCenterY * centerForce;
                            blob.vz += toCenterZ * centerForce;
                        }

                        for (let j = i + 1; j < blobs.length; j++) {
                            const otherBlob = blobs[j];
                            const dx = otherBlob.x - blob.x;
                            const dy = otherBlob.y - blob.y;
                            const dz = otherBlob.z - blob.z;
                            
                            const distSq = dx * dx + dy * dy + dz * dz;
                            if (distSq === 0 || distSq > maxDistance * maxDistance) continue;
                            
                            const distance = Math.sqrt(distSq);
                            const force = (distance < 0.15 ? -repelStrength : attractStrength) * dt / distance;
                            
                            const fx = dx * force;
                            const fy = dy * force;
                            const fz = dz * force;

                            blob.vx += fx;
                            blob.vy += fy;
                            blob.vz += fz;
                            otherBlob.vx -= fx;
                            otherBlob.vy -= fy;
                            otherBlob.vz -= fz;
                        }

                        blob.x += blob.vx * dt;
                        blob.y += blob.vy * dt;
                        blob.z += blob.vz * dt;

                        if (blob.x < 0) { blob.x = 0; blob.vx *= -0.5; }
                        if (blob.x > 1) { blob.x = 1; blob.vx *= -0.5; }
                        if (blob.y < 0) { blob.y = 0; blob.vy *= -0.5; }
                        if (blob.y > 1) { blob.y = 1; blob.vy *= -0.5; }
                        if (blob.z < 0) { blob.z = 0; blob.vz *= -0.5; }
                        if (blob.z > 1) { blob.z = 1; blob.vz *= -0.5; }

                        blob.vx *= dampening;
                        blob.vy *= dampening;
                        blob.vz *= dampening;
            }
}

function updateCubes( object, time, numblobs, floor, wallx, wallz ) {
            simulateBlobs();
            object.reset();
            numblobs = numberOfBlobs;
            const subtract = 50;
            // const strength = 2.0 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );
            const strength = .5;

            for ( let i = 0; i < numblobs; i ++ ) {
                const ballx = blobs[i].x;
                const bally = blobs[i].y;
                const ballz = blobs[i].z;
                object.addBall( ballx, bally, ballz, strength, subtract );
            }

            object.update();
}

		//

		function animate() {

			render();
			stats.update();

		}

		function render() {

			const delta = clock.getDelta();

			time += delta * effectController.speed * 0.5;

			// marching cubes

			if ( effectController.resolution !== resolution ) {

				resolution = effectController.resolution;
				effect.init( Math.floor( resolution ) );

			}

			if ( effectController.isolation !== effect.isolation ) {

				effect.isolation = effectController.isolation;

			}

			updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );

			// render

			renderer.render( scene, camera );

		}


</script>

<template>


    <div class="container" ref="container"></div>

</template>