import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../../components/ui";

interface StudentRegisterProps {
  onLogin: () => void;
}

export default function StudentRegister({
  onLogin,
}: StudentRegisterProps) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // This calls:
      // POST /register
      await register(
        name,
        email,
        password,
        passwordConfirm
      );
      onLogin();

      // AuthContext sets the user automatically.
      // App.tsx will then show the student dashboard.
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-xl bg-[#E07B39] flex items-center justify-center text-white mb-3">
            <Icons.GraduationCap />
          </div>

          <h1 className="text-xl font-bold text-[#0D1B2E]">
            AI University
          </h1>

          <p className="text-sm text-[#5A6A82] mt-1">
            Create your student account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-[#DEE5F0] rounded-2xl shadow-sm p-6">

          <h2 className="text-lg font-semibold text-[#0D1B2E] mb-1">
            Create account
          </h2>

          <p className="text-sm text-[#5A6A82] mb-6">
            Sign up to access your courses and learning materials.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Full name
              </label>

              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Email address
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Password
              </label>

              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E]"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Confirm password
              </label>

              <input
                type="password"
                required
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) =>
                  setPasswordConfirm(e.target.value)
                }
                placeholder="Confirm your password"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#1C3D6E] text-white text-sm font-medium hover:bg-[#162F55] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DEE5F0] text-center">
            <p className="text-sm text-[#5A6A82]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onLogin}
                className="font-medium text-[#1C3D6E] hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}