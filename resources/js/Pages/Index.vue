<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';

import { onMounted, ref } from 'vue';
import { Link, Head } from '@inertiajs/vue3';
import ILoveQV from '@/Components/ILoveQV.vue';
import ExplainationText from '@/Components/ExplainationText.vue';

onMounted(() => {
    console.log('Index.vue mounted');


});

</script>


<template>

    <Head title="Home" />

    <FrontLayout :hideFooter="true">

        <section class="page-section homepage">
            <ExplainationText />

            <article>
                <Link :href="route('election.create')" as="button">Create voting round 🎉</Link>
            </article>





            <article>
      
                <footer>
                    <span>
                        <p>Design: <a href="https://caradt.nl/researcher/tara-karpinski/">Tara Karpinski</a></p>
                        <p>Creative Technologist: <a href="https://creativetechnologist.nl">Wesley Hartogs</a></p>
                        <p>Source: <a href="https://github.com/WesWeCan/i-love-qv">GitHub</a></p>
                        
                    </span>
                    <ILoveQV />
                </footer>

            </article>
        </section>

    </FrontLayout>

</template>
