import React, { useState } from 'react';
import { login, register, forgotPassword } from '../api';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner-image.jpg'; // Import the image
import { Mail, Lock, ArrowRight, UserPlus, LogIn, User, Eye, EyeOff } from 'lucide-react'; // Import icons

const Auth = ({ isLogin }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages
        try {
            if (showForgot) {
                const { data } = await forgotPassword(formData.email);
                setMessage(data.message);
            } else if (isLogin) {
                const { data } = await login(formData);
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                await register(formData);
                alert("Registered! Please login.");
                navigate('/');
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full relative">
            {/* Background Image Container */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay to ensure text readability and theme consistency */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-indigo-900/40 backdrop-blur-[1px]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8 transform transition-all hover:scale-[1.01]">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200 mb-2">
                            NewsDigest
                        </h1>
                        <p className="text-gray-300 font-medium">
                            {showForgot ? 'Reset Password' : (isLogin ? 'Welcome Back!' : 'Join the Community')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {!isLogin && (
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {!showForgot && (
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sent') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {message}
                            </div>
                        )}

                        {!showForgot && isLogin && (
                            <div className="text-right">
                                <button type="button" onClick={() => { setShowForgot(true); setMessage(''); }} className="text-sm text-blue-300 hover:text-white transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <>
                                    {showForgot ? <Mail size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
                                    {showForgot ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm mb-2">
                            {showForgot ? "Remember your password?" : (isLogin ? "Don't have an account?" : "Already have an account?")}
                        </p>
                        <button
                            onClick={() => {
                                if (showForgot) {
                                    setShowForgot(false);
                                    setMessage('');
                                } else {
                                    navigate(isLogin ? '/register' : '/');
                                }
                            }}
                            className="text-blue-300 hover:text-white font-semibold transition-colors flex items-center justify-center mx-auto gap-1 group"
                        >
                            {showForgot ? 'Back to Login' : (isLogin ? 'Register now' : 'Login here')}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
