<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\LoginLogs;
use App\Models\LoginOtp;
use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PDO;

class EmailController extends Controller
{
    //

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $otpLogin = LoginOtp::where("email", $request->email)->first();
        // Check expiration
        if (now()->greaterThan($otpLogin->otp_expires_at)) {
            return response()->json(['error' => 'OTP expired'], 400);
        }

        // Check code
        if ($request->otp !== $otpLogin->otp) {

            return response()->json(['error' => 'Invalid OTP'], 400);
        }

        $lOtp = LoginOtp::where('email', $request->email)->firstOrFail();
        $lOtp->delete();

        // Log the user in
        Auth::login($user);
        return response()->json(['success' => 'Logged In Successfully'], 200);
    }

    public function resendOTP(Request $request)
    {
        $user = User::where("email", $request->email)->first();
        $lOtp = LoginOtp::where('email', $request->email)->firstOrFail();


        if (!$user) {
            return response()->json([
                "error" => "Email not found"
            ], 404);
        }
        if ($lOtp) {
            $lOtp->delete();
        }

        try {
            $otp = rand(100000, 999999);



            LoginOtp::create([
                "otp" =>  $otp,
                "code" => "",
                "email" => $request->email,
                "otp_expires_at" =>  now()->addMinutes(5)
            ]);

            $name = $user->name;
            $email = $request->email;
            $subject = "Your OTP Code";
            $body = "Your OTP code is "  . $otp . ". It expires in 5 minutes.";

            Mail::to($email)->send(new OtpMail($name, $email, $subject, $body));

            return response()->json(['success' => 'New OTP sent successfully'], 200);
        } catch (Exception $e) {
            return response()->json([
                "msg" => "Failed to send OTP email",
                "error" => $e->getMessage()  // will show the actual error message
            ], 500);
        }
    }

    public function sendOtp(Request $request)
    {


        $lOtp = LoginOtp::where('email', $request->email)->first();
        $user = User::where("email", $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email not found',
            ]);
        }
        if ($lOtp) {
            $lOtp->delete();
        }


        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Invalid password',
            ]);
        }
        try {
            $otp = rand(100000, 999999);
            $login_log = LoginLogs::where("emaiil", $request->email)->first();

            if (!$login_log) {
                LoginLogs::create([
                    "user_id" =>  $user->id,

                    "emaiil" => $request->email,

                ]);
            }

            LoginOtp::create([
                "otp" =>  $otp,
                "code" => "",
                "email" => $request->email,
                "otp_expires_at" =>  now()->addMinutes(5)
            ]);

            $name = $user->name;
            $email = $request->email;
            $subject = "Your OTP Code";
            $body = "Your OTP code is "  . $otp . ". It expires in 5 minutes.";

            Mail::to($email)->send(new OtpMail($name, $email, $subject, $body));
        } catch (Exception $e) {
            return response()->json([
                "msg" => "Failed to send OTP email",
                "error" => $e->getMessage()  // will show the actual error message
            ], 500);
        }

        // // Success
        // return response()->json([
        //     "msg" => "Login successful",
        //     "user" => $user
        // ]);

        // return "OTP Email Sent!";
    }
}
