<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';
import axios from 'axios';
import { Head, usePage } from '@inertiajs/vue3';
const page = usePage();

const lockElection = () => {
    if (!page.props.election) return;
    axios.post(route('election.lock', page.props.election.key)).then((response) => {
        location.reload();
    });
}

const unlockElection = () => {
    if (!page.props.election) return;
    axios.post(route('election.unlock', page.props.election.key)).then((response) => {
        location.reload();
    });
}

</script>

<template>

<Head title="Manage" />


    <FrontLayout v-if="$page.props.election">

        <section class="page-section">
            <h1>Unlock voting results for '{{ $page.props.election.name }}'</h1>


            <div class="text-container center-text">
                <p>There are currently {{ $page.props.election.participants?.length }} responses in this voting round.
                </p>

                <p>Voting is currently <u>{{ $page.props.election.locked ? 'disabled' : 'enabled' }}</u> - users {{
                    $page.props.election.locked ? 'cannot' : 'can' }} submit new votes.</p>

                <p>Results are currently <u>{{ $page.props.election.locked ? 'visible' : 'hidden' }}</u> - users {{
                    $page.props.election.locked ? 'can' : 'cannot' }} see the voting results.</p>
            </div>

            <button @click="lockElection" v-if="!$page.props.election.locked">Make results visible, do not allow
                voting.</button>
            <button @click="unlockElection" v-else>Hide results, allow voting.</button>



        </section>


    </FrontLayout>

</template>