<script setup lang="ts">

    import RepoD3 from '@/Components/RepoD3.vue';
    import type { RepoD3Node, RepoD3Link } from '@/types/RepoD3Types';
    import { usePage } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';

    const page = usePage();


    const nodes = ref<RepoD3Node[]>([]);


    onMounted(() => {
        // create 100 nodes with initial positions
        for (let i = 0; i < 1000; i++) {
            nodes.value.push({
                id: i.toString(),
                name: `Credit ${i}`,
                color: '#000000',
                particleData: {},
               
            });
        }
    });



</script>


<template>
    

    <div class="graph-wrapper">
        <RepoD3 :initialNodes="nodes"></RepoD3>
    </div>
    
<!-- 
    <pre>
        {{ $page.props.auth }}
    </pre>
    <pre>
        {{ $page.props.particles }}
    </pre> -->

 


</template>

<style >


.graph-wrapper {
    height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#app {
    min-height: 100svh;
    font-family: 'Montserrat', sans-serif;
}


body {
    background-color: gray;
}

</style>