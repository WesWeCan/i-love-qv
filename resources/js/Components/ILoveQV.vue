<script setup lang="ts">
import { ref } from 'vue'

const clickCount = ref(0)
const showHearts = ref(false)
const fadeOut = ref(false)
const hearts = ref<Array<{
    delay: string;
    left: string;
    size: string;
    speed: string;
    sway: string;
}>>([])

let fadeTimeout: number | null = null
let hideTimeout: number | null = null

const handleFooterClick = () => {
    clickCount.value++

    if (clickCount.value >= 10) {
        // Clear any existing timeouts
        if (fadeTimeout) clearTimeout(fadeTimeout)
        if (hideTimeout) clearTimeout(hideTimeout)

        // Generate heart properties once
        hearts.value = Array.from({ length: 80 }, () => ({
            delay: `${Math.random() * 4}s`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 15 + 8}px`,
            speed: `${Math.random() * 3 + 4}s`,
            sway: `${Math.random() * 100 - 50}px`,
        }))

        showHearts.value = true
        fadeOut.value = false
        clickCount.value = 0

        // Start fade out after 6 seconds
        fadeTimeout = setTimeout(() => {
            fadeOut.value = true
        }, 6000)

        // Hide hearts after fade out completes
        hideTimeout = setTimeout(() => {
            showHearts.value = false
            fadeOut.value = false
        }, 8000)
    }
}


</script>

<template>
    <div class="i-love-qv" @click="handleFooterClick">
        <p>I <span class="heart-footer">❤️</span> QV ©2025</p>
    </div>

    <!-- Heart rain overlay -->
    <div v-if="showHearts" class="heart-rain" :class="{ 'fade-out': fadeOut }">
        <div v-for="(heart, i) in hearts" :key="i" class="heart" :style="{
            '--delay': heart.delay,
            '--left': heart.left,
            '--size': heart.size,
            '--speed': heart.speed,
            '--sway': heart.sway
        }">
            ❤️
        </div>
    </div>

</template>


<style scoped>
.front-layout {
    position: relative;
    min-height: 100vh;
}

footer {
    cursor: pointer;
    user-select: none;
}

.heart-rain {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
    transition: opacity 2s ease-out;
    opacity: 1;
}

.heart-rain.fade-out {
    opacity: 0;
}

.heart {
    position: absolute;
    top: -50px;
    left: var(--left);
    font-size: var(--size);
    animation: heartRain var(--speed) linear infinite;
    animation-delay: var(--delay);
    opacity: 0;
    will-change: transform, opacity;
}

@keyframes heartRain {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
    }

    10% {
        opacity: 0.9;
    }

    90% {
        opacity: 0.9;
    }

    100% {
        transform: translateY(100vh) translateX(var(--sway)) rotate(360deg);
        opacity: 0;
    }
}

/* Remove the red filter since we're using custom colors */
.heart {
    filter: brightness(1.1);
}
</style>
