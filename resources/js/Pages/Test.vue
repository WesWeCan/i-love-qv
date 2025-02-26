<script setup lang="ts">

// Quadratic Cheat Sheet
//    =   
//    =   
//    =   
//    =   
//    =   
//    =   
//    =   
//    =   
//    =   
//    =   


// 1     credit     = 1    vote 
// 4     credits    = 2    vote 
// 9     credits    = 3    vote 
// 16    credits    = 4    vote 
// 25    credits    = 5    vote 
// 36    credits    = 6    vote 
// 49    credits    = 7    vote 
// 64    credits    = 8    vote 
// 81    credits    = 9    vote 
// 100   credits    = 10   vote


// formula = x ^ 2



import CreditsVisualizer from '@/Components/CreditsVisualizer.vue';

import DataOverview from '@/Components/DataOverview.vue';
import VotesVisualizer from '@/Components/VotesVisualizer.vue';
import * as VotingTypes from '@/types/voting-types';
import { onMounted, ref, computed } from 'vue';

const maxCredits = ref(10000);
const remainingCredits = ref(10000);

const issues = ref<VotingTypes.Issue[]>([
    {
        text: '🍎 Appel',
        uuid: 'issue-1',
        emoji: '🍎'
    },
    {
        text: '🍐 Peer',
        uuid: 'issue-2',
        emoji: '🍐'
    },
    {
        text: '🍌 Banaan',
        uuid: 'issue-3',
        emoji: '🍌'
    },
    {
        text: '🍊 Sinaasappel',
        uuid: 'issue-4',
        emoji: '🍊'
    },
    {
        text: '🍊 Mandarijn',
        uuid: 'issue-5',
        emoji: '🍊'
    },
    {
        text: '🥝 Kiwi',
        uuid: 'issue-6',
        emoji: '🥝'
    },
    {
        text: '🍇 Druif',
        uuid: 'issue-7',
        emoji: '🍇'
    },
    {
        text: '🍓 Aardbei',
        uuid: 'issue-8',
        emoji: '🍓'
    },
    {
        text: '🫐 Framboos',
        uuid: 'issue-9',
        emoji: '🫐'
    },
    {
        text: '🥭 Mango',
        uuid: 'issue-10',
        emoji: '🥭'
    },
]);

const participant = ref<VotingTypes.Participant>(
    {
        name: null,
        userUuid: 'user-1',
        castedVotes: [],
    }
);

const votingRound = ref<VotingTypes.VotingRound>({
    id: 1,
    uuid: 'voting-round-1',
    name: 'Wat moet er in de fruitschaal?',
    credits: 10000,
    issues: issues.value,
    options: {
        forceSpread: false,
    }
});

onMounted(() => {

    setupParticipant();

    maxCredits.value = votingRound.value.credits;
    remainingCredits.value = votingRound.value.credits;

});

const setupParticipant = () => {
    for (let i = 0; i < votingRound.value.issues.length; i++) {
        const issue = votingRound.value.issues[i];
        participant.value.castedVotes.push({
            issueUuid: issue.uuid,
            numberOfVotes: 0,
            creditsSpent: 0,
        });
    }

}


// Store active voting intervals for each issue
const intervals: { [key: string]: number } = {};
// Duration between vote casts in milliseconds
let intervalDuration = 150;
// Amount to increment/decrement votes by
const votingStep = 1;

const creditSpendingStep = 1;

/**
 * Cast a vote for an issue, calculating quadratic voting cost
 * @param issueUuid - Unique identifier for the issue being voted on
 * @param opposed - True if voting against, false if voting for
 */
const castVote = (issueUuid: string, opposed: boolean) => {
    const vote = participant.value.castedVotes.find(vote => vote.issueUuid === issueUuid);

    if (!vote) {
        console.error("Could not find vote for issue", issueUuid);
        return;
    }

    const votesCast = Number(vote.numberOfVotes.toFixed(1));
    const voteCurrentWorth = Number((votesCast * votesCast).toFixed(2));

    const newVotes = opposed ? votesCast - votingStep : votesCast + votingStep;
    const voteNewWorth = Number((newVotes * newVotes).toFixed(2));

    const voteCost = Number((voteNewWorth - voteCurrentWorth).toFixed(2));

    if (remainingCredits.value - voteCost >= 0 && remainingCredits.value - voteCost <= maxCredits.value) {
        remainingCredits.value = Number((remainingCredits.value - voteCost).toFixed(2));
        vote.creditsSpent = Number((vote.creditsSpent + voteCost).toFixed(2));
        vote.numberOfVotes = Number((vote.numberOfVotes + (opposed ? -votingStep : votingStep)).toFixed(1));
    } else {
        console.info("Not enough credits to cast vote");
        return;
    }
}

const spendCredits = (issueUuid: string, opposed: boolean) => {
    const vote = participant.value.castedVotes.find(vote => vote.issueUuid === issueUuid);

    if (!vote) {
        console.error("Could not find vote for issue", issueUuid);
        return;
    }

    const creditsSpent = Number(vote.creditsSpent.toFixed(2));
    const newCredits = opposed ? creditsSpent - creditSpendingStep : creditsSpent + creditSpendingStep;
    const votesWorth = Number(Math.sqrt(newCredits).toFixed(1));

    if (remainingCredits.value - creditSpendingStep >= 0 && remainingCredits.value - creditSpendingStep <= maxCredits.value) {
        remainingCredits.value = Number((remainingCredits.value - (opposed ? -creditSpendingStep : creditSpendingStep)).toFixed(2));
        vote.creditsSpent = Number(newCredits.toFixed(2));
        vote.numberOfVotes = Number(votesWorth.toFixed(1));
    } else {
        console.info("Not enough credits to spend");
        return;
    }
}

/**
 * Start continuous voting on an issue while pointer/mouse is held down
 * @param issueUuid - Issue to vote on
 * @param opposed - Direction of vote
 */
const startVoting = (issueUuid: string, opposed: boolean) => {
    castVote(issueUuid, opposed);
    intervals[issueUuid] = setInterval(() => castVote(issueUuid, opposed), intervalDuration);
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

</script>

<template>

    <div class="voting-round">
        <header>
            <h1>{{ votingRound.name }}</h1>
        </header>


        <div class="voting-interface">
            <div class="credit-pool">
                <span>Credits left: {{ remainingCredits }}</span>

                <CreditsVisualizer :votes="0" :credits="remainingCredits" :maxCredits="votingRound.credits"
                    :isPool="true" :emoji="'🤍'" />

            </div>

            <div class="issues" >

                <template v-for="(issue, index) in issues" :key="index">
                <div class="issue">
                    <h2>{{ issue.text }}</h2>

                    <VotesVisualizer
                        :votes="participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0"
                        :credits="participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.creditsSpent || 0"
                        :maxCredits="maxCredits" :isPool="false" :emoji="issue.emoji" />


                    <div class="buttons">

                        <button @pointerdown="startVoting(issue.uuid, true)" @pointerup="stopVoting(issue.uuid)"
                        @pointerleave="stopVoting(issue.uuid)">
                    
                        {{ (participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0) > 0 ? 'Fewer' : 'Vote against' }}
                    
                    </button>

                        <button @pointerdown="startVoting(issue.uuid, false)" @pointerup="stopVoting(issue.uuid)"
                            @pointerleave="stopVoting(issue.uuid)">
                            {{ (participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0) < 0 ? 'Fewer' : 'Vote in favor' }}
                        </button>
                       

                    </div>

                    <div class="buttons">
                        <span>[{{ participant?.castedVotes.find(vote => vote.issueUuid ===
                        issue.uuid)?.numberOfVotes }} votes]</span>
                        
                        <span>[{{ participant?.castedVotes.find(vote => vote.issueUuid ===
                            issue.uuid)?.creditsSpent }} credits]</span>
                    </div>



                </div>
            </template>

            </div>
        </div>

    </div>
    <hr>

    <DataOverview :participant="participant" :votingRound="votingRound" :issues="issues" />






</template>