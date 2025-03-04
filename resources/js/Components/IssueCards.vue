<script setup lang="ts">

import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted } from 'vue';

import IssueCard from '@/Components/IssueCard.vue';

const props = defineProps<{
    votingRound: VotingTypes.VotingRound;
    participant: VotingTypes.Participant;
}>();

const emit = defineEmits(['castVote']);

const isVisible = ref(false);
const cardsContainer = ref(null);

onMounted(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isVisible.value = true;
                }
            });
        },
        { threshold: 0.1 }
    );

    if (cardsContainer.value) {
        observer.observe(cardsContainer.value);
    }
});

</script>


<template>
    <div ref="cardsContainer" class="issue-cards" :class="{ visible: isVisible }">

        <template v-for="(issue, index) in votingRound.issues" :key="index">
            <IssueCard :votingRound="votingRound" :issue="issue" :participant="participant"
                @cast-vote="emit('castVote', $event)" />
        </template>

    </div>
</template>