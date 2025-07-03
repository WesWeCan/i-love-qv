<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Http\Requests\StoreElectionRequest;
use App\Http\Requests\UpdateElectionRequest;
use App\Models\Vote;
use App\Mail\VotingRoundCreated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Inertia\Inertia;

use illuminate\Support\Str;


class ElectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($uuid)
    {


        $election = Election::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('ElectionVoting', [
            'election' => $election,
        ]);
    }

    public function results($uuid)
    {
        $election = Election::where('uuid', $uuid)->with('participants')->firstOrFail();

        // make sure each participant castedVotes is an array from json
        foreach ($election->participants as $participant) {
            $participant->castedVotes = json_decode($participant->castedVotes, true);
        }


        return Inertia::render('ElectionResults', [
            'election' => $election,
        ]);
    }


    public function manage($key)
    {
        $election = Election::where('key', $key)->with('participants')->firstOrFail();

        foreach ($election->participants as $participant) {
            $participant->castedVotes = json_decode($participant->castedVotes, true);
        }

        return Inertia::render('ElectionManage', [
            'election' => $election,
        ]);
    }

    public function lock($key)
    {
        $election = Election::where('key', $key)->firstOrFail();
        $election->locked = true;
        $election->save();
    }

    public function unlock($key)
    {
        $election = Election::where('key', $key)->firstOrFail();
        $election->locked = false;
        $election->save();
    }


    /**
     * Retrieve the election results with the provided code.
     *
     * @param string $uuid The UUID of the election.
     * @param string $votecode The vote code.
     * @return \Inertia\Response The rendered election results page.
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function resultsWithCode($uuid, $votecode)
    {
        // Retrieve the election with the given UUID
        $election = Election::where('uuid', $uuid)->with('participants')->firstOrFail();


        // make sure each participant castedVotes is an array from json
        foreach ($election->participants as $participant) {
            $participant->castedVotes = json_decode($participant->castedVotes, true);
        }


        // Retrieve the UUID of the vote with the given vote code
        $myVoteUuid = Vote::where('votecode', $votecode)->firstOrFail()->uuid;

        // Render the election results page with the necessary data
        return Inertia::render('ElectionResults', [
            'election' => $election,
            'myVoteCode' => $votecode,
            'myVoteUuid' => $myVoteUuid,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

        return Inertia::render('ElectionCreate');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreElectionRequest $request The HTTP request object containing the validated data.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreElectionRequest $request)
    {
        // Validate the request data
        $validated = $request->validated();



        // Create a new election with the validated data
        $election = Election::create([
            'name' => $validated['name'],
            'uuid' => Str::uuid(),
            'key' => Str::uuid(),
            'description' => $validated['description'],
            'credits' => $validated['credits'],
            'issues' => $validated['issues'],
            'options' => $validated['options'],
        ]);



        // Redirect to the "election.created" route with the UUID of the created election
        return redirect()->route('election.created', ['uuid' => $election->uuid]);
    }


    /**
     * Retrieve the election with the given UUID and render the 'ElectionCreated' view.
     *
     * @param string $uuid The UUID of the election
     * @return \Inertia\Response The rendered 'ElectionCreated' view
     */
    public function created($uuid)
    {
        // Retrieve the election with the given UUID
        $election = Election::where('uuid', $uuid)->firstOrFail();

        // Render the 'ElectionCreated' view with the retrieved election
        return Inertia::render('ElectionCreated', [
            'election' => $election,
        ]);
    }



    /**
     * Display the specified resource.
     */
    public function show(Election $election)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Election $election)
    {
        //
    }

    /**
     * Send email with election information and QR codes.
     */
    public function sendEmail(Request $request, $uuid)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $election = Election::where('uuid', $uuid)->firstOrFail();

        try {
            Mail::to($request->email)->send(new VotingRoundCreated($election));

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email. Please try again.'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election)
    {
        //
    }
}
