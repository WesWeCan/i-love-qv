<script lang="ts" setup>
import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted } from 'vue';
import VotesVisualizer from './VotesVisualizer.vue';

const props = defineProps<{
    participants: VotingTypes.Participant[];
    votingRound: VotingTypes.VotingRound;
}>();


interface IssueResult {
    issue: VotingTypes.Issue;
    totalCredits: number;
    netVotes: number;
    grossVotes: number;
    votes: VotingTypes.IssueVote[];
    isInFavor: boolean;
    votePercentage: number;
}

interface ResultOutput {
    issues: IssueResult[];
    totalNetVotes: number;
}

const results = computed<ResultOutput>(() => {
    const issueResults = props.votingRound.issues.map(issue => {
        const votes = props.participants.flatMap(p => 
            p.castedVotes.filter(v => v.issueUuid === issue.uuid)
        );
        
        const totalCredits = votes.reduce((sum, v) => sum + v.creditsSpent, 0);
        const totalVotes = votes.reduce((sum, v) => sum + v.numberOfVotes, 0);
        const netVotes = votes.reduce((sum, v) => sum + v.numberOfVotes, 0);
        const grossVotes = votes.reduce((sum, v) => sum + Math.abs(v.numberOfVotes), 0);
        
        return {
            issue,
            totalCredits,
            netVotes,
            grossVotes,
            votes,
            isInFavor: netVotes > 0
        };
    });

    const totalNetVotes = issueResults.reduce((sum, r) => sum + Math.abs(r.netVotes), 0);

    return {
        issues: issueResults.map(r => ({
            ...r,
            votePercentage: totalNetVotes ? Math.abs(r.netVotes) / totalNetVotes : 0
        })),
        totalNetVotes
    };
});



</script>

<template>

    <div class="result-visualizer">

        <template v-for="result in results.issues">
        
            <div class="result" :class="{ 'neutral' : result.netVotes === 0, 'positive' : result.netVotes > 0, 'negative' : result.netVotes < 0 }">

                <!-- <div class="emoji" :style="{ '--scale': result.votePercentage }">
                    {{ result.issue.emoji }}
                </div> -->
         
            </div>

        </template>
        
    </div>
    <!-- <pre>{{ results }}</pre> -->
    

</template>