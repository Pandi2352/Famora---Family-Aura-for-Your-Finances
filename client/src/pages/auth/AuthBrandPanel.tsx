import { HeartHandshake, TrendingUp, Users, Shield, BarChart3, Sparkles } from 'lucide-react';

const features = [
  { icon: Users, text: 'Track expenses for the whole family' },
  { icon: TrendingUp, text: 'Smart budgets that actually work' },
  { icon: BarChart3, text: 'Visual insights & analytics' },
  { icon: Shield, text: 'Private & secure for your family' },
];

const floatingCards = [
  { label: 'Family saved', value: '₹23,000', color: 'from-emerald-500/20 to-emerald-500/5', x: 'left-6 top-[38%]', delay: '0s' },
  { label: 'Budget on track', value: '78%', color: 'from-violet-500/20 to-violet-500/5', x: 'right-8 top-[30%]', delay: '1s' },
  { label: 'Members active', value: '4', color: 'from-amber-500/20 to-amber-500/5', x: 'left-12 bottom-[22%]', delay: '2s' },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a0f1c] via-[#111836] to-[#1a1145]">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Top - Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
            <HeartHandshake className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-wide block leading-tight">Famora</span>
            <span className="text-[10px] text-white/30 font-medium uppercase tracking-[0.2em]">Family Aura</span>
          </div>
        </div>

        {/* Center - Hero */}
        <div className="flex-1 flex flex-col justify-center -mt-8">
          <div className="relative">
            {/* Floating stat cards */}
            {floatingCards.map((card, i) => (
              <div
                key={i}
                className={`absolute ${card.x} bg-gradient-to-br ${card.color} backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-xl`}
                style={{ animation: `float 6s ease-in-out ${card.delay} infinite` }}
              >
                <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{card.value}</p>
              </div>
            ))}

            <div className="relative z-10 max-w-md mx-auto text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-medium mb-6">
                <Sparkles className="w-3 h-3" />
                Family finance, simplified
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
                Your family's
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">
                  money, together.
                </span>
              </h1>
              <p className="text-base text-white/40 leading-relaxed max-w-sm mx-auto">
                Track expenses, set family budgets, and build goals together — one place for your entire family's finances.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom - Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <f.icon className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-xs text-white/50 font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
