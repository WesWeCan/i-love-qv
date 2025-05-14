<script setup lang="ts">

import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useContinuousVoting } from '@/Composables/useContinuousVoting';

import IssueCard from '@/Components/IssueCard.vue';

const props = defineProps<{
    votingRound: VotingTypes.VotingRound;
    participant: VotingTypes.Participant;
}>();

const emit = defineEmits(['cast-vote']);

// Use the continuous voting composable
const { startVoting, stopVoting } = useContinuousVoting(emit);

const isVisible = ref(false);
const cardsContainer = ref(null);
const selectedIssueIndex = ref(0);

// Store references to issue cards for position calculations
const issueCardRefs = ref<HTMLElement[]>([]);
// Store references to issue card components
const issueCardComponentRefs = ref([]);

// Track active voting
let activeVotingIssueUuid: string | null = null;

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

    // Initialize the cards array after the component is mounted
    setTimeout(() => {
        issueCardRefs.value = Array.from(document.querySelectorAll('.issue-card'));
        updateSelectedCard();
    }, 500);

    // Add scroll event listener
    window.addEventListener('scroll', updateSelectedCard);
});

onBeforeUnmount(() => {
    // Clean up event listener
    window.removeEventListener('scroll', updateSelectedCard);
    
    // Clear any active voting intervals
    if (activeVotingIssueUuid) {
        stopVoting(activeVotingIssueUuid);
        activeVotingIssueUuid = null;
    }
});

// Find the card closest to the center of the viewport
const updateSelectedCard = () => {
    if (!issueCardRefs.value.length) return;
    
    const viewportHeight = window.innerHeight;
    const viewportCenter = window.scrollY + (viewportHeight / 2);
    
    let closestCard = null;
    let closestDistance = Infinity;
    
    issueCardRefs.value.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = window.scrollY + rect.top + (rect.height / 2);
        const distance = Math.abs(viewportCenter - cardCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = index;
        }
    });
    
    if (closestCard !== null) {
        selectedIssueIndex.value = closestCard;
    }
};

// Handle continuous voting for the selected card
const startVotingForSelectedCard = (opposed: boolean) => {
    if (selectedIssueIndex.value >= 0 && props.votingRound.issues.length > selectedIssueIndex.value) {
        const selectedIssue = props.votingRound.issues[selectedIssueIndex.value];
        activeVotingIssueUuid = selectedIssue.uuid;
        startVoting(activeVotingIssueUuid, opposed);
    }
};

const stopVotingForSelectedCard = () => {
    if (activeVotingIssueUuid) {
        stopVoting(activeVotingIssueUuid);
        activeVotingIssueUuid = null;
    }
};

const castSingleVote = (opposed: boolean) => {
    if (selectedIssueIndex.value >= 0 && props.votingRound.issues.length > selectedIssueIndex.value) {
        const selectedIssue = props.votingRound.issues[selectedIssueIndex.value];
        activeVotingIssueUuid = selectedIssue.uuid;
     
        emit('cast-vote', { issueUuid: activeVotingIssueUuid, opposed });
    }
}

</script>


<template>
    <div ref="cardsContainer" class="issue-cards" :class="{ visible: isVisible }">
        <template v-for="(issue, index) in votingRound.issues" :key="index">
            <IssueCard 
                ref="issueCardComponentRefs"
                :votingRound="votingRound" 
                :issue="issue" 
                :participant="participant"
                :class="{ 'selected': index === selectedIssueIndex }"
                @cast-vote="emit('cast-vote', $event)" />
        </template>
    </div>
    <div class="voting-controls">
        <!-- <button 
            @pointerdown="startVotingForSelectedCard(true)" 
            @pointerup="stopVotingForSelectedCard" 
            @pointerleave="stopVotingForSelectedCard"
            
            >➖</button>
        <button 
            @pointerdown="startVotingForSelectedCard(false)" 
            @pointerup="stopVotingForSelectedCard" 
            @pointerleave="stopVotingForSelectedCard">➕</button> -->
            <button @pointerdown="castSingleVote(true)">➖</button>
            <button @pointerdown="castSingleVote(false)">➕</button>
    </div>
</template>


