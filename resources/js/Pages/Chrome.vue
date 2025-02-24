<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SlumberTHREE } from '@/Assets/SlumberTHREE';
import { nextTick } from 'vue';

import { Head } from '@inertiajs/vue3';


import { Link } from '@inertiajs/vue3';


const slumberContainer = ref<HTMLElement>();
const sizerContainer = ref<HTMLElement>();

const Slumber = new SlumberTHREE();

const slumberData = ref(
    {
        speed: 0.1,
        density: 0.6,
        strength: 0.2,
        frequency: 0.5,
        amplitude: 6.0,
        intensity: 7.0,

        color_1: {
            hue: 0.247,
            saturation: 0.749,
            lightness: 0.247,
        },
        
        color_2: {
            hue: 0,
            saturation: 0,
            lightness: 1,
        }

        
    }
);


const randomValueFloat = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

const randomValueInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


onMounted(async () => {

    slumberData.value = {
                speed: randomValueFloat(0.1, 0.9),
                density: randomValueFloat(0.5, 4),
                strength: randomValueFloat(0.1, 0.9),
                frequency: randomValueFloat(0.1, 1),
                amplitude: randomValueFloat(0, 9),
                intensity: randomValueFloat(0.1, 3),

                color_1: {
                    hue: randomValueInt(0, 360),
                    saturation: 100,
                    lightness: randomValueFloat(10, 90),
                },
                
                color_2: {
                    hue: randomValueInt(0, 360),
                    saturation: 100,
                    lightness: randomValueFloat(10, 90),
                }
            
    }



    nextTick(() => { });

    if (!slumberContainer.value) return;
    if (!sizerContainer.value) return;
    Slumber.init(slumberContainer.value, sizerContainer.value);

    updateData();


    

});

const updateData = () => {
    if (!Slumber) return;
    console.log('updateData', slumberData.value);
    Slumber.updateData(slumberData.value);
}


const showIntro = ref(false);

</script>


<template>
    <Head>
        <title>Liquid voting</title>
    </Head>




    <!-- <DevContainer :slumberData="slumberData" @updateData="updateData" /> -->


    <div class="slumber-wrapper" :class="{showIntro}">

    <div class="slumber-container" ref="slumberContainer"></div>


        <div class="slumber-welcome start" v-if="!showIntro" >
            <div class="wrapper">

             </div>
        </div>

        <div class="slumber-welcome intro" v-else>

            
            
           


        </div>

    </div>


    <div class="three-sizer" :class="{showIntro}">
        <div class="three-size-container" ref="sizerContainer">&nbsp;</div>
        <div class="three-content-container">&nbsp;</div>
    </div>

    
</template>


<style lang="scss">
body {
    
    min-height: 100svh;

    font-family: 'Archivo', sans-serif;
}




.three-sizer {
    position: fixed;
    top: 0;
    // left: 0;

    z-index: 1000;

    opacity: 0.00;
    pointer-events: none;

    .three-size-container {
        background-color: blue;
    }

    .three-content-container {
        background-color: yellow;
    }

}

.slumber-wrapper {
    margin: 0 auto;
}

.slumber-wrapper, .three-sizer {
    display: grid;
    grid-template-rows: 1.1fr 1fr;
    max-width: 750px;
    width: 100%;
    height: 100svh;

    transition: grid-template-rows 0.5s ease-in-out;

    &.showIntro {
        grid-template-rows: .55fr 1fr;
    }

    &.showCredits {
        grid-template-rows: .35fr 1fr;
    }

    &.result {
        grid-template-rows: 2fr 1fr;

        &.showCredits {
            grid-template-rows: .35fr 1fr;
        }
    }

}
.slumber-container {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: transparent;
}</style>