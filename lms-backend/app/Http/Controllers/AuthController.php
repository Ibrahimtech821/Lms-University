<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function user(Request $request)
    {
    return response()->json([
        "data" => $request->user()
    ], 200);
    }


    
    public function login(LoginRequest $request){
        $credentials=$request->validated();
        if(!Auth::attempt($credentials)){
            return response(["message"=>"invalid credtails"] ,401);
        }

      
        $request->session()->regenerate();

        return response(["message"=>"the user logged in","user"=>Auth::user()],200);



    }

    public function register(RegisterRequest $request){

        $user=User::create([
            'name'=> $request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password),
            'role'=>'Student'
        ]);

        return response()->json(["message"=>"the user created sucessfully",
                                    "data"=>$user],201);
        
    }

    public function logout(Request $request){

      Auth::logout();
      $request->session()->invalidate();
      $request->session()->regenerateToken();

        return response()->json([
            "message" => "logged out successfully"
        ], 200);
        
    }


        
    
}
