<script setup lang="ts">

import FrontLayout from '@/Layouts/FrontLayout.vue';
import { Link, Head, usePage } from '@inertiajs/vue3';

const page = usePage();

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
                <a :href="route('election.manage', $page.props.election.uuid)">{{ route('election.manage',
                    $page.props.election.uuid) }}</a>
            </article>
            <article>
                <div class="qr-code">
                    <img :src="route('qr.manage', $page.props.election.uuid)" alt="QR Code" />
                    <button @click="downloadQRCode('manage', $page.props.election.uuid)">Download QR Code</button>
                </div>
            </article>
        </section>

    </FrontLayout>
</template>



<style scoped></style>
