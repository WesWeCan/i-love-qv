<script setup lang="ts">
    import { computed } from 'vue';


    const props = defineProps<{
        votes: number;
        credits: number;
        maxCredits: number;
        isPool: boolean;
    }>();


    const scale = computed(() => {
        return props.credits / props.maxCredits;
    });

</script>

<template>


<div class="credits-visualizer">
    <div class="credits-visualizer-inner" :class="{ negative: props.votes < 0, positive: props.votes > 0, pool: props.isPool }"
        :style="'transform: scale(' + (scale) + ')'"
        >

    </div>
</div>



</template>