<script setup lang="ts">

import ResultVisualizer from '@/Components/ResultVisualizer.vue';
import FrontLayout from '@/Layouts/FrontLayout.vue';
import * as VotingTypes from '@/types/voting-types';
import { usePage } from '@inertiajs/vue3';
import { compute } from 'three/tsl';
import { onMounted, ref, computed } from 'vue';

/**
 * Calculates how close the voting is to a 50–50 split between "for" and "against."
 *
 * @param {number} forVotes     - The total "for" votes (expected to be >= 0).
 * @param {number} againstVotes - The total "against" votes (can be 0 or negative).
 * @returns {number} A value between 0 and 1, where
 *   0 means not polarized (100% vs. 0%),
 *   1 means perfectly split (50% vs. 50%).
 */
 function calculatePolarizationIndex(forVotes : number, againstVotes : number) {
  // Convert negative against votes to positive for calculations
  const absAgainst = Math.abs(againstVotes);
  
  // Calculate total votes
  const total = forVotes + absAgainst;

  // If no votes at all, return 0 (no polarization)
  if (total === 0) {
    return 0;
  }

  // Calculate percentages for logging
  const forPercentage = (forVotes / total) * 100;
  const againstPercentage = (absAgainst / total) * 100;
  
  // Log the distribution for debugging
  console.log(`Distribution: ${forPercentage.toFixed(1)}% for / ${againstPercentage.toFixed(1)}% against`);

  // Calculate proportion of "for" votes (between 0 and 1)
  const p = forVotes / total;
  
  // Calculate how far the proportion is from 0.5 (perfect 50-50 split)
  const distanceFromFifty = Math.abs(p - 0.5);
  
  // Convert distance to polarization index (0.5 is max distance, so divide by 0.5)
  // Subtract from 1 to invert (so 1 means perfect split, 0 means no split)
  let index = 1 - (distanceFromFifty / 0.5);
  
  // Ensure result is between 0 and 1
  index = Math.max(0, Math.min(index, 1));

  return index;
}


const page = usePage();

onMounted(() => {

    console.table([
        { input: '15, -15', polarization: calculatePolarizationIndex(15, -15) },
        { input: '14, -16', polarization: calculatePolarizationIndex(14, -16) },
        { input: '13, -17', polarization: calculatePolarizationIndex(13, -17) },
        { input: '45, -55', polarization: calculatePolarizationIndex(45, -55) },
        { input: '55, 45', polarization: calculatePolarizationIndex(55, 45)    },
        { input: '48, -52', polarization: calculatePolarizationIndex(48, -52)  },
        { input: '5, 30', polarization: calculatePolarizationIndex(5, 30)    },
        { input: '0, 0', polarization: calculatePolarizationIndex(0, 0) }
    ]);

});


const rawResults = computed(() => {

  if (!page.props.election) {
    return null;
  }

    const issues = page.props.election?.issues?.map(issue => {
        
      const votes = page.props.election?.participants?.flatMap(p => 
            p.castedVotes.filter(v => v.issueUuid === issue.uuid)
        ) ?? [];
        
        const totalCredits = votes.reduce((sum, v) => sum + v.creditsSpent, 0);
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

    return issues.sort((a, b) => Math.abs(b.netVotes) - Math.abs(a.netVotes));
});



const badgeResults = computed(() => {
    if (!rawResults.value) return [];

    const maxCredits = Math.max(...rawResults.value.map(i => i.totalCredits));

    return rawResults.value.map(issue => {
        const positiveVotes = issue.votes.filter(v => v.numberOfVotes > 0);
        const negativeVotes = issue.votes.filter(v => v.numberOfVotes < 0);
        const polarization = issue.grossVotes > 0 ? Math.abs(issue.netVotes) / issue.grossVotes : 0;

        const categories = [];

        if (positiveVotes.length > 0 && negativeVotes.length === 0) {
            categories.push("✅ No-Brainer (In Favor)");
        }
        if (negativeVotes.length > 0 && positiveVotes.length === 0) {
            categories.push("❌ No-Brainer (Opposed)");
        }
        if (polarization > 0.9) {
            categories.push("⚔️ Controversial");
        }
        if (issue.totalCredits === maxCredits) {
            categories.push("🔥 High Traffic");
        }

        return {
            issue: issue.issue,
            netVotes: issue.netVotes,
            categories
        };
    }).sort((a, b) => Math.abs(b.netVotes) - Math.abs(a.netVotes));
});


const textualResults = computed(() => {

  let messages : string[]= [];

  if (!badgeResults.value) return [];

  badgeResults.value.forEach(result => {
      
    let name = `${result.issue.emoji} ${result.issue.text} `;


    if (result.categories.includes("✅ No-Brainer (Support)")) {
        messages.push(`🤯 ${name} is a No-Brainer to be in favor of`);
    }

    if (result.categories.includes("❌ No-Brainer (Opposed)")) {
        messages.push(`🤮 ${name} is a No-Brainer to be opposed to`);
    }

    if (result.categories.includes("🔥 High Traffic")) {
        messages.push(`🔥 ${name} is a high traffic issue`);
    }

    if (result.categories.includes("⚔️ Controversial")) {
        messages.push(`⚔️ ${name} is highly controversial, you should discuss this issue`);
    }

  });


    return messages;
});

</script>

<template>


<FrontLayout v-if="$page.props.election">

    <h1>Election Results</h1>

    <h2>{{ $page.props.election.name }}</h2>
    <span>{{ $page.props.election.description }}</span>

    <div class="text-results">
      <div class="text-result" v-for="message in textualResults" :key="message">
        {{ message.toString() }}
      </div>
    </div>

    <div class="result-container">
        <ResultVisualizer :votingRound="$page.props.election" :participants="$page.props.election.participants!" />
    </div>

</FrontLayout>


<details>
  <summary>Raw Data</summary>
  <pre>{{ $page.props }}</pre>
</details>


</template>