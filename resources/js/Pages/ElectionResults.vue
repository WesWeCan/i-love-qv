<script setup lang="ts">
import ResultVisualizer from '@/Components/ResultVisualizer.vue';
import FrontLayout from '@/Layouts/FrontLayout.vue';
import * as VotingTypes from '@/types/voting-types';
import { Head, usePage } from '@inertiajs/vue3';
import { onMounted, ref, computed } from 'vue';

import brain from '@/Assets/img/brain.png';
import collision from '@/Assets/img/collision.png';
import traffic from '@/Assets/img/vertical-traffic-light.png';
import heart_gold from '@/Assets/img/heart_gold.png';
import heart_cyan from '@/Assets/img/heart_cyan.png';
import heart_purple from '@/Assets/img/heart_purple.png';


const page = usePage();
const showTextResults = ref(false);

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


const examplePolarization = () => {
  console.table([
    { input: '15, -15', polarization: calculatePolarizationIndex(15, -15) }, // 1
    { input: '14, -16', polarization: calculatePolarizationIndex(14, -16) }, // 0.9333333333333333
    { input: '13, -17', polarization: calculatePolarizationIndex(13, -17) }, // 0.8666666666666667
    { input: '45, -55', polarization: calculatePolarizationIndex(45, -55) }, // 0.9
    { input: '55, 45', polarization: calculatePolarizationIndex(55, 45) }, // 0.8999999999999999
    { input: '48, -52', polarization: calculatePolarizationIndex(48, -52) }, // 0.96
    { input: '5, 30', polarization: calculatePolarizationIndex(5, 30) }, // 0.2857142857142857
    { input: '0, 0', polarization: calculatePolarizationIndex(0, 0) } // 0
  ]);
}


onMounted(() => {
  // examplePolarization();
});

/**
 * Computed property for the raw results
 * @returns {VotingTypes.Issue[] | null} The raw results
 */
const rawResults = computed(() => {
  // Return null if no election data is available
  if (!page.props.election) {
    return null;
  }

  const issues = page.props.election?.issues?.map(issue => {
    // Get all votes for this specific issue from all participants
    const votes = page.props.election?.participants?.flatMap(p =>
      p.castedVotes.filter(v => v.issueUuid === issue.uuid)
    ) ?? [];

    // Calculate vote statistics
    const totalCredits = votes.reduce((sum, v) => sum + v.creditsSpent, 0);
    const netVotes = votes.reduce((sum, v) => sum + v.numberOfVotes, 0); // Positive = for, negative = against
    const grossVotes = votes.reduce((sum, v) => sum + Math.abs(v.numberOfVotes), 0); // Total vote magnitude

    return {
      issue,
      totalCredits,
      netVotes,
      grossVotes,
      votes,
      isInFavor: netVotes > 0 // True if net votes are positive (more for than against)
    };
  });

  // Sort issues by net votes in descending order (highest net votes first)
  return issues.sort((a, b) => b.netVotes - a.netVotes);
});


/**
 * Computed property for the badge results
 * @returns {VotingTypes.Issue[] | null} The badge results
 */
const badgeResults = computed(() => {
  const polarizationThreshold = 0.9; // more than 90% difference in one direction

  // Return empty array if no raw results available
  if (!rawResults.value) return [];

  // Find the issue with the highest total credits spent
  const maxCredits = Math.max(...rawResults.value.map(i => i.totalCredits));

  return rawResults.value.map(issue => {
    // Separate votes into positive (for) and negative (against) votes
    const positiveVotes = issue.votes.filter(v => v.numberOfVotes > 0);
    const negativeVotes = issue.votes.filter(v => v.numberOfVotes < 0);

    // Calculate polarization: how strongly people feel about this issue
    // Higher values mean more agreement (either strongly for or strongly against)
    const polarization = issue.grossVotes > 0 ? Math.abs(issue.netVotes) / issue.grossVotes : 0;

    const categories: IssueCategory[] = [];

    // Check if everyone voted in favor (no negative votes)
    if (positiveVotes.length > 0 && negativeVotes.length === 0) {
      categories.push(IssueCategory.NO_BRAINER_FAVOR);
    }

    // Check if everyone voted against (no positive votes)
    if (negativeVotes.length > 0 && positiveVotes.length === 0) {
      categories.push(IssueCategory.NO_BRAINER_OPPOSED);
    }

    // Check if issue is highly polarized
    if (polarization > polarizationThreshold) {
      categories.push(IssueCategory.CONTROVERSIAL);
    }

    // Check if this issue received the most voting activity
    if (issue.totalCredits === maxCredits) {
      categories.push(IssueCategory.HIGH_TRAFFIC);
    }

    return {
      issue: issue.issue,
      netVotes: issue.netVotes,
      categories
    };
  }).sort((a, b) => Math.abs(b.netVotes) - Math.abs(a.netVotes)); // Sort by vote magnitude (highest first)
});



/**
 * Computed property for the textual results
 * @returns {string[]} The textual results
 */
const textualResults = computed(() => {

  let messages: string[] = [];

  if (!badgeResults.value) return [];

  let rankingString = '';

  badgeResults.value.forEach((result, index) => {
    let name = `${result.issue.text} `;
    if (index === 0) {
      rankingString += `'${name}' is ranked #${index + 1}, followed by `;
    }
    else {
      if (index === badgeResults.value.length - 1) {
        rankingString += `'${name}'.`;
      }
      else {
        rankingString += `'${name}',`;
      }
    }
  });

  messages.push(rankingString);

  badgeResults.value.forEach((result, index) => {

    let name = `${result.issue.text} `;

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

</script>

<template>

  <Head title="Results" />

  <FrontLayout v-if="$page.props.election">
    <template v-if="!$page.props.election.locked">
      <div class="election-locked">
        <h1>The voting round is still going on,</h1>
        <p>Check in later to view results:</p><br />
        <p><a :href="route('election.results', $page.props.election.uuid)">{{ route('election.results',
          $page.props.election.uuid) }}</a></p>
        <p>You can also manage the election from this page.</p>
        <br />
        <p>If you think this is an error, please contact the host.</p>
      </div>
    </template>

    <template v-else>
      <section class="page-section results-page">
        <article>
          <h2>{{ $page.props.election.name }}</h2>
          <img :src="heart_purple" alt="Heart" class="heart-icon" />
        </article>
        <div class="election-results-container" v-if="!showTextResults">
          <div v-if="rawResults && rawResults.length > 0" class="results-list">
            <div v-for="result in rawResults" :key="result.issue.uuid" class="result-item">
              <div class="icons">
                <div class="icon" v-if="result.totalCredits === Math.max(...rawResults.map(i => i.totalCredits))">
                  <Popper hover placement="top" content="High Traffic">
                    <img :src="traffic" alt="Traffic" class="traffic-icon" />
                  </Popper>
                  <!-- 🔥 High Traffic -->
                </div>
                <div class="icon" v-if="Math.abs(result.netVotes) / result.grossVotes > 0.9 && result.grossVotes > 0">
                  <Popper hover placement="top" content="Controversial">
                    <img :src="collision" alt="Collision" class="collision-icon" />
                  </Popper>
                  <!-- ⚔️ Controversial -->
                </div>
                <div class="icon"
                  v-if="result.votes.filter(v => v.numberOfVotes > 0).length > 0 && result.votes.filter(v => v.numberOfVotes < 0).length === 0">
                  <Popper hover placement="top" content="No-Brainer (Everyone in Favor)">
                    <img :src="brain" alt="Brain" class="brain-icon" />
                  </Popper>
                  <!-- ✅ No-Brainer (Everyone in Favor) -->
                </div>
                <div class="icon"
                  v-if="result.votes.filter(v => v.numberOfVotes < 0).length > 0 && result.votes.filter(v => v.numberOfVotes > 0).length === 0">
                  <Popper hover placement="top" content="No-Brainer (Everyone Opposed)">
                    <img :src="brain" alt="Brain" class="brain-icon" />
                  </Popper>
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
          {{ showTextResults ? 'Show as list' : 'Show as text' }}
        </button>

        <!-- If you want to show the experimental results as a visualizer, uncomment this -->
        <!-- <div class="result-container">
        <ResultVisualizer :votingRound="$page.props.election" :participants="$page.props.election.participants!" />
    </div> -->
      </section>
    </template>
  </FrontLayout>
</template>
