<script lang="ts" setup>
import type { RepoD3Node } from '@/types/RepoD3Types';
import { onMounted } from 'vue';

const props = defineProps<{
    node: RepoD3Node;
    transform: {
        k: number;
        x: number;
        y: number;
    };
}>();

const emit = defineEmits<{
    (e: 'nodeClick', node: RepoD3Node): void;
}>();



const getNodeStyle = (): {
    position: 'absolute';
    left: string;
    top: string;
    transform: string;
    backgroundColor: string;
} => ({
    position: 'absolute',
    left: `${(props.node.x || 0) * props.transform.k + props.transform.x}px`,
    top: `${(props.node.y || 0) * props.transform.k + props.transform.y}px`,
    transform: `translate(-50%, -50%) scale(${props.transform.k})`,
    backgroundColor: getColor(props.node)
});

const getColor = (node: RepoD3Node) => {


    if( node.name.includes("Dr.")) {
        return "red";
    }

    if( node.name.includes("Prof.")) {
        return "blue";
    }

    return "white";

}

onMounted(() => {
    console.log(props.node.name)
})

</script>

<template>
        <div class="graph-node"
                 :style="getNodeStyle()"
                 @click="$emit('nodeClick', node)">
                
                <span>{{ node.name }}</span>
        </div>
</template>

<style scoped lang="scss">
.graph-node {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;


    span {
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    }

    &:hover {
        span {
            opacity: 1;
        }
    }
}

</style>