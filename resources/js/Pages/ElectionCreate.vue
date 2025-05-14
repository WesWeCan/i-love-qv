<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';

import { onMounted, ref } from 'vue';
import { Head, useForm } from '@inertiajs/vue3';

import EmojiPicker, { EmojiExt } from 'vue3-emoji-picker'

import * as VotingTypes from '@/types/voting-types';



const tempCredits = ref(10);
const maxIssues = 8; // it is advised to keep the maximum number of issues to 8
const minIssues = 4;

const maxTempCredits = 10;
const minTempCredits = 1;

const randomEmojis = ['🌟', '🎈', '🎯', '🎨', '🎭', '🎪', '🎢', '🎡', '🎠', '🎮', '🎲', '🎸', '🎺', '🌈', '🎵', '🌞', '🌙', '⭐', '🔮', '🦄', '🌺', '🍀', '🎪', '🐳', '🦋', '🌸', '🍄', '🌵', '🌊', '🍁', '🦚', '🦜', '🦢', '🦩', '🦒', '🦁', '🐘', '🦔', '🐢', '🦎', '🐙', '🦈', '🐋', '🐊', '🦑', '🐠', '🦗', '🐝', '🦅', '🕊️'].filter((value, index, self) => self.indexOf(value) === index)

/**
 * Executes the code inside the onMounted callback function.
 * Adds an issue to the election for each iteration up to the minimum number of issues.
 */
onMounted(() => {
    for (let i = 0; i < minIssues; i++) {
        addIssue();
    }
});


/**
 * Generates a random UUID.
 * 
 * @returns {string} The generated UUID.
 */
 const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * This code initializes a form object using the `useForm` function from the Inertia.js library.
 * The `useForm` function is used to create a reactive form object that can be used to manage form state.
 * 
 * The `form` object has the following properties:
 * - `name`: A string representing the name of the voting round.
 * - `description`: A string representing the description of the voting round.
 * - `credits`: A number representing the number of credits for the voting round.
 * - `motions`: An array of `VotingTypes.Motion` objects representing the motions for the voting round.
 * - `options`: An object of type `VotingTypes.ElectionOptions` representing the options for the voting round.
 *   - `forceSpread`: A boolean indicating whether to force the spread of votes.
 * 
 * This code is part of the ElectionCreate.vue component.
 * 
 * @see https://inertiajs.com/forms
 */

const form = useForm<VotingTypes.VotingRound>({
    id: 0,
    uuid: createUUID(),
    name: "New Election",
    description: "Emoji Party",
    emoji: "🤍",
    credits: 100,
    issues: [] as VotingTypes.Issue[],
    options: {
        forceSpread: false,
    } as VotingTypes.VotingRoundOptions
});

/**
 * Submits the form data and posts it to the server.
 */
const submit = () => {
    

    if(form.options.forceSpread) {
        form.credits -= 1;
    }

    form.post(route('election.store'));
};



/**
 * Function to change the credits value.
 * @param {boolean} increases - Indicates whether the credits should be increased or decreased.
 */
const changeCredits = (increases: boolean) => {

    if (tempCredits.value <= 1 && !increases) {
        return;
    }

    if (increases) {
        tempCredits.value++;
    } else {
        tempCredits.value--;
    }

    if (tempCredits.value > maxTempCredits) {
        tempCredits.value = maxTempCredits;
    }

    if (tempCredits.value < minTempCredits) {
        tempCredits.value = minTempCredits;
    }

    form.credits = Math.pow(tempCredits.value, 2);

};


/**
 * Adds a new issue to the motions array.
 * 
 * @returns {void}
 */
const addIssue = () => {
    // Print a message to indicate that the function is being executed
    console.log('addIssue');

    // Check if the maximum number of issues has been reached
    if (form.issues.length >= maxIssues) {
        // If the maximum number of issues has been reached, return and exit the function
        return;
    }

    // Define a string of letters to be used for issue naming
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


    const usedEmojis = form.issues.map(issue => issue.emoji);
    const availableEmojis = randomEmojis.filter(emoji => !usedEmojis.includes(emoji));
    const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];

    // Create a new motion object and add it to the issues array
    form.issues.push({
        text: `Issue ${letters[form.issues.length]}`,
        uuid: createUUID(),
        description: "",
        emoji: randomEmoji,
    });
};

/**
 * Removes an issue from the form's motions array at the specified index.
 * 
 * @param {number} index - The index of the issue to be removed.
 * @returns {void}
 */
const removeIssue = (index: number) => {
    if (form.issues.length <= minIssues) {
        // Minimum number of issues reached
        return;
    }

    form.issues.splice(index, 1);
};





const onEmojiSelect = (emoji: EmojiExt, issue: VotingTypes.Issue) => {
  issue.emoji = emoji.i
}



</script>


<template>
    <Head title="Create Voting Round" />

    <FrontLayout>
        <h2>Create voting round</h2>
        <!-- <EmojiPicker :native="true" @select="() => console.log('selected')" theme="light"/> -->
        <form @submit.prevent="submit">
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="form.name" 
            placeholder="Emoji Party"
            />
            <div class="error" v-if="form.errors.name">{{ form.errors.name }}</div>

            <label for="description">Description:</label>
            <textarea id="description" v-model="form.description"
            placeholder="What emojis should attend the party?"
            ></textarea>
            <div class="error" v-if="form.errors.description">{{ form.errors.description }}</div>


            <label>The emoji to use for the pool of influence</label>
            <div class="emoji-form">
                    <input type="text" class="emoji-input" v-model="form.emoji" @click="($event) => ($event?.target as HTMLInputElement)?.select()" />
                    <EmojiPicker :native="true" @select="(emoji) => form.emoji = emoji.i" theme="light"/>
                    </div>

            <label for="issues">Issues to vote on:</label>
            <small>Note: the issues will be shuffled differently for each vote.</small>
            <div class="error" v-if="form.errors.issues">{{ form.errors.issues }}</div>


            <div class="issues-form">
                <div class="issue" v-for="(motion, index) in form.issues" :key="index">
                    <label>
                        The issue in 1 single word
                    </label>
                    <input type="text" v-model="form.issues[index].text" />


                    <label>
                        The description of the issue
                    </label>
                    <textarea v-model="form.issues[index].description"></textarea>

                    <label>
                        The emoji to use for this issue
                    </label>
                    <div class="emoji-form">
                    <input type="text" class="emoji-input" v-model="form.issues[index].emoji" @click="($event) => ($event?.target as HTMLInputElement)?.select()" />
                    <EmojiPicker :native="true" @select="(emoji) => onEmojiSelect(emoji, form.issues[index])" theme="light"/>
                    </div>

                    <button @click.prevent="removeIssue(index)" v-if="!(index < 1)">Remove Issue</button>
                    
                </div>

                <button @click.prevent="addIssue()" :disabled="form.issues.length >= maxIssues">Add Issue</button>
            </div>



            <div class="input-group">
                <input type="checkbox" v-model="form.options.forceSpread">
                <label>Choose to force the user to spread their votes across all issues. So it is not possible to put all their influence on one issue.</label>
            </div>

            <button type="submit">Create voting round</button>
        </form>
    </FrontLayout>
</template>


