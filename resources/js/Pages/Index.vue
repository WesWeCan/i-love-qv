<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';

import { onMounted, ref } from 'vue';
import { Link, Head } from '@inertiajs/vue3';

onMounted(() => {
    console.log('Index.vue mounted');


});

</script>


<template>

    <Head title="Home" />

    <FrontLayout>

        <section class="page-section homepage">
            <article>
                <div class="title">
                    <img src="/img/heart_cyan.png" alt="Heart" class="heart-icon" />
                    <h1>Quadratic Voting</h1>
                </div>
                
                <div class="text-container">
                <p>
                    QV is a clever method for figuring out which issues people care about most. For instance, if the group must decide on how to spend their time on different tasks, QV can gather and organise preferences about which tasks the group wants to prioritise.
                </p>
                <p>
                    Everyone has equal voting power, which you can use to boost the issues you care about most– but you must weigh your decisions carefully. If you go all out on one issue it will cost you more (this is the quadratic formula) and you will have less voting power for the remaining issues on the ballot.
                </p>
                <p>
                    Once all ballots are submitted the collective results are tallied. QV can significantly mitigate the ‘tyranny of the majority’. In other words, situations in which a factional majority can suppress the will of the minority. In this way, it leads to more equitable and just decision making.
                </p>
                </div>
            </article>

            <article>
                <div class="title">
                    <img src="/img/heart_gold.png" alt="Heart" class="heart-icon" />
                    <h2>Creating a Voting Round</h2>
                </div>
                <div class="text-container">
                <p>To create a new voting round, simply click on the 'Create Voting Round' button on the main page. You
                    will be prompted to enter the details of the voting round, including the issues to be voted on, the
                    number of credits each voter will receive. Once you have entered all the details, click 'Create' to
                    create the voting round and share the link.</p>
                </div>
            </article>

            <article>
                <div class="title">
                    <img src="/img/heart_purple.png" alt="Heart" class="heart-icon" />
                    <h2>Let's Get Started</h2>
                </div>
                <div class="text-container">
                <p>Now that you understand how Quadratic Voting works and how to create or join a voting round, it's
                    time to get started!</p>
                </div>
                <br />
                <Link :href="route('election.create')" as="button">Create voting round 🎉</Link>
            </article>

            <article>
                <br/>
                <footer>
        <span>
            <p>Design: <a href="https://caradt.nl/researcher/tara-karpinski/">Tara Karpinski</a></p>
            <p>Creative Technologist: <a href="https://creativetechnologist.nl">Wesley Hartogs</a></p>
            <p>Source: <a href="https://github.com/WesWeCan/i-love-qv">GitHub</a></p>
        </span>
        </footer>
                
            </article>
        </section>
        
    </FrontLayout>

</template>
