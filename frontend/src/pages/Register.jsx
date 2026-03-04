import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Sparkles } from 'lucide-react';
import useAuthStore from '../services/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleInputChange = () => {
    clearError();
    setValidationError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient circles */}
      <div className="gradient-circle w-96 h-96 bg-neon-purple -top-48 -right-48 animate-float" />
      <div className="gradient-circle w-96 h-96 bg-neon-blue -bottom-48 -left-48 animate-float" style={{ animationDelay: '2s' }} />
      <div className="gradient-circle w-64 h-64 bg-neon-cyan top-1/3 right-1/4 animate-float" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-pink mb-4 shadow-neon-purple"
          >
            <Sparkles size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold neon-text">Create Account</h1>
          <p className="text-gray-400 mt-2">Join Neon Chat today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); handleInputChange(); }}
              placeholder="Choose a username"
              className="input-neon"
              required
              minLength={3}
              maxLength={30}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
              placeholder="Enter your email"
              className="input-neon"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
              placeholder="Create a password"
              className="input-neon"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Lock size={16} />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); handleInputChange(); }}
              placeholder="Confirm your password"
              className="input-neon"
              required
            />
          </div>

          {/* Error message */}
          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {validationError || error}
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <div className="typing-indicator">
                <span className="typing-dot bg-white/60"></span>
                <span className="typing-dot bg-white/60"></span>
                <span className="typing-dot bg-white/60"></span>
              </div>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-blue hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
