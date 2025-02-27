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

</script>

<template>


<div class="credits-visualizer">
    <div class="credits-visualizer-inner" :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
        :style="'transform: scale(' + (scale) + ')'"
        >
        <div class="emoji" :class="{ negative: props.votes < 0, positive: props.votes > 0 }" v-if="!props.isPool">{{ 
            props.votes === 0 ? '😐' : 
            props.votes > 0 ? ['😐','🙂','☺️','😊','😄','😃','😀','😁','😆','🤗'][Math.min(Math.floor(props.votes/2), 9)] :
            ['😐','🙁','☹️','😟','😔','😣','😖','😫','😩','😢'][Math.min(Math.floor(Math.abs(props.votes)/2), 9)]
        }}</div>
        <div class="emoji" v-else>🤍</div>
    </div>
    <div class="credits-visualizer-next-vote"
        :style="'transform: scale(' + (scaleNextVote) + ')'"
    ></div>

    {{ scale }}
</div>



</template>