<script setup lang="ts">

import * as VotingTypes from '@/types/voting-types';

const props = defineProps<{
    votingRound: VotingTypes.VotingRound;
}>();

</script>

<template>



        <h2>Issues to vote on</h2>
        <article class="ballot-issue" v-for="issue in votingRound.issues" :key="issue.uuid">

            <h3>{{ issue.text }}</h3>

            <span>{{ issue.description ?? 'No description' }}</span>
        </article>

</template>


<style scoped>

.ballot-issue {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* width: 100%; */
}
</style>

