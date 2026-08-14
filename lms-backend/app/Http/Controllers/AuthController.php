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

        $user=User::where('email',$request->email)->FirstOrFail();
        $token=$user->createToken('auth_token')->plainTextToken;

        return response(["message"=>"the user logged in","user"=>$user,"token"=>$token],200);



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
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "message" => "logged out successfully"
        ], 200);
        
    }


        
    
}
