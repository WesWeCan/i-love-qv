<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';
import { Link, Head, usePage } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';

const page = usePage();
const email = ref('');
const isSending = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error' | ''>('');
const lastSentTime = ref(0);
const DEBOUNCE_DELAY = 2000; // 2 seconds

/**
 * Download a QR code as an image
 * @param type - The type of QR code to download (e.g. 'election' or 'results')
 * @param uuid - The UUID of the election
 */
const downloadQRCode = (type: string, uuid: string) => {

    if (!page.props.election?.name) {
        return;
    }

    // Create a hidden image element
    const img = document.createElement('img');
    img.style.display = 'none';
    document.body.appendChild(img);

    // Set the image source
    img.src = route(`qr.${type}`, uuid);

    // Wait for the image to load, then download
    img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${type}-${page.props.election?.name}.png`;
                    document.body.appendChild(a);
                    a.click();

                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                // Clean up the hidden image
                document.body.removeChild(img);
            }, 'image/png');
        }
    };

    // Handle error case
    img.onerror = () => {
        console.error('Failed to load QR code image');
        document.body.removeChild(img);
    };
};

/**
 * Send an email with the voting links as QR codes
 */
const sendEmail = async () => {
    if (!email.value || !page.props.election?.uuid) {
        return;
    }

    // Check debounce
    const now = Date.now();
    if (now - lastSentTime.value < DEBOUNCE_DELAY) {
        const remainingTime = Math.ceil((DEBOUNCE_DELAY - (now - lastSentTime.value)) / 1000);
        message.value = `Please wait ${remainingTime} second(s) before sending another email.`;
        messageType.value = 'error';
        return;
    }

    isSending.value = true;
    message.value = '';
    messageType.value = '';

    try {
        const response = await fetch(route('election.send-email', page.props.election.uuid), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ email: email.value }),
        });

        const data = await response.json();

        if (data.success) {
            message.value = data.message;
            messageType.value = 'success';
            email.value = '';
            lastSentTime.value = now;
        } else {
            message.value = data.message;
            messageType.value = 'error';
        }
    } catch (error) {
        message.value = 'Failed to send email. Please try again.';
        messageType.value = 'error';
    } finally {
        isSending.value = false;
    }
};

</script>


<template>
    <Head title="Created!" />
    <FrontLayout class="election-created">
        <section class="page-section" v-if="$page.props.election">
            <article class="center-text">
                <h1>"{{ $page.props.election.name }}" has been created</h1>
                <p>
                    Share these links with voters.
                </p>
            </article>
            <!-- Email Section -->
            <article class="email-section">
                <h2>Send me an email with QR codes.</h2>
                <p>Enter your email address to receive the voting links as QR codes.</p>
                <p>We do not store your email address in our database.</p>
                <div class="email-form">
                    <input 
                        type="email" 
                        v-model="email" 
                        placeholder="Enter email address"
                        :disabled="isSending"
                        class="email-input"
                    />
                    <button 
                        @click="sendEmail" 
                        :disabled="isSending || !email.trim()"
                        class="send-button"
                    >
                        {{ isSending ? 'Sending...' : 'Send Email' }}
                    </button>
                </div>
                <small v-if="isSending">
                    Sending email can take a few moments. Please wait.
                </small>
                <div v-if="message" :class="['message', messageType]">
                    {{ message }}
                </div>
            </article>
            <article>
                <h2>Unlock voting results (host)</h2>
                <p>Save this link to unlock the voting results, but do not share it with voters:</p>
                <p>You can stop the voting round and release the results from this page.</p>
                <a :href="route('election.manage', $page.props.election.key!)">{{ route('election.manage',
                    $page.props.election.key!) }}</a>
                <Link :href="route('election.manage', $page.props.election.key!)" as="button">Manage</Link>
            </article>
            <article>
                <h2>Voting Link</h2>
                <a :href="route('election.vote', $page.props.election.uuid)">{{ route('election.vote',
                    $page.props.election.uuid) }}</a>
                <Link :href="route('election.vote', $page.props.election.uuid)" as="button">Go to {{
                    $page.props.election.name
                }}</Link>
            </article>
            <article>
                <div class="qr-code">
                    <img :src="route('qr.voting', $page.props.election.uuid)" alt="QR Code" />
                    <button @click="downloadQRCode('election', $page.props.election.uuid)">Download QR Code</button>
                </div>
            </article>
            <article>
                <h2>Results Link</h2>
                <p>Share this link with voters to view the results:</p>
                <a :href="route('election.results', $page.props.election.uuid)">{{ route('election.results',
                    $page.props.election.uuid) }}</a>
                <Link :href="route('election.results', $page.props.election.uuid)" as="button">See results</Link>
            </article>
            <article>
                <div class="qr-code">
                    <img :src="route('qr.results', $page.props.election.uuid)" alt="QR Code" />
                    <button @click="downloadQRCode('results', $page.props.election.uuid)">Download QR Code</button>
                </div>
            </article>
        </section>
    </FrontLayout>
</template>




