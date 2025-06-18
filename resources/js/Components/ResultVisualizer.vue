<script lang="ts" setup>
import * as VotingTypes from '@/types/voting-types';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import VotesVisualizer from './VotesVisualizer.vue';
import * as d3 from 'd3';

const props = defineProps<{
    participants: VotingTypes.Participant[];
    votingRound: VotingTypes.VotingRound;
}>();

const containerRef = ref<HTMLElement>();
const simulation = ref<d3.Simulation<IssueResult, any>>();
const nodes = ref<IssueResult[]>([]);
const isLineMode = ref(false);

interface IssueResult {
    issue: VotingTypes.Issue;
    totalCredits: number;
    netVotes: number;
    grossVotes: number;
    votes: VotingTypes.IssueVote[];
    isInFavor: boolean;
    votePercentage: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
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
        
        const result: IssueResult = {
            issue,
            totalCredits,
            netVotes,
            grossVotes,
            votes,
            isInFavor: netVotes > 0,
            votePercentage: 0
        };
        return result;
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

const getNodeRadius = (node: IssueResult) => Math.max(35, (node.votePercentage * 40) + 25);

const getSortedNodes = () => {
    const sortedPositive = nodes.value
        .filter(n => n.netVotes > 0)
        .sort((a, b) => b.netVotes - a.netVotes);
    const sortedNegative = nodes.value
        .filter(n => n.netVotes < 0)
        .sort((a, b) => b.netVotes - a.netVotes); // Changed to sort by absolute value
    const neutral = nodes.value.filter(n => n.netVotes === 0);
    return { sortedPositive, sortedNegative, neutral };
};

const updateSimulation = () => {
    if (!containerRef.value || !simulation.value) return;
    
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    
    const currentNodes = nodes.value;
    const newResults = results.value.issues;
    
    nodes.value = newResults.map(result => {
        const existingNode = currentNodes.find(n => n.issue.uuid === result.issue.uuid);
        return {
            ...result,
            x: existingNode?.x ?? width / 2,
            y: existingNode?.y ?? height / 2
        };
    });

    const forceX = isLineMode.value ? 
        d3.forceX<IssueResult>().x(d => {
            const { sortedPositive, sortedNegative, neutral } = getSortedNodes();
            const allNodes = [...sortedPositive, ...neutral, ...sortedNegative];
            const index = allNodes.indexOf(d);
            const spacing = width / (allNodes.length + 1);
            return spacing * (index + 1);
        }).strength(1) :
        d3.forceX<IssueResult>().x(d => {
            const { sortedPositive, sortedNegative, neutral } = getSortedNodes();
            const posIndex = sortedPositive.indexOf(d);
            const negIndex = sortedNegative.indexOf(d);
            const neutralIndex = neutral.indexOf(d);
            
            if (posIndex !== -1) return (width * 0.25) + (posIndex * width * 0.1);
            if (negIndex !== -1) return (width * 0.75) - (negIndex * width * 0.1);
            if (neutralIndex !== -1) return width / 2;
            return width / 2;
        }).strength(0.8);

    const forceY = isLineMode.value ?
        d3.forceY<IssueResult>().y(height / 2).strength(1) :
        d3.forceY<IssueResult>().y(d => {
            if (d.netVotes === 0) return height / 2;
            return height / 2 + (d.votePercentage * height * 0.3 * (d.netVotes > 0 ? -1 : 1));
        }).strength(0.5);

    simulation.value
        .nodes(nodes.value)
        .force('charge', d3.forceManyBody().strength(isLineMode.value ? -50 : -200))
        .force('collide', d3.forceCollide<IssueResult>().radius(d => getNodeRadius(d) * 1.2).strength(1))
        .force('x', forceX)
        .force('y', forceY)
        .alpha(0.5)
        .restart();
};

const initializeSimulation = () => {
    if (!containerRef.value) return;
    
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    
    nodes.value = results.value.issues.map(issue => ({
        ...issue,
        x: width / 2,
        y: height / 2
    }));

    if (simulation.value) simulation.value.stop();

    simulation.value = d3.forceSimulation<IssueResult>(nodes.value)
        .on('tick', () => {
            nodes.value.forEach(node => {
                if (node.x !== undefined) {
                    node.x = Math.max(getNodeRadius(node), Math.min(width - getNodeRadius(node), node.x));
                }
                if (node.y !== undefined) {
                    node.y = Math.max(getNodeRadius(node), Math.min(height - getNodeRadius(node), node.y));
                }
            });
            nodes.value = [...nodes.value];
        });
    
    updateSimulation();
};

const toggleMode = () => {
    isLineMode.value = !isLineMode.value;
    updateSimulation();
};

onMounted(() => {
    initializeSimulation();
    window.addEventListener('resize', initializeSimulation);
});

onUnmounted(() => {
    if (simulation.value) {
        simulation.value.stop();
    }
    window.removeEventListener('resize', initializeSimulation);
});

watch(() => results.value, updateSimulation, { deep: true });

const getNodeZIndex = (node: IssueResult) => {
    const { sortedPositive, sortedNegative, neutral } = getSortedNodes();
    const allNodes = [...sortedPositive, ...neutral, ...sortedNegative];
    return allNodes.length - allNodes.indexOf(node);
};
</script>

<template>
    <div class="visualizer-container">
        <button class="mode-toggle" @click="toggleMode">
            {{ isLineMode ? 'Switch to Messy Mode' : 'Switch to Line Mode' }}
        </button>
        <div class="result-visualizer" ref="containerRef">
            <div v-for="node in nodes" 
                 :key="node.issue.uuid"
                 class="result" 
                 :class="{ 'neutral': node.netVotes === 0, 'positive': node.netVotes > 0, 'negative': node.netVotes < 0 }"
                 :style="{ 
                     position: 'absolute',
                     left: `${node.x}px`,
                     top: `${node.y}px`,
                     transform: `translate(-50%, -50%) scale(${0.5 + (node.votePercentage * .5)})`,
                     zIndex: getNodeZIndex(node)
                 }">
                <div class="emoji">
                    <!-- {{ node.issue.emoji }} -->
                </div>
                <div class="tooltip">
                    <div class="tooltip-title">{{ node.issue.text }}</div>
                    <div class="tooltip-votes">Votes: {{ node.netVotes }}</div>
                    <div class="tooltip-percentage">{{ Math.round(node.votePercentage * 100) }}% of total votes</div>
                </div>
            </div>
        </div>
    </div>
</template>

