<script setup lang="ts">
    import { computed } from 'vue';


    const props = defineProps<{
        votes: number;
        credits: number;
        maxCredits: number;
        isPool: boolean;
        emoji: string;
    }>();


    const scale = computed(() => {
        const rawScale = props.credits / props.maxCredits;
        return 0.15 + (rawScale * 0.85);
    });


    const scaleNextVote = computed(() => {
        const currentVotes = Math.floor(Math.abs(props.votes));
        const currentVoteCredits = Math.pow(currentVotes + 1, 2);
        const nextVoteCredits = Math.pow(currentVotes + 2, 2);
        
        if (props.votes === 0 && props.credits === 0) {
            return 0.15;
        }
        
        const baseScale = currentVoteCredits / props.maxCredits;
        const nextScale = nextVoteCredits / props.maxCredits;
        
        if (props.credits >= nextVoteCredits) {
            return 0.15 + (nextScale * 0.85);
        }
        return 0.15 + (baseScale * 0.85);
    });

</script>

<template>


<div class="credits-visualizer">
    <div class="credits-visualizer-inner" :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
        :style="'transform: scale(' + (scale) + ')'"
        >

     
        <!-- <div class="emoji" :class="{ negative: props.votes < 0, positive: props.votes > 0 }">{{ 
            props.votes === 0 ? '😐' : 
            props.votes > 0 ? ['😐','🙂','☺️','😊','😄','😃','😀','😁','😆','🤗'][Math.min(Math.floor(props.votes/2), 9)] :
            ['😐','🙁','☹️','😟','😔','😣','😖','😫','😩','😢'][Math.min(Math.floor(Math.abs(props.votes)/2), 9)]
        }}</div> -->

        <div class="emoji" >🤍</div>
    </div>
    <div class="credits-visualizer-next-vote"
        :style="'transform: scale(' + (scaleNextVote) + ')'"
    ></div>

    {{ scale }}
</div>



</template>