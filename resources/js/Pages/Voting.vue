<script setup lang="ts">

import * as VotingTypes from '@/types/voting-types';
import { onMounted, ref, computed } from 'vue';

import { exampleIssues } from '@/Assets/ExampleIssues';
import FrontLayout from '@/Layouts/FrontLayout.vue';
import Tutorial from '@/Components/Tutorial.vue';
import CreditsVisualizer from '@/Components/CreditsVisualizer.vue';
import ResultVisualizer from '@/Components/ResultVisualizer.vue';
import IssueCards from '@/Components/IssueCards.vue';



const numCredits = 10000;

const maxCredits = ref(-1);
const remainingCredits = ref(-1);


const votingRound = ref<VotingTypes.VotingRound>({
    id: 1,
    uuid: 'voting-round-1',
    name: 'What needs to be in the fruit basket?',
    description: "We want to know what fruit we need to buy to make a fruit basket.",
    credits: numCredits,
    emoji: '🤍',
    issues: exampleIssues.sort(() => 0.5 - Math.random()),
    options: {
        forceSpread: false,
    }
});

const participant = ref<VotingTypes.Participant>(
    {
        name: null,
        userUuid: 'user-1',
        castedVotes: [],
    }
);



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

onMounted(() => {

    setupParticipant();

    maxCredits.value = votingRound.value.credits;
    remainingCredits.value = votingRound.value.credits;

});


// Amount to increment/decrement votes by
const votingStep = 1;

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

const onCastVoteEvent = (event : {issueUuid: string, opposed: boolean}) => {
    castVote(event.issueUuid, event.opposed);
}


</script>


<template>

<FrontLayout>

    <Tutorial :credits="0" />

    <div class="vote-container">

        <header>
            <h1>{{ votingRound.name }}</h1>
            <p v-if="votingRound.description">{{ votingRound.description }}</p>
        </header>


        <div class="influence-pool">
            <CreditsVisualizer :votes="0" :credits="remainingCredits" :maxCredits="votingRound.credits"
                    :isPool="true" :emoji="'🤍'" />
        </div>

        <IssueCards :votingRound="votingRound" :participant="participant" @cast-vote="onCastVoteEvent" />

    </div>


    <div class="result-container">
        <ResultVisualizer :votingRound="votingRound" :participants="[participant]" />
    </div>


</FrontLayout>










<details>
    <summary>Raw Data</summary>
    <div>
                <details>
                        <summary>Voting Round</summary>
                        <pre>{{ votingRound }}</pre>
                </details>
                <details>
                        <summary>Participant</summary>
                        <pre>{{ participant }}</pre>
                </details>
                <details>
                        <summary>Max Credits</summary>
                        <pre>{{ maxCredits }}</pre>
                </details>
                <details>
                        <summary>Remaining Credits</summary>
                        <pre>{{ remainingCredits }}</pre>
                        <input type="range" min="0" max="10000" v-model.number="remainingCredits" />
                </details>
    </div>
</details>


</template>