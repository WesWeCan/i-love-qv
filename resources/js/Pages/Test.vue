<script setup lang="ts">

// Quadratic Cheat Sheet
// 1 vote = 1 credit
// 2 vote = 4 credits
// 3 vote = 9 credits
// 4 vote = 16 credits
// 5 vote = 25 credits
// 6 vote = 36 credits
// 7 vote = 49 credits
// 8 vote = 64 credits
// 9 vote = 81 credits
// 10 vote = 100 credits




import * as VotingTypes from '@/types/voting-types';
import { onMounted, ref, computed } from 'vue';

const maxCredits = ref(100);
const remainingCredits = ref(100);

const issues = ref<VotingTypes.Issue[]>([
    {
        text: 'Appel',
        uuid: 'issue-1',
    },
    {
        text: 'Peer',
        uuid: 'issue-2',
    },
    {
        text: 'Banaan',
        uuid: 'issue-3',
    },
    {
        text: 'Sinaasappel',
        uuid: 'issue-4',
    },
    {
        text: 'Mandarijn',
        uuid: 'issue-5',
    },
    {
        text: 'Kiwi',
        uuid: 'issue-6',
    },
    {
        text: 'Druif',
        uuid: 'issue-7',
    },
    {
        text: 'Aardbei',
        uuid: 'issue-8',
    },
    {
        text: 'Framboos',
        uuid: 'issue-9',
    },
    {
        text: 'Mango',
        uuid: 'issue-10',
    },
]);

const participant = ref<VotingTypes.Participant>(
    {
        name: 'Wesley Wecan',
        userUuid: 'user-1',
        castedVotes: [],
    }
);

const votingRound = ref<VotingTypes.VotingRound>({
    id: 1,
    uuid: 'voting-round-1',
    name: 'Voting Round 1',
    credits: 100,
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
const intervalDuration = 50;
// Amount to increment/decrement votes by
const votingStep = .1;

/**
 * Cast a vote for an issue, calculating quadratic voting cost
 * @param issueUuid - Unique identifier for the issue being voted on
 * @param opposed - True if voting against, false if voting for
 */
const castVote = (issueUuid: string, opposed: boolean) => {
    const vote = participant.value.castedVotes.find(vote => vote.issueUuid === issueUuid);

    if(!vote) {
        console.error("Could not find vote for issue", issueUuid);
        return;
    }

    const votesCast = Number(vote.numberOfVotes.toFixed(1));
    const voteCurrentWorth = Number((votesCast * votesCast).toFixed(2));

    const newVotes = opposed ? votesCast - votingStep : votesCast + votingStep;
    const voteNewWorth = Number((newVotes * newVotes).toFixed(2));
    
    const voteCost = Number((voteNewWorth - voteCurrentWorth).toFixed(2));

    if(remainingCredits.value - voteCost >= 0 && remainingCredits.value - voteCost <= maxCredits.value) {
        remainingCredits.value = Number((remainingCredits.value - voteCost).toFixed(2));
        vote.creditsSpent = Number((vote.creditsSpent + voteCost).toFixed(2));
        vote.numberOfVotes = Number((vote.numberOfVotes + (opposed ? -votingStep : votingStep)).toFixed(1));
    } else {
        console.warn("Not enough credits to cast vote");
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


    <h1>{{ votingRound.name }}</h1>
    <span>Credits: {{ remainingCredits }}</span>
    <br/><br/>

    <div class="issues" v-for="(issue, index) in issues" :key="index">

        <div class="issue">
            <h2>{{ issue.text }} [{{ participant?.castedVotes.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes }}]</h2>
            
            <div class="buttons">

                <button 
                    @pointerdown="startVoting(issue.uuid, false)"
                    @pointerup="stopVoting(issue.uuid)"
                    @pointerleave="stopVoting(issue.uuid)"
                >Vote in favor</button>
                <button 
                    @pointerdown="startVoting(issue.uuid, true)"
                    @pointerup="stopVoting(issue.uuid)"
                    @pointerleave="stopVoting(issue.uuid)"
                >Vote against</button>

            </div>
            

            <br/><br/>

        </div>
        
    </div>


    <hr>

    <br><br>

    <pre>{{ participant }}</pre>





</template>