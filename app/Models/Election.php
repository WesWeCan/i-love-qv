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
    ];

    protected $casts = [
        'issues' => 'array',
        'options' => 'array',
    ];

    public function participants()
    {
        return $this->hasMany(Vote::class);
    }


}
