<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function query(Request $request){

    try {
        $response=Http::withHeaders([
            "x-internal-key"=>config('services.ai.internal_key'),
        ])->post( config('services.ai.url') . '/query',
            [
                'question' => $request->question,
                'course_id' => $request->course_id,
                'document_id' => $request->document_id,
                'conversation_id' => $request->conversation_id,
            ]
        );
        return response()->json(
            $response->json(),
            $response->status()
        );
    }
    catch(ConnectionException $e){
        return response()->json([
            "message"=> "AI service is unavailable "
        ], 503);

    }
        
        }

    public function summarize(Request $request){

    try {
       $response=Http::withHeaders([
           'x-internal-key' => config('services.ai.internal_key'),
        ])->post(  config('services.ai.url') . '/summarize',

            [
                'course_id' => $request->course_id,
                'document_id' => $request->slide_id, 
            ]
        
        
        );

        return  response()->json(
            $response->json(),
            $response->status()
        );

    }
    catch(ConnectionException $e){
        return response()->json([
            "message"=> "AI service is unavailable "
        ], 503);

    }

    }
}
