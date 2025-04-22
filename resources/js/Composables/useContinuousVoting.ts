import { ref } from 'vue';

/**
 * Composable for handling continuous voting functionality
 * @param emit - The emit function to cast votes
 * @returns Methods for controlling continuous voting
 */
export function useContinuousVoting(emit: Function) {
  // Store active voting intervals for each issue
  const intervals: { [key: string]: number } = {};
  // Duration between vote casts in milliseconds
  const intervalDuration = 150;
  
  /**
   * Start continuous voting on an issue while pointer/mouse is held down
   * @param issueUuid - Issue to vote on
   * @param opposed - Direction of vote
   */
  const startVoting = (issueUuid: string, opposed: boolean) => {
    // Cast an immediate vote
    emitVote(issueUuid, opposed);
    // Set interval for continuous voting
    intervals[issueUuid] = setInterval(() => emitVote(issueUuid, opposed), intervalDuration);
    return issueUuid;
  };
  
  /**
   * Stop continuous voting when pointer/mouse is released
   * @param issueUuid - Issue to stop voting on
   */
  const stopVoting = (issueUuid: string) => {
    clearInterval(intervals[issueUuid]);
    delete intervals[issueUuid];
  };
  
  /**
   * Emit a vote event
   * @param issueUuid - Issue to vote on
   * @param opposed - Direction of vote
   */
  const emitVote = (issueUuid: string, opposed: boolean) => {
    emit('cast-vote', { issueUuid, opposed });
  };
  
  return {
    startVoting,
    stopVoting,
    emitVote,
    intervalDuration
  };
} 