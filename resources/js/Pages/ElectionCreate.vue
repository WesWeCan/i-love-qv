<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';

import { onMounted, ref } from 'vue';
import { Head, useForm } from '@inertiajs/vue3';

import EmojiPicker, { EmojiExt } from 'vue3-emoji-picker'

import * as VotingTypes from '@/types/voting-types';



const tempCredits = ref(10);
const maxIssues = 10; // it is advised to keep the maximum number of issues to 10
const minIssues = 2;

const maxTempCredits = 10;
const minTempCredits = 1;


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
    name: "New Voting Round",
    description: "",
    credits: 100,
    locked: false,
    issues: [] as VotingTypes.Issue[],
    options: {
        forceSpread: false,
    } as VotingTypes.VotingRoundOptions
});

/**
 * Submits the form data and posts it to the server.
 */
const submit = () => {
    // Show confirmation dialog first
    const confirmed = confirm("⚠️ Warning: You cannot alter the voting round after it has been created. You can export the ballot for later import. Are you sure you want to continue?");

    if (!confirmed) {
        return;
    }

    if (form.options.forceSpread) {
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

    // Create a new motion object and add it to the issues array
    form.issues.push({
        text: `Issue ${letters[form.issues.length]}`,
        uuid: createUUID(),
        description: "",
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


const exportBallot = () => {
    // Create a clean ballot object for export (without server-specific fields)
    const ballotData = {
        name: form.name,
        description: form.description,
        credits: form.credits,
        issues: form.issues.map(issue => ({
            text: issue.text,
            description: issue.description || "",
            uuid: issue.uuid
        })),
        options: {
            forceSpread: form.options.forceSpread
        },
        exportDate: new Date().toISOString(),
        version: "1.0"
    };

    // Convert to JSON and create blob
    const jsonString = JSON.stringify(ballotData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.qvballot`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const archiveBallot = () => {
    // Create a nicely formatted text file
    let textContent = `VOTING ROUND ARCHIVE
${'='.repeat(50)}

Name: 
${form.name}

Description: 
${form.description || 'No description provided'}

Force spread votes: ${form.options.forceSpread ? 'Yes' : 'No'}

${'='.repeat(50)}
ISSUES TO VOTE ON
${'='.repeat(50)}

`;

    form.issues.forEach((issue, index) => {
        textContent += `${index + 1}. ${issue.text}

   Description: 
   ${issue.description || 'No description provided'}
   

`;
    });

    textContent += `${'='.repeat(50)}
Export Date: ${new Date().toLocaleString()}
Total Issues: ${form.issues.length}
${'='.repeat(50)}`;

    // Create blob and download
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}-archive.txt`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import functionality
const fileInput = ref<HTMLInputElement>();

const importBallot = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Check file extension
    if (!file.name.endsWith('.qvballot')) {
        alert('Please select a valid .qvballot file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const ballotData = JSON.parse(content);

            // Validate the imported data
            if (!ballotData.name || !ballotData.issues || !Array.isArray(ballotData.issues)) {
                throw new Error('Invalid ballot file format');
            }

            // Update the form with imported data
            form.name = ballotData.name;
            form.description = ballotData.description || "";
            form.credits = ballotData.credits || 100;
            form.options.forceSpread = ballotData.options?.forceSpread || false;

            // Clear existing issues and add imported ones
            form.issues = [];
            ballotData.issues.forEach((issue: any) => {
                form.issues.push({
                    text: issue.text,
                    description: issue.description || "",
                    uuid: issue.uuid || createUUID()
                });
            });

            // Update temp credits based on imported credits
            tempCredits.value = Math.sqrt(form.credits);

            alert('Ballot imported successfully!');

        } catch (error) {
            console.error('Error importing ballot:', error);
            alert('Error importing ballot file. Please check the file format.');
        }
    };

    reader.readAsText(file);

    // Reset file input
    if (target) {
        target.value = '';
    }
};




</script>


<template>

    <Head title="Create Voting Round" />

    <FrontLayout class="create-page">
        <h2>Create voting round</h2>
        <!-- <EmojiPicker :native="true" @select="() => console.log('selected')" theme="light"/> -->
        <form @submit.prevent="submit">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="form.name" placeholder="What are we voting on?" />
                <div class="error" v-if="form.errors.name">{{ form.errors.name }}</div>
            </div>

            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" v-model="form.description"
                    placeholder="What are we voting on in more detail."></textarea>
                <div class="error" v-if="form.errors.description">{{ form.errors.description }}</div>
            </div>

            <div class="import-section">
                <small>Import a previously exported ballot file (.qvballot)</small>
                <div class="import-controls">
                    <input ref="fileInput" type="file" accept=".qvballot" @change="importBallot"
                        style="display: none;" />
                    <button @click.prevent="fileInput?.click()">Import ballot file</button>
                </div>
            </div>


            <div class="form-group">
                <h3 for="issues">Issues to vote on:</h3>
                <small>Note: the issues will be randomly shuffled differently for each vote.</small>
                <div class="error" v-if="form.errors.issues">{{ form.errors.issues }}</div>


                <div class="issues-form">
                    <div class="issue" v-for="(motion, index) in form.issues" :key="index">
                        <label>
                            The issue in one or two words
                        </label>
                        <input type="text" v-model="form.issues[index].text" />


                        <label>
                            Explain the issue in more detail
                        </label>
                        <textarea v-model="form.issues[index].description"></textarea>


                        <button @click.prevent="removeIssue(index)" v-if="!(index < 4)">Remove Issue</button>

                    </div>

                    <div class="issue add-issue">
                        <button @click.prevent="addIssue()" :disabled="form.issues.length >= maxIssues">{{
                            form.issues.length >= maxIssues ? 'Maximum of ' + maxIssues + ' issues reached' : 'Add Issue'}}</button>
                    </div>
                </div>
            </div>



            <div class="form-group">
                <div class="input-group">
                    <input type="checkbox" v-model="form.options.forceSpread">
                    <label>By checking this box, voters will not be able to cast all their voting power on a single
                        ballot issue.</label>
                </div>
            </div>

            <div class="form-group submit-button">
                <button type="submit">Create voting round</button>
            </div>
        </form>


        <div class="export-section">
            <small>You can save the ballot data for later use or archive it.</small>

            <div class="buttons">
                <button @click="exportBallot">Export ballot for later import</button>
                <button @click="archiveBallot">Archive ballot as text file</button>
            </div>


        </div>
    </FrontLayout>
</template>
