<script setup lang="ts">
import * as VotingTypes from '@/types/voting-types';

const props = defineProps<{
    participant: VotingTypes.Participant;
    votingRound: VotingTypes.VotingRound;
    issues: VotingTypes.Issue[];
}>();

</script>


<template>

    <div class="data-overview">
        <h2>Data Overview</h2>
        <div class="data-overview-content">
            <h3>{{ props.votingRound.name }}</h3>
            <p>Credits: {{ props.votingRound.credits }}</p>
            <p>Number of Issues: {{ props.issues.length }}</p>

            <div class="data-issues" v-for="(issue, index) in issues" :key="index">

                <div class="issue">
                    <strong>{{ issue.text }} [{{ participant?.castedVotes?.find(vote => vote.issueUuid ===
                        issue.uuid)?.numberOfVotes || 0 }} Votes] [{{ participant?.castedVotes?.find(vote =>
                            vote.issueUuid === issue.uuid)?.creditsSpent || 0 }} Credits]</strong>

                    <progress
                        :value="participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.creditsSpent || 0"
                        :max="votingRound.credits"
                        :class="{ negative: (participant?.castedVotes?.find(vote => vote.issueUuid === issue.uuid)?.numberOfVotes || 0) < 0 }"></progress>



                </div>

            </div>

        </div>


    <br><br>


<pre>{{ participant }}</pre>
    </div>

</template>