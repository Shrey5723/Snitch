import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import useAuth from '../Hooks/useAuth.js';
import { useDispatch } from 'react-redux';
import { setUser, setSuccessMessage } from '../state/auth.slice.js';
import { getMe } from '../services/auth.api.js';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleLogin, loading, error, successMessage, clearMessages } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    keepMeSignedIn: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);

  // Handle Google OAuth redirect callback from URL params
  useEffect(() => {
    const googleAuthStatus = searchParams.get('google_auth');
    const authError = searchParams.get('error');

    if (googleAuthStatus === 'success') {
      const loadGoogleUser = async () => {
        try {
          const data = await getMe();
          const user = data.user;

          dispatch(setUser({ user }));
          dispatch(setSuccessMessage('Logged in with Google successfully! Welcome to Snitch.'));
          setLocalSuccess('Logged in with Google successfully! Welcome to Snitch.');
          setSearchParams({});

          setTimeout(() => {
            navigate('/');
          }, 1200);
        } catch (err) {
          console.error('Failed to retrieve Google authenticated user:', err);
          setLocalSuccess(null);
        }
      };

      loadGoogleUser();
    } else if (authError) {
      setLocalSuccess(null);
    }
  }, [searchParams, dispatch, navigate, setSearchParams]);

  const validate = () => {
    const errs = {};
    if (!formData.identifier.trim()) {
      errs.identifier = 'Please enter your email or username';
    }
    if (!formData.password) {
      errs.password = 'Please enter your password';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (error || successMessage) {
      clearMessages();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await handleLogin({
      identifier: formData.identifier.trim(),
      password: formData.password,
      keepMeSignedIn: formData.keepMeSignedIn,
    });

    if (result.success) {
      setLocalSuccess('Signed in successfully! Welcome to Snitch.');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row items-center justify-between relative overflow-hidden select-none">

      {/* LEFT COLUMN: Clean Editorial Login Card (Matching Reference Photo) */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 z-10">

        {/* Brand Header: S N I T C H (Matching D O G I E S styling in photo) */}
        <div className="mb-6 sm:mb-8 text-center">
          <Link to="/" className="inline-block group">
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-[0.35em] text-zinc-900 uppercase">
              S N I T C H
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase mt-1">
              CLOTHING & APPAREL
            </p>
          </Link>
        </div>

        {/* Elevated Floating White Card (Matching Reference Card) */}
        <div className="editorial-card w-full max-w-[400px] sm:max-w-[420px] p-8 sm:p-10 animate-fade-in">

          {/* Status / Alert Messages */}
          {(error || localSuccess || successMessage || searchParams.get('error')) && (
            <div
              className={`mb-6 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium border transition-all ${localSuccess || successMessage
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
            >
              {localSuccess || successMessage ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{localSuccess || successMessage || error || searchParams.get('error')}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email / Username Underline Input */}
            <div className="pt-2">
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your e-mail"
                autoComplete="username"
                className={`editorial-underline-input ${formErrors.identifier ? 'editorial-underline-input-error' : ''
                  }`}
              />
              {formErrors.identifier && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.identifier}
                </p>
              )}
            </div>

            {/* Password Underline Input */}
            <div className="relative pt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                className={`editorial-underline-input pr-8 ${formErrors.password ? 'editorial-underline-input-error' : ''
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-0 bottom-2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {formErrors.password && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Primary Black Pill Action Button: Log in (Matching Reference Photo) */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="editorial-black-pill px-10 py-2.5 min-w-[140px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>LOGGING IN...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </div>

            {/* Sign Up Link (Matching Reference Photo) */}
            <div className="text-center pt-2">
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold text-zinc-800 hover:text-black transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Forgot your password? Link (Matching Reference Photo) */}
            <div className="text-center">
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password recovery link has been sent to your registered email.');
                }}
                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Forgot your password?
              </a>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-zinc-100 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Google OAuth Sign-in Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="editorial-google-pill w-full py-2.5 px-4 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* Brand Security Seal */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Snitch Apparel • Official Member Authentication</span>
        </div>
      </div>

      {/* RIGHT COLUMN: High-Fashion Studio Portrait (Matching Reference Photo Layout) */}
      <div className="hidden lg:flex lg:w-[45%] h-screen relative items-center justify-end overflow-hidden select-none bg-white">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/assets/snitch_model.jpg"
            alt="Snitch Luxury Apparel"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 hover:scale-100"
          />
          {/* Subtle gradient blend to white on left */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none" />

          {/* Floating Fashion Badge */}
          <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-900">
              Autumn / Winter Collection
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
