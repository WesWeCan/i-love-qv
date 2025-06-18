<script setup lang="ts">

import ResultVisualizer from '@/Components/ResultVisualizer.vue';
import FrontLayout from '@/Layouts/FrontLayout.vue';
import * as VotingTypes from '@/types/voting-types';
import { usePage } from '@inertiajs/vue3';
import { compute } from 'three/tsl';
import { onMounted, ref, computed } from 'vue';

import brain from '@/assets/img/brain.png';
import collision from '@/assets/img/collision.png';
import traffic from '@/assets/img/vertical-traffic-light.png';
import heart_gold from '@/assets/img/heart_gold.png';
import heart_cyan from '@/assets/img/heart_cyan.png';
import heart_purple from '@/assets/img/heart_purple.png';


// Enum for issue categories
enum IssueCategory {
  NO_BRAINER_FAVOR = "✅ No-Brainer (In Favor)",
  NO_BRAINER_OPPOSED = "❌ No-Brainer (Opposed)",
  CONTROVERSIAL = "⚔️ Controversial",
  HIGH_TRAFFIC = "🔥 High Traffic"
}

/**
 * Calculates how close the voting is to a 50–50 split between "for" and "against."
 *
 * @param {number} forVotes     - The total "for" votes (expected to be >= 0).
 * @param {number} againstVotes - The total "against" votes (can be 0 or negative).
 * @returns {number} A value between 0 and 1, where
 *   0 means not polarized (100% vs. 0%),
 *   1 means perfectly split (50% vs. 50%).
 */
function calculatePolarizationIndex(forVotes: number, againstVotes: number) {
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
    { input: '55, 45', polarization: calculatePolarizationIndex(55, 45) },
    { input: '48, -52', polarization: calculatePolarizationIndex(48, -52) },
    { input: '5, 30', polarization: calculatePolarizationIndex(5, 30) },
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

  return issues.sort((a, b) => b.netVotes - a.netVotes);
});



const badgeResults = computed(() => {
  if (!rawResults.value) return [];

  const maxCredits = Math.max(...rawResults.value.map(i => i.totalCredits));

  return rawResults.value.map(issue => {
    const positiveVotes = issue.votes.filter(v => v.numberOfVotes > 0);
    const negativeVotes = issue.votes.filter(v => v.numberOfVotes < 0);
    const polarization = issue.grossVotes > 0 ? Math.abs(issue.netVotes) / issue.grossVotes : 0;

    const categories: IssueCategory[] = [];

    if (positiveVotes.length > 0 && negativeVotes.length === 0) {
      categories.push(IssueCategory.NO_BRAINER_FAVOR);
    }
    if (negativeVotes.length > 0 && positiveVotes.length === 0) {
      categories.push(IssueCategory.NO_BRAINER_OPPOSED);
    }
    if (polarization > 0.9) {
      categories.push(IssueCategory.CONTROVERSIAL);
    }
    if (issue.totalCredits === maxCredits) {
      categories.push(IssueCategory.HIGH_TRAFFIC); // is actually the highest traffic issue
    }

    return {
      issue: issue.issue,
      netVotes: issue.netVotes,
      categories
    };
  }).sort((a, b) => Math.abs(b.netVotes) - Math.abs(a.netVotes));
});


const textualResults = computed(() => {

  let messages: string[] = [];




  if (!badgeResults.value) return [];

  badgeResults.value.forEach((result, index) => {

    let name = `${result.issue.text} `;


     messages.push(`'${name}' is ranked #${index + 1}.`);


    if (result.categories.includes(IssueCategory.NO_BRAINER_FAVOR)) {
      messages.push(`Everyone voted in favor of '${name}'. Making it a no-brainer to be in favor of.`);
    }

    if (result.categories.includes(IssueCategory.NO_BRAINER_OPPOSED)) {
      messages.push(`Everyone voted against '${name}'. Making it a no-brainer to be opposed to.`);
    }

    if (result.categories.includes(IssueCategory.HIGH_TRAFFIC)) {
      messages.push(`'${name}' attracted a lot of traffic! You might want to look into what is happening here.`);
    }

    if (result.categories.includes(IssueCategory.CONTROVERSIAL)) {
      messages.push(`'${name}' could be read as a polarizing result. The issue might need more discussion.`);
    }

  });


  return messages;
});



const showTextResults = ref(false);


</script>

<template>


  <FrontLayout v-if="$page.props.election">

    <section class="page-section results-page">

    <h1>Voting Results</h1>

    <img :src="heart_purple" alt="Heart" class="heart-icon" />
    <h2>{{ $page.props.election.name }}</h2>



    <div class="election-results-container" v-if="!showTextResults">
  
      <div v-if="rawResults && rawResults.length > 0" class="results-list">
        <div v-for="result in rawResults" :key="result.issue.uuid" class="result-item">

          <div class="icons">
            
            <div class="icon" v-if="result.totalCredits === Math.max(...rawResults.map(i => i.totalCredits))">
              <img :src="traffic" alt="Traffic" class="traffic-icon" />
              <!-- 🔥 High Traffic -->
            </div>
            <div class="icon" v-if="Math.abs(result.netVotes) / result.grossVotes > 0.9 && result.grossVotes > 0">
              <img :src="collision" alt="Collision" class="collision-icon" />
              <!-- ⚔️ Controversial -->
            </div>


            <div class="icon" v-if="result.votes.filter(v => v.numberOfVotes > 0).length > 0 && result.votes.filter(v => v.numberOfVotes < 0).length === 0"
              >
              <img :src="brain" alt="Brain" class="brain-icon" />
              <!-- ✅ No-Brainer (Everyone in Favor) -->
            </div>

            <div class="icon" v-if="result.votes.filter(v => v.numberOfVotes < 0).length > 0 && result.votes.filter(v => v.numberOfVotes > 0).length === 0"
              >
              <img :src="brain" alt="Brain" class="brain-icon" />
              <!-- ❌ No-Brainer (Everyone Opposed) -->
            </div>


            <div class="icon" v-if="
              result.totalCredits !== Math.max(...rawResults.map(i => i.totalCredits)) &&
              !(Math.abs(result.netVotes) / result.grossVotes > 0.9 && result.grossVotes > 0) &&
              !(result.votes.filter(v => v.numberOfVotes > 0).length > 0 && result.votes.filter(v => v.numberOfVotes < 0).length === 0) &&
              !(result.votes.filter(v => v.numberOfVotes < 0).length > 0 && result.votes.filter(v => v.numberOfVotes > 0).length === 0)
            ">
              <img :src="heart_gold" alt="Heart" class="heart-icon" />
            </div>
          </div>

          <h3>{{ result.issue.text }}</h3>
          
        </div>


      </div>

    </div>



    <div class="text-results" v-else>
      <div class="text-result" v-for="message in textualResults" :key="message">
        {{ message.toString() }}
      </div>
    </div>


    <button @click="showTextResults = !showTextResults">
      {{ showTextResults ? 'Show badges' : 'Show as text' }}
    </button>

    <!-- <div class="result-container">
        <ResultVisualizer :votingRound="$page.props.election" :participants="$page.props.election.participants!" />
    </div> -->
  </section>
  </FrontLayout>


  <details>
    <summary>Raw Data (Will be removed in production)</summary>
    <pre>{{ $page.props }}</pre>
  </details>


</template>

