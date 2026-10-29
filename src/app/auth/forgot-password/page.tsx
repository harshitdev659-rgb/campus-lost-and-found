"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, School } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Link
        href="/auth/login"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500">
            Enter your university email address. We'll send instructions to verify and reset your access credentials.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-xs font-bold text-emerald-900">Reset Email Dispatched</h3>
            <p className="text-[11px] text-emerald-700">
              If an account with {email} exists in our institutional database, a secure password reset link has been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Campus Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-campus-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-campus-800 hover:bg-campus-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
