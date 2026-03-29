import { useNavigate } from 'react-router-dom';
import { ShieldX, LogIn, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-danger-500/10 to-orange-500/10 rounded-full flex items-center justify-center">
            <ShieldX className="w-14 h-14 text-danger-500/60" />
          </div>
          <div className="absolute -top-2 -right-4 w-16 h-16 bg-danger-500/10 rounded-full blur-xl" />
          <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-accent-500/10 rounded-full blur-lg" />
        </div>

        {/* Text */}
        <p className="text-6xl font-extrabold text-heading mb-2">401</p>
        <h1 className="text-xl font-bold text-heading mb-2">Access denied</h1>
        <p className="text-sm text-subtle leading-relaxed mb-8">
          You need to be signed in to access this page.
          If you were invited, check your email for login credentials.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-subtle bg-card border border-border rounded-xl hover:text-heading hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
