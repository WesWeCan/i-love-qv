<script setup lang="ts">

import { ref } from 'vue';

import brain from '@/Assets/img/brain.png';
import collision from '@/Assets/img/collision.png';
import traffic from '@/Assets/img/vertical-traffic-light.png';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiArrowRightThick, mdiArrowLeftThick } from '@mdi/js';

const onboardingCompleted = defineModel<boolean>('onboardingCompleted', {
    required: true,
    default: false,
});

const onboardingStep = ref(1);
const maxSteps = 3;
const direction = ref<'forward' | 'backward'>('forward');

const nextStep = () => {
    if (onboardingStep.value < maxSteps) {
        direction.value = 'forward';
        onboardingStep.value++;
    } else {
        onboardingCompleted.value = true;
    }
}

const previousStep = () => {
    if (onboardingStep.value > 1) {
        direction.value = 'backward';
        onboardingStep.value--;
    }
}

</script>

<template>

    <Transition :name="direction === 'forward' ? 'swipe' : 'swipe-reverse'" mode="out-in">
        <div class="onboarding-content" v-if="onboardingStep === 1" :key="1">
            <div class="title">
                <img src="/img/heart_cyan.png" alt="Heart" class="heart-icon" />
                <h2>About QV</h2>
            </div>

            <p>Everyone has equal voting power, which you can use to boost the issues you care about most– but you must
                weigh your decisions carefully. If you go all out on one issue it will cost you more (this is the
                quadratic formula) and you will have less voting power for the remaining issues on the ballot.</p>

            <p>QV is a clever method for figuring out which issues people care about most. For instance, if the group
                must decide on how to spend their time on different tasks, QV can gather and organise preferences about
                which tasks the group wants to prioritise.</p>

           

            <p>Once all ballots are submitted the collective results are tallied. QV can significantly mitigate the
                'tyranny of the majority'. In other words, situations in which a factional majority can suppress the
                will of the minority. In this way, it leads to more equitable and just decision making.</p>

            <div class="buttons">
                <button @click="previousStep"><SvgIcon :path="mdiArrowLeftThick" type="mdi" :size="24" /></button>
                <button @click="nextStep"><SvgIcon :path="mdiArrowRightThick" type="mdi" :size="24" /></button>
            </div>
        </div>

        <div class="onboarding-content" v-else-if="onboardingStep === 2" :key="2">
            <div class="title">
                <img src="/img/heart_gold.png" alt="Heart" class="heart-icon" />
                <h2>Our tool</h2>
            </div>

            <p>Each ballot can contain up to ten issues, which can each be voted on. It is up to you weigh these issues
                and decide which ones you care about most. Instead of simply voting for or against an issue, you express
                the degree to which you are for or against an issue by tapping the plus and minus buttons. You can also
                choose not to vote in either direction on an issue, thus abstaining.</p>
            <p>The heart is a reservoir for your voting power, and as you vote power will move between the heart and the
                issues you're voting on. You can reset the heart if you'd like to start voting from scratch again.</p>
            <p>Once you're finished press submit and your votes will be tallied with those of the group, and the
                collective result shared.</p>

            <div class="buttons">
                <button @click="previousStep"><SvgIcon :path="mdiArrowLeftThick" type="mdi" :size="24" /></button>
                <button @click="nextStep"><SvgIcon :path="mdiArrowRightThick" type="mdi" :size="24" /></button>
            </div>
        </div>

        <div class="onboarding-content" v-else-if="onboardingStep === 3" :key="3">
            <div class="title">
                <img src="/img/heart_purple.png" alt="Heart" class="heart-icon" />
                <h2>Results</h2>
            </div>
            <p>Firstly, a ranking of all issues based on most netto votes. But results can also point to remarkable
                outcomes. For instance, issues that received a lot of traffic <Popper hover placement="top" content="High Traffic"><span class="icon"><img :src="traffic"
                        alt="Traffic" class="traffic-icon" /></span></Popper> may be polarising <Popper hover placement="top" content="Polarising"><span class="icon"><img
                        :src="collision" alt="Collision" class="collision-icon" /></span></Popper>or issues nobody in the group
                is against (a so-called no-brainer.) <Popper hover placement="top" content="No Brainer"><span class="icon"><img :src="brain" alt="Brain"
                        class="brain-icon" /></span></Popper></p>

            <p>These outcomes are badged, which can be helpful for guiding further deliberation and discussion. It is up
                to the group if a QV vote is binding or a stepping stone in your decision making process.</p>

            <!-- <div class="icons-container">
                <div class="icon">
                    <img :src="traffic" alt="Traffic" class="traffic-icon" />
                </div>
                <div class="icon">
                    <img :src="collision" alt="Collision" class="collision-icon" />
                </div>
                <div class="icon">
                    <img :src="brain" alt="Brain" class="brain-icon" />
                </div>
            </div> -->

            <div class="buttons">
                <button @click="previousStep"><SvgIcon :path="mdiArrowLeftThick" type="mdi" :size="24" /></button>
                <button @click="nextStep"><SvgIcon :path="mdiArrowRightThick" type="mdi" :size="24" /></button>
            </div>
        </div>
    </Transition>

</template>