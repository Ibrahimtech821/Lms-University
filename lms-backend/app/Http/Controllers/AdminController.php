<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateuserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users=User::all();
        return response()->json(["message"=> "All Users" , "data"=>$users],200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RegisterRequest $request)
    {
          $user=User::create([
            'name'=> $request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password),
            'role'=>'Admin'
        ]);

        return response()->json(["message"=>"the user created sucessfully",
                                    "data"=>$user],201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user=User::findOrFail($id);
        return response()->json(["message"=>"the user",
                                    "data"=>$user],200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateuserRequest $request, string $id)
    {
        $user=User::findOrFail($id);
        $user->update($request->validated());
        return response()->json(["message"=> "updated successfully"
        , "data"=>$user],200);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user=User::findOrFail($id);
        $user->delete();
        return response()->json(["message"=>"Deleted successfully"],200);
    }
}
