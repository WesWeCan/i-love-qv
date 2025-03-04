<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ElectionController;
use App\Http\Controllers\VoteController;

Route::get('/', function () {
    return Inertia::render('Index', []);
});


Route::get('/result', function () {
    return Inertia::render('Result');
});


Route::get('/create', [ElectionController::class, 'create'])->name('election.create');
Route::get('/created/{uuid}', [ElectionController::class, 'created'])->name('election.created');

Route::post('/store', [ElectionController::class, 'store'])->name('election.store');

Route::get('/voting-round/{uuid}', [ElectionController::class, 'index'])->name('election.vote');
Route::get('/results/{uuid}', [ElectionController::class, 'results'])->name('election.results');
Route::get('/results/{uuid}/{votecode}', [ElectionController::class, 'resultsWithCode'])->name('election.results.code');


Route::post("/vote", [VoteController::class, 'store'])->name('vote.store');




Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
