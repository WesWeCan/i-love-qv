<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'votingRoundUuid' => 'required|string|uuid|exists:elections,uuid',
            'remainingCredits' => 'required|numeric|min:0',
            'castedVotes' => 'required|array',
            'castedVotes.*.issueUuid' => 'required|string|uuid',
            'castedVotes.*.numberOfVotes' => 'required|numeric',
            'castedVotes.*.creditsSpent' => 'required|numeric|min:0'
        ];
    }
}
