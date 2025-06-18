<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'credits',
        'issues',
        'options',
        'emoji',
        'key',
        'locked',
    ];

    protected $casts = [
        'issues' => 'array',
        'options' => 'array',
        'locked' => 'boolean',
    ];

    public function participants()
    {
        return $this->hasMany(Vote::class);
    }


}
