<script setup lang="ts">
import * as VotingTypes from '@/types/voting-types';
import { onMounted, ref, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import FrontLayout from '@/Layouts/FrontLayout.vue';
import CreditsVisualizer from '@/Components/CreditsVisualizer.vue';
import IssueCards from '@/Components/IssueCards.vue';
import { useForm, usePage } from '@inertiajs/vue3';
import ExplainationText from '@/Components/ExplainationText.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiHelpCircleOutline } from '@mdi/js';

const page = usePage();

const onboardingCompleted = ref(false);

const maxCredits = ref(-1);
const remainingCredits = ref(-1);

const noCreditsToast = ref(false);
const toastTimeout = ref<any>(null);



/**
 * Generates a random UUID.
 * 
 * @returns {string} The generated UUID.
 */
const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const votingRound = ref<VotingTypes.VotingRound>(page.props.election!);

const participant = ref<VotingTypes.Participant>(
    {
        name: "Voter",
        userUuid: createUUID(),
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

    // shuffle the issues for fairness
    votingRound.value.issues = votingRound.value.issues.sort(() => 0.5 - Math.random());

    setupParticipant();

    maxCredits.value = votingRound.value.credits;
    remainingCredits.value = votingRound.value.credits;

});

// IMPORTANT:
// Amount to increment/decrement votes by
// this value should be a bit-safe number!
// Otherwise, you get rounding errors!
// 1
// .5 // works best for our use case
// .25
// .125
// .0625
const votingStep = .5;

/**
 * Cast a vote for an issue, calculating quadratic voting cost
 * @param issueUuid - Unique identifier for the issue being voted on
 * @param opposed - True if voting against, false if voting for
 */
const castVote = (issueUuid: string, opposed: boolean) => {
    // Find the existing vote for this issue
    const vote = participant.value.castedVotes.find(vote => vote.issueUuid === issueUuid);

    if (!vote) {
        console.error("Could not find vote for issue", issueUuid);
        return;
    }

    // Calculate current quadratic voting cost
    const votesCast = Number(vote.numberOfVotes);
    const voteCurrentWorth = Number((votesCast * votesCast));

    // Calculate new vote count and its quadratic cost
    const newVotes = opposed ? votesCast - votingStep : votesCast + votingStep; 
    const voteNewWorth = Number((newVotes * newVotes));

    // Calculate the cost difference for this vote change
    const voteCost = Number((voteNewWorth - voteCurrentWorth));

    // Check if user has enough credits and won't exceed max credits
    if (remainingCredits.value - voteCost >= 0 && remainingCredits.value - voteCost <= maxCredits.value) {
        // Update credits and vote data
        remainingCredits.value = Number((remainingCredits.value - voteCost));
        vote.creditsSpent = Number((vote.creditsSpent + voteCost));
        vote.numberOfVotes = Number((vote.numberOfVotes + (opposed ? -votingStep : votingStep)));
    } else {
        // Show "not enough credits" toast
        console.info("Not enough credits to cast vote");
        noCreditsToast.value = true;

        if (toastTimeout.value) {
            clearTimeout(toastTimeout.value);
        }
        toastTimeout.value = setTimeout(() => {
            noCreditsToast.value = false;
        }, 3500);

        return;
    }

    console.log("Remaining credits: ", remainingCredits.value);
}

/**
 * Event handler for when a vote is cast
 * @param event - The event object containing the issue UUID and opposed flag
 */
const onCastVoteEvent = (event: { issueUuid: string, opposed: boolean }) => {
    castVote(event.issueUuid, event.opposed);
}


/**
 * Form for submitting the vote using inertia
 */

const form = useForm({
    name: "",
    remainingCredits: -1,
    numberOfVotes: -1,
    creditsSpent: -1,
    votingRoundUuid: "",
    //@ts-ignore
    castedVotes: [] as VotingTypes.IssueVote[],
})

/**
 * Submit the vote to the server
 */
const submitVote = () => {

    if (remainingCredits.value > 0) {
        if (!confirm("Are you sure you want to submit, you still have voting power left.")) {
            return;
        }

    }
    else {
        if (!confirm("Are you sure you want to submit your vote?")) {
            return;
        }
    }

    form.name = participant.value.name ?? "";
    form.remainingCredits = remainingCredits.value;
    form.creditsSpent = participant.value.castedVotes.reduce((acc, curr) => acc + curr.creditsSpent, 0);
    form.votingRoundUuid = votingRound.value.uuid;
    form.castedVotes = participant.value.castedVotes;

    form.post(route('vote.store'));

}

</script>


<template>
    <Head title="Vote" />

    <FrontLayout>
        <template v-if="votingRound.locked">
            <div class="election-locked">
                <h1>Voting round closed</h1>
                <p>This voting round is closed. You can no longer vote.</p>
                <p>If you think this is an error, please contact the organizer.</p>
            </div>
        </template>
        <template v-else>
            <Transition name="swipe" mode="out-in">
                <div v-if="!onboardingCompleted" >
                    <section class="page-section homepage">
                    <ExplainationText />
                    <button @click="onboardingCompleted = true">Get started!</button>
                </section>
                </div>

                <div v-else>
                    <!-- If you want to show the issues before voting, uncomment this -->
                    <!-- <section class="page-section issues-section">
                        <article class="ballot-issues">
                            <BallotIssues :votingRound="votingRound" />
                        </article>
                    </section> -->
                    <br/><br/> 
                    <div class="vote-container-wrapper">
                        <div class="vote-container">
                            <header>
                                <h1>{{ votingRound.name }}</h1>
                                <p v-if="votingRound.description">{{ votingRound.description }}</p>
                            </header>
                            <div class="influence-pool">
                                <CreditsVisualizer :votes="0" :credits="remainingCredits"
                                    :maxCredits="votingRound.credits" :isPool="true" />
                            </div>
                            <IssueCards :votingRound="votingRound" :participant="participant"
                                @cast-vote="onCastVoteEvent" />
                        </div>
                    </div>

                    <section class="submit-vote-section">
                        <button @click="submitVote">Submit</button>
                    </section>
                </div>
            </Transition>
            <div class="no-credits-toast" :class="{ visible: noCreditsToast }">
                <p>You don't have enough voting power left to cast this vote.</p>
            </div>
            <div class="help-section" @click="onboardingCompleted = false" v-if="onboardingCompleted">
                <SvgIcon :size="26" type="mdi" :path="mdiHelpCircleOutline" />
            </div>
        </template>
    </FrontLayout>
</template>