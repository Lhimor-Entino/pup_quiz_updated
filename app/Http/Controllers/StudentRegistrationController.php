<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class StudentRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'studentNumber' => 'required|string|unique:users,student_number',
            'program' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->input('fullName'),
            'student_number' => $request->input('studentNumber'),
            'program' => $request->input('program'),
            'section' => $request->input('section'),
            'username' => $request->input('username'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => 2, // 2 = student
        ]);

        return response()->json([
            'message' => 'Student registered successfully',
            'user' => $user,
        ], 201);
    }
}
