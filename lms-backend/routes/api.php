<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SlideController;
use Illuminate\Support\Facades\Route;


Route::post('/login',[AuthController::class,'login']);
Route::post('/register',[AuthController::class,'register']);

Route::middleware('auth:sanctum')->group(function(){
 Route::get('/user', [AuthController::class, 'user']);


 Route::apiResource('courses', CourseController::class)
        ->only(['index', 'show']);
 Route::apiResource("slides",SlideController::class)
        ->only(['index','show']);
 Route::get('/courses/{course}/slides',[SlideController::class,'slidessofcourse']);
 Route::post('/ai/query', [AIController::class, 'query']);
 Route::post('/ai/summarize', [AIController::class, 'summarize']);


Route::middleware("role")->group(function (){
    Route::get('/admin/users',[AdminController::class,'index']);
    Route::get('/admin/user/{id}',[AdminController::class,'show']);
    Route::put('/admin/user/{id}',[AdminController::class,'update']);
    Route::delete('/admin/user/{id}',[AdminController::class,'destroy']);
    Route::post('/admin/register',[AdminController::class,'store']);
    Route::apiResource('courses', CourseController::class)
        ->only(['store', 'update', 'destroy']);
    Route::apiResource('slides',SlideController::class)
        ->only(['store','update','destroy']);
   

});


});
