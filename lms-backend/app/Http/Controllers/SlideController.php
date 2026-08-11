<?php

namespace App\Http\Controllers;

use App\Http\Requests\SlideRequest;
use App\Models\Course;
use App\Models\Slide;
use Illuminate\Http\Request;

class SlideController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $allslides=Slide::all();
        return response()->json($allslides,200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SlideRequest $request)
    {
        $data=$request->validated();

        $path = $request->file('file')->store('slides', 'public');

        $data['storage_path'] = $path;

        unset($data['file']);

        $slide = Slide::create($data);
        
        return response()->json(["message"=> "created successfully "
        , "data"=> $slide],201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $slide=Slide::findOrFail($id);
        return response()->json(["message"=> "the document "
        , "data"=> $slide] , 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SlideRequest $request, string $id)
    {
        $slide=Slide::findOrFail($id);
        $slide->update($request->validated());
        return response()->json(["message"=> "updated successfully"
        , "data"=>$slide],200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $slide=Slide::findOrFail($id);
        
        $slide->delete();
        return response()->json(["message"=> "deleted successfully"],200);
    }

    public function slidessofcourse(Course $course){
        $slide=$course->slides;
        return response()->json(["message"=>"the slides", "data"=>$slide],200);



    }
}
