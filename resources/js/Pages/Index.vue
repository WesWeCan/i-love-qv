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

        <section class="tutorial">
            <article>
                <h1>Quadratic Commons</h1>
                <p>
                    Quadratic Voting is a collective decision-making procedure that allows you to express the intensity
                    of your preferences on a number of issues. Each voter receives credits to spread across several
                    ballot issues. The more a voter spreads their votes, the more voting power is exercised, thanks to
                    the quadratic mathematics behind the procedure. This encourages all voters to compromise and ensures
                    that the group's preferences are accurately represented.
                </p>
            </article>

            <article>
                <h3>Creating a Voting Round</h3>
                <p>To create a new voting round, simply click on the 'Create Voting Round' button on the main page. You
                    will be prompted to enter the details of the voting round, including the issues to be voted on, the
                    number of credits each voter will receive. Once you have entered all the details, click 'Create' to
                    create the voting round and share the link.</p>
            </article>

            <article>
                <h3>Let's Get Started</h3>
                <p>Now that you understand how Quadratic Voting works and how to create or join a voting round, it's
                    time to get started!</p>
                <br />
                <Link :href="route('election.create')" as="button">Create voting round 🎉</Link>
            </article>
        </section>
        
    </FrontLayout>

</template>
