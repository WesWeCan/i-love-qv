<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';
import { Link, Head } from '@inertiajs/vue3';


</script>


<template>
    <Head title="Created!" />

    <FrontLayout>

        <section class="tutorial">
        
        <article v-if="$page.props.election">
            <h1>"{{ $page.props.election.name }}" has been created</h1>
            <p>Share this link to the voting form with your commons:</p>
            <a :href="route('election.vote', $page.props.election.uuid)">{{ route('election.vote',
                $page.props.election.uuid) }}</a>
            <br />
            <Link :href="route('election.vote', $page.props.election.uuid)" as="button">Go to {{ $page.props.election.name
            }}</Link>
        </article>
        <br /><br />

        <article v-if="$page.props.election">
            <p>Share this link to view the results:</p>
            <a :href="route('election.results', $page.props.election.uuid)">{{ route('election.results',
                $page.props.election.uuid) }}</a>
            <br />
            <Link :href="route('election.results', $page.props.election.uuid)" as="button">See results</Link>
        </article>

    </section>

    </FrontLayout>
</template>



<style scoped></style>
