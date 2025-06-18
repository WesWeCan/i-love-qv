<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
    numSparkles: number;
    showSparkles: boolean;
}>();

const sparkleConfigs = ref<Array<{
    id: number;
    size: string;
    variant: string;
    left: string;
    top: string;
    animationDelay: string;
    animationDirection: string;
}>>([]);

onMounted(() => {
    sparkleConfigs.value = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        size: Math.random() > 0.5 ? 'small' : Math.random() > 0.5 ? 'medium' : 'large',
        variant: Math.random() > 0.5 ? 'variant-1' : Math.random() > 0.5 ? 'variant-2' : 'variant-3',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's',
        animationDirection: Math.random() > 0.5 ? 'normal' : 'reverse'
    }));
});
</script>

<template>
    <div class="sparkles" :class="{ showSparkles: showSparkles }">
        <div v-for="sparkle in sparkleConfigs" 
             :key="sparkle.id"
             class="sparkle"
             :class="[sparkle.size, sparkle.variant, { hidden: sparkle.id >= numSparkles }]"
             :style="{
                 left: sparkle.left,
                 top: sparkle.top,
                 animationDelay: sparkle.animationDelay,
                 animationDirection: sparkle.animationDirection
             }">
        </div>
    </div>
</template>

<style scoped lang="scss">
.sparkles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: -1;

    // background-color: rgba(0, 0, 255, 0.096);

    clip-path: circle(60% at 50% 50%);

    opacity: 0;
    scale: 1;
    transition: all .5s cubic-bezier(0.075, 0.82, 0.165, 1);
    transition-delay: .05s;

    &.showSparkles {
        opacity: 1;
        scale: 1.3;
    }
}

.sparkle {
    width: 10px;
    height: 10px;

    position: absolute;
    top: 0;
    left: 0;
    translate: -50% -50%;

    






    background: radial-gradient(circle, rgb(150 229 229) 0%, rgb(68 142 230) 64%, rgb(33 107 107) 80%, rgba(255, 255, 255, 0.5) 100%);
    clip-path: polygon(
        50% 0%, 
        61% 35%, 
        98% 35%, 
        68% 57%, 
        79% 91%, 
        50% 70%, 
        21% 91%, 
        32% 57%, 
        2% 35%, 
        39% 35%
    );
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 
                0 0 10px rgba(0, 165, 255, 0.5);

    animation: sparkle-animation 1.5s ease-in-out infinite;



    &.small {
        width: 8px;
        height: 8px;
    }

    &.medium {
        width: 15px;
        height: 15px;
    }

    &.large {
        width: 20px;
        height: 20px;
    }

    &.variant-1 {
        background: radial-gradient(circle, rgb(200 255 255) 0%, rgb(0 165 255) 64%, rgb(0 140 255) 80%, rgba(255, 255, 255, 0.5) 100%);
    }

    &.variant-2 {
        background: radial-gradient(circle, rgb(180 255 255) 0%, rgb(0 191 255) 64%, rgb(0 150 255) 80%, rgba(255, 255, 255, 0.5) 100%);
    }

    &.variant-3 {
        background: radial-gradient(circle, rgb(220 255 255) 0%, rgb(0 200 255) 64%, rgb(0 160 255) 80%, rgba(255, 255, 255, 0.5) 100%);
    }



    &.hidden {
        opacity: 0!important;
    }
}


@keyframes sparkle-animation {
    0% {
        transform: scale(0) rotate(0deg);
        opacity: 0;
    }
    50% {
        transform: scale(1.2) rotate(180deg);
        opacity: .85;
    }
    100% {
        transform: scale(0) rotate(360deg);
        opacity: 0;
    }
}




</style>