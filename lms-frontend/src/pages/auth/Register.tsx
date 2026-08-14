import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Icons } from "../../components/ui";

interface RegisterProps {
  onGoLogin: () => void;
}

export default function Register({ onGoLogin }: RegisterProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, passwordConfirm);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#E07B39] flex items-center justify-center text-white">
            <Icons.GraduationCap />
          </div>
          <div>
            <p className="text-base font-bold text-[#0D1B2E]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              AI University LMS
            </p>
            <p className="text-xs text-[#9BAABF] uppercase tracking-widest">Create Account</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DEE5F0] shadow-sm p-7">
          <h1 className="text-xl font-bold text-[#0D1B2E] mb-1">Create an account</h1>
          <p className="text-sm text-[#5A6A82] mb-5">Join the AI University LMS platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Full name</label>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">Confirm password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-red-500 flex-shrink-0"><Icons.AlertCircle /></span>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Creating account…" : "Register as Student"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#5A6A82] mt-5">
            Already have an account?{" "}
            <button onClick={onGoLogin} className="text-[#1C3D6E] font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
