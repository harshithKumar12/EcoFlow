import React, { useState } from "react";
import { Mail, User, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
import logoSrc from "../assets/images/ecoflow_logo_1781961512713.jpg";

interface AuthScreenProps {
  onGuestSignIn?: (email: string, displayName: string) => void;
}

export default function AuthScreen({ onGuestSignIn }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg("Please enter your display name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (onGuestSignIn) {
        onGuestSignIn(email.trim(), displayName.trim());
      }
    } catch (err: any) {
      console.error("Simple sign in error:", err);
      setErrorMsg("An error occurred during entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 flex flex-col items-center justify-center p-4 selection:bg-emerald-600 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-slate-200/90 shadow-xl rounded-3xl p-8 space-y-7 relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        {/* Logo and Headings */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src={logoSrc}
              alt="EcoFlow Logo"
              className="w-16 h-16 object-contain rounded-2xl shadow-md border border-emerald-100 bg-white p-1 hover:scale-105 transition duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
              Welcome to EcoFlow
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Plan eco-routes, compute carbon offsets and reduce your greenhouse footprint with your AI coach.
            </p>
          </div>
        </div>

        {/* Alert box */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-650 px-4 py-3 rounded-2xl text-[11px] flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Custom Instant Access Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Full Name / Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="simple-auth-name"
                type="text"
                placeholder="Name (e.g., Alex Johnson)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="simple-auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <button
            id="enter-ecoflow-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-emerald-500/10 hover:opacity-95 active:scale-[0.99] transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Entering...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enter EcoFlow Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-400 font-medium">
            🔒 Fully local and fast simulation. No sign-up configuration or password required.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
