'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PASSWORD_REQUIREMENTS = [
  { label: 'कम से कम 8 अक्षर', test: (p) => p.length >= 8 },
  { label: 'एक बड़ा अक्षर', test: (p) => /[A-Z]/.test(p) },
  { label: 'एक छोटा अक्षर', test: (p) => /[a-z]/.test(p) },
  { label: 'एक संख्या', test: (p) => /\d/.test(p) },
  { label: 'एक विशेष चिह्न', test: (p) => /[!@#$%^&*]/.test(p) },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuthStore();

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const passwordStrength = PASSWORD_REQUIREMENTS.filter((req) => req.test(formData.password)).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) { toast.error('कृपया सेवा की शर्तें स्वीकार करें'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('पासवर्ड मेल नहीं खाते'); return; }
    if (passwordStrength < 4) { toast.error('कृपया एक मजबूत पासवर्ड चुनें'); return; }

    setLoading(true);
    const result = await register(formData.name, formData.username, formData.email, formData.password);
    if (result.success) {
      toast.success('पंजीकरण सफल! स्वागत है!');
      router.push('/');
    } else {
      toast.error(result.error || 'पंजीकरण विफल');
    }
    setLoading(false);
  };

  const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'][passwordStrength];
  const strengthLabel = ['', 'बहुत कमज़ोर', 'कमज़ोर', 'ठीक', 'अच्छा', 'मजबूत'][passwordStrength];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tight">CG</span>
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              CG<span className="text-red-600">FILE</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">अपना खाता बनाएं</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">निःशुल्क जुड़ें और पहले खबर पाएं</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">पूरा नाम</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="आपका पूरा नाम" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">उपयोगकर्ता नाम</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text" name="username" value={formData.username} onChange={handleChange}
                  placeholder="yourusername" required
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ईमेल पता</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">पासवर्ड</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="मजबूत पासवर्ड बनाएं" required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {PASSWORD_REQUIREMENTS.map((req) => (
                      <div key={req.label} className={`flex items-center gap-1 text-xs ${req.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <FiCheck className="w-3 h-3" /> {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">पासवर्ड की पुष्टि करें</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="पासवर्ड दोबारा दर्ज करें" required
                  className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">पासवर्ड मेल नहीं खाते</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${agreedToTerms ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-gray-600'}`} onClick={() => setAgreedToTerms(!agreedToTerms)}>
                {agreedToTerms && <FiCheck className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                मैं{' '}
                <Link href="/terms" className="text-red-600 hover:underline">सेवा की शर्तें</Link>
                {' '}और{' '}
                <Link href="/privacy" className="text-red-600 hover:underline">गोपनीयता नीति</Link>
                {' '}से सहमत हूं
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>खाता बनाएं <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          पहले से खाता है?{' '}
          <Link href="/auth/login" className="text-red-600 font-semibold hover:underline">
            साइन इन करें
          </Link>
        </p>
      </div>
    </div>
  );
}
