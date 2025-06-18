<?php

namespace App\Mail;

use App\Models\Election;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class VotingRoundCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $election;

    /**
     * Create a new message instance.
     */
    public function __construct(Election $election)
    {
        $this->election = $election;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Voting Round Created: ' . $this->election->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.voting-created',
            with: [
                'election' => $this->election,
                'votingUrl' => route('election.vote', $this->election->uuid),
                'resultsUrl' => route('election.results', $this->election->uuid),
                'manageUrl' => route('election.manage', $this->election->key),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // Generate QR codes as raw data
        $votingQrCode = QrCode::size(300)
            ->margin(3)
            ->format('png')
            ->merge('/public/img/heart_cyan.png', 0.3)
            ->errorCorrection('H')
            ->generate(route('election.vote', $this->election->uuid));

        $resultsQrCode = QrCode::size(300)
            ->margin(3)
            ->format('png')
            ->merge('/public/img/heart_purple.png', 0.3)
            ->errorCorrection('H')
            ->generate(route('election.results', $this->election->uuid));

        $manageQrCode = QrCode::size(300)
            ->margin(3)
            ->format('png')
            ->merge('/public/img/heart_gold.png', 0.3)
            ->errorCorrection('H')
            ->generate(route('election.manage', $this->election->key));

        // Sanitize election name for filename
        $electionName = preg_replace('/[^a-zA-Z0-9\s-]/', '', $this->election->name);
        $electionName = str_replace(' ', '-', strtolower(trim($electionName)));

        return [
            Attachment::fromData(fn () => (string) $votingQrCode, 'voting-' . $electionName . '.png')
                ->as('voting-' . $electionName . '.png')
                ->withMime('image/png'),
            Attachment::fromData(fn () => (string) $resultsQrCode, 'results-' . $electionName . '.png')
                ->as('results-' . $electionName . '.png')
                ->withMime('image/png'),
            Attachment::fromData(fn () => (string) $manageQrCode, 'manage-' . $electionName . '.png')
                ->as('manage-' . $electionName . '.png')
                ->withMime('image/png'),
        ];
    }
}
