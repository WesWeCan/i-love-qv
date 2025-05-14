<script setup lang="ts">
import { Flyer } from '@/types/voting-types';
import Sparkles from '@/Components/Sparkles.vue';
import { computed, onMounted, ref, watch } from 'vue';


import heart from '@/assets/img/heart.png';


const props = defineProps<{
    votes: number;
    credits: number;
    maxCredits: number;
    isPool: boolean;
    emoji: string;
}>();


const minimumScale = 0.0;

const scale = computed(() => {
    const rawScale = props.credits / props.maxCredits;
    return minimumScale + (rawScale * (1 - minimumScale));
});

const percentageLeft = computed(() => {


    let percentageLeft = (props.credits / props.maxCredits) * 100;


    // if( percentageLeft > 10){
    //     return Math.floor(percentageLeft);
    // }

    return Number(percentageLeft.toFixed(2));
});

// const scaleNextVote = computed(() => {
//     const currentVotes = Math.floor(Math.abs(props.votes));
//     const currentVoteCredits = Math.pow(currentVotes + 1, 2);
//     const nextVoteCredits = Math.pow(currentVotes + 2, 2);

//     if (props.votes === 0 && props.credits === 0) {
//         return minimumScale;
//     }

//     const baseScale = currentVoteCredits / props.maxCredits;
//     const nextScale = nextVoteCredits / props.maxCredits;

//     if (props.credits >= nextVoteCredits) {
//         return minimumScale + (nextScale * (1-minimumScale));
//     }
//     return minimumScale + (baseScale * (1-minimumScale));
// });

const showSparkles = ref(false);
const numSparkles = ref(100);
const timeOut = ref<any>(null);

watch(() => props.credits, (newCredits, oldCredits) => {
    const creditChange = Math.abs(newCredits - oldCredits);
    

    numSparkles.value = Math.floor(creditChange*10);
    console.log(numSparkles.value)

    if(timeOut.value){
        clearTimeout(timeOut.value);
        showSparkles.value = true;
    }


    timeOut.value = setTimeout(() => {
        showSparkles.value = false;
        }, 1000);

    
    // addFlyer(creditChange, newCredits > oldCredits ? 'in' : 'out');
});


const flyers = ref<Flyer[]>([]);


onMounted(async () => {

});


const addFlyer = async (addOrRemove: number, direction: 'in' | 'out') => {
    const numFlyers = flyers.value.length;
    const currentIndex = flyers.value.length;

    // console.log(addOrRemove)

    if (addOrRemove > 15) {
        addOrRemove = 10;
    }

    for (let i = 0; i < addOrRemove; i++) {
        flyers.value.push({
            index: currentIndex + i,
            show: true,
            direction: direction
        });

        await new Promise(resolve => setTimeout(resolve, 125));

        setTimeout(() => {
            flyers.value[currentIndex + i].show = false;
        }, 1000);
    }
}



</script>

<template>


    <div class="credits-visualizer">
        <div class="credits-visualizer-inner"
            :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
            :style="'transform: scale(' + (scale) + ')'">
            <!-- <div class="emoji" >{{ props.emoji }}</div> -->
           
            <Sparkles :showSparkles="showSparkles" :numSparkles="numSparkles" />
            <div class="heart-container" :style="'background-image: url(' + heart + ')'"></div>
           
        </div>

        <div class="credits-visualizer-poof"
            :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
            v-if="props.credits === 0">
            <div class="emoji">💥</div>
        </div>

        
        <template v-for="(flyer, index) in flyers" :key="index" v-if="false">
            <div class="credits-visualizer-flying"
                :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
                :style="'transform: scale(' + (scale) + ')'" v-if="flyer.show">
                <div class="emoji" :class="{ negative: props.votes < 0, positive: props.votes > 0 }"
                    :style="'animation-direction: ' + (flyer.direction === 'out' ? 'normal' : 'reverse') + ';'">
                    {{ props.emoji }}
                </div>
            </div>
        </template>


    </div>


    <div class="percentage-left">
        Influence left: {{ percentageLeft }}%
    </div>



</template>