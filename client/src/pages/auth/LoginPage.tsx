import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  HeartHandshake,
  Loader2,
  Users,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/auth.store";

const FEATURES = [
  {
    icon: Users,
    label: "Family Tracking",
    color: "bg-primary-100 text-primary-600",
  },
  {
    icon: TrendingUp,
    label: "Smart Budgets",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: PiggyBank,
    label: "Savings Goals",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: ShieldCheck,
    label: "Secure & Private",
    color: "bg-violet-100 text-violet-600",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary-100/60 to-transparent rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-100/40 to-transparent rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Floating accent shapes */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-primary-400/30 rounded-full animate-pulse" />
      <div
        className="absolute top-40 right-32 w-2 h-2 bg-violet-400/40 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-32 left-40 w-2.5 h-2.5 bg-amber-400/30 rounded-full animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-20 right-20 w-3.5 h-3.5 bg-emerald-400/20 rounded-full animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />

      <div className="relative z-10 w-full max-w-[900px] flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* ── Left: Brand Side ── */}
        <div className="flex-1 max-w-[380px] text-center lg:text-left">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 rotate-3 hover:rotate-0 transition-transform">
              <HeartHandshake className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-heading leading-none">
                Famora
              </h1>
              <span className="text-[10px] font-semibold text-primary-500/60 uppercase tracking-[0.2em]">
                Family Aura
              </span>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl lg:text-[2.5rem] font-extrabold text-heading leading-tight mb-3">
            Your family's <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">
              finances, united.
            </span>
          </h2>
          <p className="text-sm text-subtle leading-relaxed mb-8 max-w-[320px] mx-auto lg:mx-0">
            One place for expenses, budgets, and savings goals — managed
            together as a family.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-2.5 max-w-[320px] mx-auto lg:mx-0">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2.5 bg-white/80 border border-slate-100 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.color}`}
                >
                  <f.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-heading">
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="hidden lg:flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {[
                "bg-primary-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-violet-500",
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold`}
                >
                  {["R", "P", "A", "S"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-subtle">
              <span className="font-semibold text-heading">
                Families love it
              </span>{" "}
              — simple & effective
            </p>
          </div>
        </div>

        {/* ── Right: Login Card ── */}
        <div className="w-full max-w-[400px]">
          <div className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-md shadow-slate-200/50">
            {/* Header */}
            <div className="mb-7">
              <h3 className="text-xl font-bold text-heading">Welcome back</h3>
              <p className="text-sm text-subtle mt-1">
                Sign in to your family dashboard
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-heading mb-2">
                  Email address
                </label>
                <div
                  className={`relative rounded-xl transition-all duration-200 ${
                    focused === "email" ? "ring-2 ring-primary-500/20" : ""
                  }`}
                >
                  <Mail
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focused === "email"
                        ? "text-primary-500"
                        : "text-slate-300"
                    }`}
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-md text-sm text-heading placeholder:text-slate-300 focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-heading mb-2">
                  Password
                </label>
                <div
                  className={`relative rounded-xl transition-all duration-200 ${
                    focused === "password" ? "ring-2 ring-primary-500/20" : ""
                  }`}
                >
                  <Lock
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      focused === "password"
                        ? "text-primary-500"
                        : "text-slate-300"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-md text-sm text-heading placeholder:text-slate-300 focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 group disabled:opacity-60 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign in to Famora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-widest">
                Invite only
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-xs text-subtle leading-relaxed">
              Famora is invite-only. Ask your family admin{" "}
              <br className="hidden sm:block" />
              to send you an invitation with login details.
            </p>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-slate-300 font-medium uppercase tracking-wider">
            <span>Private</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>Secure</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>Family First</span>
          </div>
        </div>
      </div>
    </div>
  );
}
