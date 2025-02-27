<script setup lang="ts">
    import { computed } from 'vue';


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
        return minimumScale + (rawScale * (1-minimumScale));
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

</script>

<template>


<div class="credits-visualizer">
    <div class="credits-visualizer-inner" :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
        :style="'transform: scale(' + (scale) + ')'"
        >
        <div class="emoji" >{{ props.emoji }}</div>
    </div>
    <!-- <div class="credits-visualizer-next-vote"
        :style="'transform: scale(' + (scaleNextVote) + ')'"
    ></div> -->
</div>



</template>