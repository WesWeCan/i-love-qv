<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { Flyer } from '@/types/voting-types';


import neutralEmoji from '@/assets/img/thinking-face.png';
import positiveEmoji from '@/assets/img/grinning-face.png';
import negativeEmoji from '@/assets/img/slightly-frowning-face.png';

const props = defineProps<{
    votes: number;
    credits: number;
    maxCredits: number;
    isPool: boolean;
}>();


const scale = computed(() => {
    const maxVotes = Math.sqrt(props.maxCredits);
    const rawScale = Math.abs(props.votes) / maxVotes;
    return 0.15 + (rawScale * 0.85); // so number between 0.15 and 1
});


const scaleNextVote = computed(() => {
    const maxVotes = Math.sqrt(props.maxCredits);
    const currentVotes = Math.abs(props.votes);

    if (props.votes === 0 && props.credits === 0) {
        return 0.15;
    }

    const nextVoteScale = (currentVotes + 1) / maxVotes;

    if (props.credits >= Math.pow(Math.floor(Math.abs(props.votes)) + 2, 2)) {
        return 0.15 + (nextVoteScale * 0.85);
    }
    return 0.15 + ((currentVotes / maxVotes) * 0.85);
});


const voteEmoji = computed(() => {

    if (props.votes === 0) {
        return neutralEmoji;
    }

    if (props.votes > 0) {
        return positiveEmoji;
    }

    if (props.votes < 0) {
        return negativeEmoji;
    }


});



watch(() => props.votes, (newVotes, oldVotes) => {
    const newCost = newVotes * newVotes;
    const oldCost = oldVotes * oldVotes;
    const creditChange = Math.abs(newCost - oldCost);
    addFlyer(creditChange, newVotes > oldVotes ? 'in' : 'out');
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
    <div class="votes-visualizer">
        <div class="votes-visualizer-inner"
            :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
            :style="'transform: scale(' + (scale) + ')'">
            <div class="emoji-img" :class="{ negative: props.votes < 0, positive: props.votes > 0 }" v-if="!props.isPool">
                <img :src="voteEmoji" alt="Vote Emoji" />
            </div>
        </div>
    </div>
</template>