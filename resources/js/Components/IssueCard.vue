<script setup lang="ts">
import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted } from 'vue';
import VotesVisualizer from './VotesVisualizer.vue';
import { useContinuousVoting } from '@/Composables/useContinuousVoting';

import SvgIcon from '@jamescoyle/vue-icon';
import { mdiInformationOutline, mdiRepeat } from '@mdi/js';


const props = defineProps<{
    issue: VotingTypes.Issue;
    participant: VotingTypes.Participant;
    votingRound: VotingTypes.VotingRound;
}>();

const emit = defineEmits(['cast-vote']);

// Use the continuous voting composable
const { startVoting, stopVoting } = useContinuousVoting(emit);

const flipped = ref(false);

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

const castSingleVote = (opposed: boolean) => {
    emit('cast-vote', { issueUuid: props.issue.uuid, opposed });
}

// Expose methods for parent components to use
defineExpose({
    startVoting,
    stopVoting
});
</script>

<template>

    <div class="issue-card"
        :class="{ flipped: flipped, neutral: issueVotingData.numberOfVotes === 0, positive: issueVotingData.numberOfVotes > 0, negative: issueVotingData.numberOfVotes < 0 }">

        <div class="front">
            <div class="issue-card-header">
                <h2>{{ props.issue.text }} </h2>
                <span @click="flipped = !flipped" class="issue-card-emoji flip">
                    <svg-icon :size="26" type="mdi" :path="mdiInformationOutline"></svg-icon>
                </span>
            </div>
            <div class="issue-card-visualizer">
                <VotesVisualizer :votes="issueVotingData.numberOfVotes" :credits="issueVotingData.creditsSpent"
                    :maxCredits="votingRound.credits" :isPool="false" />
            </div>
            <div class="issue-card-footer" v-if="true">
                    <button @click="castSingleVote(true)" 
                            class="vote-button-text vote-button-opposed neutral-opposed"
                            :class="{
                                'reducing-favor': issueVotingData.numberOfVotes > 0,
                                'increasing-opposed': issueVotingData.numberOfVotes < 0,
                                'neutral-opposed': issueVotingData.numberOfVotes === 0
                            }">
                        {{ 
                            issueVotingData.numberOfVotes > 0 ? 'Less in favour' : 
                            issueVotingData.numberOfVotes < 0 ? 'More opposed' : 
                            'Opposed' 
                        }}
                    </button>

                    <button @click="castSingleVote(false)" 
                            class="vote-button-text vote-button-favor neutral-favor"
                            :class="{
                                'reducing-opposed': issueVotingData.numberOfVotes < 0,
                                'increasing-favor': issueVotingData.numberOfVotes > 0,
                                'neutral-favor': issueVotingData.numberOfVotes === 0
                            }">
                        {{ 
                            issueVotingData.numberOfVotes < 0 ? 'Less opposed' : 
                            issueVotingData.numberOfVotes > 0 ? 'More in favour' : 
                            'In favour' 
                        }}
                    </button>   
            </div>
            <!-- <div class="issue-card-footer" v-if="true">
                    <button @click="castSingleVote(true)" 
                            class="vote-button-text vote-button-opposed neutral-opposed"
                           >
                        {{ 
                            'opposed' 
                        }}
                    </button>

                    <button @click="castSingleVote(false)" 
                            class="vote-button-text vote-button-favor neutral-favor"
                            >
                        {{ 
                            'in favour' 
                        }}
                    </button>   
            </div> -->
        </div>

        <div class="back">
            <div class="issue-card-header">
                <h2>{{ props.issue.text }}</h2>
                <span @click="flipped = !flipped" class="issue-card-emoji flip">
                    <svg-icon :size="22" type="mdi" :path="mdiRepeat"></svg-icon>
                </span>
            </div>
            <div class="issue-card-visualizer">
                <template v-if="props.issue.description">
                    {{ props.issue.description }}
                </template>
                <template v-else>
                    <em>No description</em>
                </template>
            </div>
            <div class="issue-card-footer"></div>
        </div>

    </div>


</template>