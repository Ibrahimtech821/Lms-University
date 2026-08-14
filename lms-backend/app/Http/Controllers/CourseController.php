<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourseRequest;
use App\Http\Requests\UpdateRequest;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $allCourse=Course::withCount('slides')->get();
        return response()->json($allCourse,200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CourseRequest $request)
    {   
        $data=$request->validated();

        $data["createdBy"]=Auth::id();

        $course=Course::create($data);
        return response()->json(["message"=> "created successfully "
        , "data"=> $course],201);
        
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $course=Course::findOrFail($id);
        return response()->json(["message"=> "the courses "
        , "data"=> $course] , 200);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id)
    {
        $course=Course::findOrFail($id);
        $course->update($request->validated());
        return response()->json(["message"=> "updated successfully"
        , "data"=>$course],200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $course=Course::findOrFail($id);
        
        $course->delete();
        return response()->json(["message"=> "deleted successfully"],200);
    }
}
