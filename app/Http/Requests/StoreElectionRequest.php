<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreElectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'uuid' => 'required|string|unique:elections,uuid',
            'name' => 'required|string|max:25',
            'description' => 'required|string',
            'emoji' => 'required|string',
            'credits' => 'required|integer|min:1',
            'issues' => 'required|array|min:2|max:8',
            'issues.*.text' => 'required|string',
            'issues.*.uuid' => 'required|string|distinct',
            'issues.*.description' => 'nullable|string',
            'issues.*.emoji' => 'required|string',
            'options' => 'required|array',
            'options.forceSpread' => 'required|boolean'
        ];
    }
}
