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
const cardsContainer = ref<HTMLElement | null>(null);
const selectedIssueIndex = ref(0);

// Store references to issue cards for position calculations
const issueCardRefs = ref<HTMLElement[]>([]);
// Store references to issue card components
const issueCardComponentRefs = ref([]);

// Track active voting
let activeVotingIssueUuid: string | null = null;

// Drag functionality for desktop
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const isDesktop = ref(false);

// Check if device is desktop (not touch)
const checkIfDesktop = () => {
    isDesktop.value = !('ontouchstart' in window) && !navigator.maxTouchPoints;
};

// Drag event handlers
const handleMouseDown = (e: MouseEvent) => {
    if (!isDesktop.value || !cardsContainer.value) return;
    
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.vote-button') || target.closest('.flip')) {
        return;
    }
    
    isDragging.value = true;
    startX.value = e.pageX - cardsContainer.value.offsetLeft;
    scrollLeft.value = cardsContainer.value.scrollLeft;
    cardsContainer.value.style.cursor = 'grabbing';
    cardsContainer.value.style.userSelect = 'none';
};

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !isDesktop.value || !cardsContainer.value) return;
    
    e.preventDefault();
    const x = e.pageX - cardsContainer.value.offsetLeft;
    const walk = (x - startX.value) * 2; // Scroll speed multiplier
    cardsContainer.value.scrollLeft = scrollLeft.value - walk;
};

const handleMouseUp = () => {
    if (!isDesktop.value || !cardsContainer.value) return;
    
    isDragging.value = false;
    cardsContainer.value.style.cursor = 'grab';
    cardsContainer.value.style.removeProperty('user-select');
};

const handleMouseLeave = () => {
    if (!isDesktop.value || !cardsContainer.value) return;
    
    isDragging.value = false;
    cardsContainer.value.style.cursor = 'grab';
    cardsContainer.value.style.removeProperty('user-select');
};

onMounted(() => {
    checkIfDesktop();
    
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
        
        // Add drag event listeners for desktop
        if (isDesktop.value) {
            cardsContainer.value.addEventListener('mousedown', handleMouseDown);
            cardsContainer.value.addEventListener('mousemove', handleMouseMove);
            cardsContainer.value.addEventListener('mouseup', handleMouseUp);
            cardsContainer.value.addEventListener('mouseleave', handleMouseLeave);
        }
    }

    // Initialize the cards array after the component is mounted
    setTimeout(() => {
        issueCardRefs.value = Array.from(document.querySelectorAll('.issue-card'));
        updateSelectedCard();
    }, 500);

    // Add scroll event listener
    window.addEventListener('scroll', updateSelectedCard);
    
    // Listen for window resize to update desktop detection
    window.addEventListener('resize', checkIfDesktop);
});

onBeforeUnmount(() => {
    // Clean up event listeners
    window.removeEventListener('scroll', updateSelectedCard);
    window.removeEventListener('resize', checkIfDesktop);
    
    if (cardsContainer.value && isDesktop.value) {
        cardsContainer.value.removeEventListener('mousedown', handleMouseDown);
        cardsContainer.value.removeEventListener('mousemove', handleMouseMove);
        cardsContainer.value.removeEventListener('mouseup', handleMouseUp);
        cardsContainer.value.removeEventListener('mouseleave', handleMouseLeave);
    }
    
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

const moveLeft = () => {
    if (!cardsContainer.value) return;
    
    // Find the previous issue card to scroll to
    const currentIndex = selectedIssueIndex.value;
    if (currentIndex > 0) {
        const targetIndex = currentIndex - 1;
        scrollToCard(targetIndex);
    }
}

const moveRight = () => {
    if (!cardsContainer.value) return;
    
    // Find the next issue card to scroll to
    const currentIndex = selectedIssueIndex.value;
    if (currentIndex < props.votingRound.issues.length - 1) {
        const targetIndex = currentIndex + 1;
        scrollToCard(targetIndex);
    }
}

const scrollToCard = (cardIndex: number) => {
    if (!cardsContainer.value || !issueCardRefs.value[cardIndex]) return;
    
    const targetCard = issueCardRefs.value[cardIndex];
    
    // Calculate the position to scroll to (center the card in the container)
    const containerRect = cardsContainer.value.getBoundingClientRect();
    const cardRect = targetCard.getBoundingClientRect();
    
    const scrollLeft = cardsContainer.value.scrollLeft + 
        (cardRect.left - containerRect.left) - 
        (containerRect.width / 2) + 
        (cardRect.width / 2);
    
    cardsContainer.value.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
    });
    
    // Update the selected index
    selectedIssueIndex.value = cardIndex;
}



</script>


<template>
    <div 
        ref="cardsContainer" 
        class="issue-cards" 
        :class="{ 
            visible: isVisible,
            'desktop-drag': isDesktop,
            'dragging': isDragging
        }"
    >
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
    <div class="movement-controls">
        <button @click="moveLeft">left</button>
        <button @click="moveRight">right</button>
    </div>

    <!-- <div class="voting-controls">
            <button @pointerdown="castSingleVote(true)">➖</button>
            <button @pointerdown="castSingleVote(false)">➕</button>
    </div> -->
</template>


