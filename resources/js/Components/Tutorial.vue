<script setup lang="ts">

const props = defineProps({
    credits: {
        type: Number,
        required: true,
    },
})

</script>



<template>
    <section class="tutorial">
        <article>
            <h3>Welcome</h3>
            <p>You’re about to participate in a quadratic voting round for collective decision making.</p>
        </article>

        <article>
            <h3>Quadratic Voting</h3>
            <p>Quadratic voting is voting ‘not by direction but by <em>degree</em>.’ Instead of a typical ‘A/B’ vote,
                you will spread your votes across a number of issues to express the intensity of your preferences.</p>
        </article>

        <article>
            <h3>Voting Credits</h3>
            <p>For this voting round you’ve received {{ props.credits }} credits. You may use these credits to vote in
                favour of or oppose a number of issues. At the end of the voting round, all votes will be tallied to
                find out what the group cares about most.</p>
        </article>

        <article>
            <h3>Cost of Votes</h3>
            <p>Your first vote costs 1 credit. Two votes costs 4 credits (2², two squared). Three votes costs 9 credits
                (3², three squared). The interface will help you keep track of your votes during each voting round.</p>
        </article>

        <article>
            <h3>Spread Your Votes</h3>
            <p>The more you spread your votes across different issues, the more voting power you exercise. This is a
                result of the quadratic mathematics. Spreading votes also encourages all voters compromise.</p>
        </article>

        <article>
            <h3>Let's Get Started</h3>
        </article>
    </section>
</template>
