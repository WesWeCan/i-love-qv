<script setup lang="ts">

import * as VotingTypes from '@/types/voting-types';
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



</script>

<template>


</template>