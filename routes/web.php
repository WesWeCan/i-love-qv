<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ElectionController;
use App\Http\Controllers\QrCodeController;
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

Route::get('/qr/voting/{uuid}', [QrCodeController::class, 'voting'])->name('qr.voting');
Route::get('/qr/results/{uuid}', [QrCodeController::class, 'results'])->name('qr.results');
Route::get('/qr/manage/{key}', [QrCodeController::class, 'manage'])->name('qr.manage');


Route::get('/manage/{key}', [ElectionController::class, 'manage'])->name('election.manage');

