<script setup lang="ts">
import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted } from 'vue';
import VotesVisualizer from './VotesVisualizer.vue';

const props = defineProps<{
    issue: VotingTypes.Issue;
    participant: VotingTypes.Participant;
    votingRound: VotingTypes.VotingRound;
}>();

const emit = defineEmits(['castVote']);

const emitVote = (issueUuid: string, opposed: boolean) => {
    emit('castVote', {issueUuid, opposed});
}

const flipped = ref(false);

// Store active voting intervals for each issue
const intervals: { [key: string]: number } = {};
// Duration between vote casts in milliseconds
let intervalDuration = 150;

/**
 * Start continuous voting on an issue while pointer/mouse is held down
 * @param issueUuid - Issue to vote on
 * @param opposed - Direction of vote
 */
 const startVoting = (issueUuid: string, opposed: boolean) => {
    emitVote(issueUuid, opposed);
    intervals[issueUuid] = setInterval(() => emitVote(issueUuid, opposed), intervalDuration);
    return issueUuid;
}

/**
 * Stop continuous voting when pointer/mouse is released
 * @param issueUuid - Issue to stop voting on
 */
const stopVoting = (issueUuid: string) => {
    clearInterval(intervals[issueUuid]);
    delete intervals[issueUuid];
}


onMounted(() => {
    console.log(props.issue);
});


const issueVotingData = computed(() => {
    const issueVotes = props.participant?.castedVotes.find(vote => vote.issueUuid === props.issue.uuid);
    if (!issueVotes) {
        return {
            numberOfVotes: 0,
            creditsSpent: 0,
        };
    }

    return issueVotes;
});
</script>

<template>

    <div class="issue-card" :class="{ flipped: flipped, neutral: issueVotingData.numberOfVotes === 0, positive: issueVotingData.numberOfVotes > 0, negative: issueVotingData.numberOfVotes < 0 }">

        <div class="front">
        <div class="issue-card-header">
            <div class="issue-card-emoji">{{ props.issue.emoji }}</div>
            <h2>{{ props.issue.text }}</h2>
            <span @click="flipped = !flipped" class="issue-card-emoji flip">🔁</span>
        </div>
        <div class="issue-card-visualizer">
            <VotesVisualizer :votes="issueVotingData.numberOfVotes" :credits="issueVotingData.creditsSpent" :maxCredits="votingRound.credits" :isPool="false" :emoji="props.issue.emoji" :use-emoji="false" :pool-emoji="props.votingRound.emoji" />
        </div>
        <div class="issue-card-footer">
            
            <button @pointerdown="startVoting(issue.uuid, true)" @pointerup="stopVoting(issue.uuid)"
                        @pointerleave="stopVoting(issue.uuid)">
                    
                        {{ (participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0) > 0 ? '➖' : '➖' }}
                    
                    </button>

                        <button @pointerdown="startVoting(issue.uuid, false)" @pointerup="stopVoting(issue.uuid)"
                            @pointerleave="stopVoting(issue.uuid)">
                            {{ (participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0) < 0 ? '➕' : '➕' }}
                        </button>
        </div>
        </div>

        <div class="back">
            <div class="issue-card-header">
            <div class="issue-card-emoji">{{ props.issue.emoji }}</div>
            <h2>{{ props.issue.text }}</h2>
            <span @click="flipped = !flipped" class="issue-card-emoji flip">🔁</span>
        </div>
        <div class="issue-card-visualizer">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>
        <div class="issue-card-footer"></div>
        </div>

    </div>


</template>