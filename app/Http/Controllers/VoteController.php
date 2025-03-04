<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Election;
use App\Http\Requests\StoreVoteRequest;
use App\Http\Requests\UpdateVoteRequest;

use Illuminate\Support\Str;

class VoteController extends Controller
{
   
     /**
     * Store a newly created resource in storage.
     *
     * @param StoreVoteRequest $request The request object.
     * @return \Illuminate\Http\RedirectResponse The redirect response.
     */
    public function store(StoreVoteRequest $request)
    {
        // Validate the request
        $validated = $request->validated();

        // Find the election by UUID
        $election = Election::where('uuid', $validated['votingRoundUuid'])->firstOrFail();

        // Create a new vote with the validated data
        $vote = Vote::create([
            'name' => $validated['name'] ?? null,
            'uuid' => Str::uuid(),
            'remainingCredits' => $validated['remainingCredits'],
            'castedVotes' => json_encode($validated['castedVotes']),
            "votecode" => str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT),
            'election_id' => $election->id
        ]);

        // Redirect to the election results page with the vote code and election UUID
        return redirect()->route('election.results.code', ['uuid' => $election->uuid, 'votecode' => $vote->votecode]);
    }


}
