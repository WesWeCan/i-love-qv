<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as d3 from 'd3';
import type { RepoD3Node, RepoD3Link } from '@/types/RepoD3Types';
import GraphNode from '@/Components/GraphNode.vue';
import Wallpaper from './Wallpaper.vue';

const props = defineProps<{
  width?: number;
  height?: number;
  initialNodes?: RepoD3Node[];
  initialLinks?: RepoD3Link[];
}>();

const emit = defineEmits<{
  (e: 'nodeClick', node: RepoD3Node): void;
}>();

const containerRef = ref<HTMLElement>();
const nodes = ref<RepoD3Node[]>(props.initialNodes || []);
const links = ref<RepoD3Link[]>([]);
const simulation = ref<d3.Simulation<RepoD3Node, RepoD3Link>>();
const transform = ref<d3.ZoomTransform>(d3.zoomIdentity);
const isSimulationActive = ref(true);
const stopSimulationAutomatically = ref(true);

const getNodeStyle = (node: RepoD3Node) => ({
  position: 'absolute',
  left: `${(node.x || 0) * transform.value.k + transform.value.x}px`,
  top: `${(node.y || 0) * transform.value.k + transform.value.y}px`,
  transform: `translate(-50%, -50%) scale(${transform.value.k})`
});

const handleNodeClick = (node: RepoD3Node) => {
  emit('nodeClick', node);
};

const dragStarted = (event: d3.D3DragEvent<HTMLElement, RepoD3Node, any>) => {
  const node = event.subject;
  if (!event.active && simulation.value) simulation.value.alphaTarget(0.3).restart();
  node.fx = node.x;
  node.fy = node.y;
};

const dragged = (event: d3.D3DragEvent<HTMLElement, RepoD3Node, any>) => {
  const node = event.subject;
  node.fx = event.x;
  node.fy = event.y;
};

const dragEnded = (event: d3.D3DragEvent<HTMLElement, RepoD3Node, any>) => {
  const node = event.subject;
  if (!event.active && simulation.value) simulation.value.alphaTarget(0);
  node.fx = null;
  node.fy = null;
};

const initDrag = async () => {
  await nextTick();
  if (!containerRef.value) return;
  
  const drag = d3.drag<HTMLElement, RepoD3Node>()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);

  d3.select(containerRef.value)
    .selectAll('.graph-node')
    .data(nodes.value)
    .call(drag);
};

const initZoom = () => {
  if (!containerRef.value) return;
  
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      transform.value = event.transform;
    });

  d3.select(containerRef.value)
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity);
};

const initSimulation = () => {
  if (!containerRef.value) return;

  const width = props.width || containerRef.value.clientWidth;
  const height = props.height || containerRef.value.clientHeight;

  // Initialize nodes with random positions
  nodes.value.forEach(node => {
    node.x = Math.random() * width;
    node.y = Math.random() * height;
  });

  // get the bucket
  const bucket = d3.select(containerRef.value).select('[data-bucket="1"]');

  simulation.value = d3.forceSimulation<RepoD3Node>(nodes.value)
    .force('charge', d3.forceManyBody()
      .strength(-10)
      .distanceMax(10))
    .force('collide', d3.forceCollide().radius(5))
    .force('x', d3.forceX(width / 2).strength(0.1))
    .force('y', d3.forceY(height / 2).strength(0.1))
    .alphaTarget(0)
    .alphaDecay(0.02)
    .on('tick', () => {
      if (isSimulationActive.value) {
        nodes.value = [...nodes.value];
      }
    })
    .on('end', () => {
      if (stopSimulationAutomatically.value) {
        console.log('end');
        isSimulationActive.value = false;
        
        simulation.value?.stop();
      }
    });
};

const updateData = (newNodes: RepoD3Node[]) => {
  nodes.value = newNodes;
  
  if (simulation.value) {
    simulation.value.nodes(nodes.value);
    simulation.value.alpha(1).restart();
  }
  
  initDrag();
};

const toggleSimulation = (active: boolean) => {
  isSimulationActive.value = active;
  if (simulation.value) {
    if (active) {
      simulation.value.restart();
    } else {
      simulation.value.stop();
    }
  }
};

onMounted(async () => {

  // alter each node just a little so nothing only starts at 0,0
  

    await initZoom();    
    await initSimulation();
    await initDrag();

   

});

onUnmounted(() => {
  isSimulationActive.value = false;
  if (simulation.value) {
    simulation.value.stop();
  }
});

watch(nodes, (newNodes) => {
  // Update the positions immediately when they change
}, { deep: true });

defineExpose({
  updateData,
  toggleSimulation,
  stopSimulationAutomatically
});
</script>

<template>
    <div class="force-graph-container" ref="containerRef">
      <GraphNode v-for="node in nodes"
                 :key="node.id"
                 :node="node"
                 :transform="transform"
                 @node-click="handleNodeClick" />

        <div class="bucket" data-bucket="1">
          X
        </div>
    </div>
</template>
  
<style scoped>
.force-graph-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: hidden;
}

.bucket {
  position: absolute;
  top: 50px;
  left: 50px;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
}
</style>