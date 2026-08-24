import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  ShieldCheck, 
  Zap, 
  TrendingUp 
} from 'lucide-react';
import useAuth from '../Hooks/useAuth.js';
import { useDispatch } from 'react-redux';
import { setUser, setSuccessMessage } from '../state/auth.slice.js';
import { getMe } from '../services/auth.api.js';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleRegister, loading, error, successMessage, clearMessages } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: '',
    isSeller: false,
    agreeTerms: true,
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

  // Password strength meter
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-zinc-200', text: 'text-zinc-400' };
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full name';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber.trim()) {
      errs.contactNumber = 'Please enter your contact number';
    } else if (!/^\d{7,15}$/.test(formData.contactNumber.replace(/[\s-+()]/g, ''))) {
      errs.contactNumber = 'Please enter a valid contact number (7-15 digits)';
    }

    if (!formData.password) {
      errs.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms of Service';
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

    const result = await handleRegister({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      contactNumber: formData.contactNumber.trim(),
      password: formData.password,
      isSeller: formData.isSeller,
    });

    if (result.success) {
      setLocalSuccess('Account created successfully! Welcome to Snitch.');
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
      
      {/* LEFT COLUMN: Clean Editorial Register Card */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 z-10 my-4 sm:my-8">
        
        {/* Brand Header: S N I T C H */}
        <div className="mb-5 text-center">
          <Link to="/" className="inline-block group">
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-[0.35em] text-zinc-900 uppercase">
              S N I T C H
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase mt-1">
              NEW MEMBER REGISTRATION
            </p>
          </Link>
        </div>

        {/* Elevated Floating White Card */}
        <div className="editorial-card w-full max-w-[420px] sm:max-w-[460px] p-6 sm:p-9 animate-fade-in">
          
          {/* Status / Alert Messages */}
          {(error || localSuccess || successMessage) && (
            <div
              className={`mb-4 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium border transition-all ${
                localSuccess || successMessage
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {localSuccess || successMessage ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{localSuccess || successMessage || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Full Name Underline Input */}
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
                className={`editorial-underline-input ${
                  formErrors.fullName ? 'editorial-underline-input-error' : ''
                }`}
              />
              {formErrors.fullName && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.fullName}
                </p>
              )}
            </div>

            {/* 2. Email Address Underline Input */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your e-mail"
                autoComplete="email"
                className={`editorial-underline-input ${
                  formErrors.email ? 'editorial-underline-input-error' : ''
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* 3. Contact Number Underline Input */}
            <div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Contact number (e.g. 9876543210)"
                autoComplete="tel"
                className={`editorial-underline-input ${
                  formErrors.contactNumber ? 'editorial-underline-input-error' : ''
                }`}
              />
              {formErrors.contactNumber && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.contactNumber}
                </p>
              )}
            </div>

            {/* 4. Password Underline Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                autoComplete="new-password"
                className={`editorial-underline-input pr-8 ${
                  formErrors.password ? 'editorial-underline-input-error' : ''
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <div className="flex gap-1 flex-1 max-w-[120px] h-1 mr-2">
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-zinc-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-zinc-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-zinc-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-zinc-200'}`} />
                  </div>
                  <span className={`font-bold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              {formErrors.password && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* 5. Seller Mode Switch (Snitch Merchant) */}
            <div className="pt-2">
              <div className={`p-3 rounded-2xl border transition-all ${
                formData.isSeller ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-zinc-50 border-zinc-200/70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${
                      formData.isSeller ? 'bg-white text-zinc-900' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Become a Seller</p>
                      <p className={`text-[10px] ${formData.isSeller ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        Sell fashion apparel on Snitch
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      name="isSeller"
                      checked={formData.isSeller}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="agreeTerms"
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="editorial-checkbox"
              />
              <label 
                htmlFor="agreeTerms"
                className="text-xs text-zinc-600 cursor-pointer select-none"
              >
                I agree to the <span className="font-semibold text-zinc-900">Terms of Service</span> & <span className="font-semibold text-zinc-900">Privacy</span>
              </label>
            </div>
            {formErrors.agreeTerms && (
              <p className="text-[11px] text-rose-500 font-medium">{formErrors.agreeTerms}</p>
            )}

            {/* Primary Action Button: Sign Up (Matching Reference Photo) */}
            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={loading}
                className="editorial-black-pill px-10 py-2.5 min-w-[140px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>CREATING...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </div>

            {/* Already have an account? Log in Link */}
            <div className="text-center pt-1">
              <p className="text-xs text-zinc-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-zinc-900 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-zinc-100 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Google Sign-in Button */}
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
                <span>Sign up with Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* Brand Security Seal */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Snitch Apparel • Official Member Registration</span>
        </div>
      </div>

      {/* RIGHT COLUMN: High-Fashion Studio Male Model Portrait */}
      <div className="hidden lg:flex lg:w-[45%] h-screen relative items-center justify-end overflow-hidden select-none bg-white">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/assets/snitch_model_male.jpg"
            alt="Snitch Modern Streetwear"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 hover:scale-100"
          />
          {/* Subtle gradient blend to white on left */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none" />

          {/* Floating Fashion Badge */}
          <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-900">
              Urban Luxe Runway Edition
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
