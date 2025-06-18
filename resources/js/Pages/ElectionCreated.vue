<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';
import { Link, Head, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

const page = usePage();

const email = ref('');
const isSending = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error' | ''>('');
const lastSentTime = ref(0);
const DEBOUNCE_DELAY = 2000; // 2 seconds

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


            <article>
                <h1>"{{ $page.props.election.name }}" has been created</h1>
                <p>
                    Share the links below with the people that need to vote. You also have recieved a email with the
                    links and the QR codes.
                </p>
            </article>

            <!-- Email Section -->
            <article class="email-section">
                <h2>Send Email with QR Codes</h2>
                <p>Enter an email address to send the voting links and QR codes:</p>
                
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

                <div v-if="message" :class="['message', messageType]">
                    {{ message }}
                </div>
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
                <p>Share this link to view the results:</p>
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

            <article>
                <h2>Manage Link</h2>
                <p>Save this link to manage the election:</p>
                <a :href="route('election.manage', $page.props.election.key!)">{{ route('election.manage',
                    $page.props.election.key!) }}</a>
            </article>
            <article>
                <div class="qr-code">
                    <img :src="route('qr.manage', $page.props.election.key!)" alt="QR Code" />
                    <button @click="downloadQRCode('manage', $page.props.election.key!)">Download QR Code</button>
                </div>
            </article>
        </section>

    </FrontLayout>
</template>



<style scoped>
.email-section {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    background-color: #f9fafb;
}

.email-form {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
}

.email-input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
}

.email-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.send-button {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.send-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
}

.message {
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 1rem;
}

.message.success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.message.error {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}
</style>
