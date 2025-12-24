import React, { useEffect, useState, useCallback } from 'react';
import { getProfile, updatePreferences, sendNow, getNewsPreview } from '../api';
import NewsFeed from './NewsFeed';
import Suggestions from './Suggestions';
import { Newspaper, Bell, LogOut, Plus, Trash2, Send, Save, Check, User, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner-image.jpg';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [newTopic, setNewTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await getProfile();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            if (error.response?.status === 401) {
                navigate('/');
            }
        }
    }, [navigate]);

    const fetchNews = useCallback(async () => {
        setLoadingNews(true);
        try {
            const { data } = await getNewsPreview();
            setArticles(data);
        } catch (error) {
            console.error("Failed to fetch news preview", error);
        } finally {
            setLoadingNews(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (user && user.topics.length > 0) {
            fetchNews();
        } else {
            setArticles([]);
        }
    }, [user, fetchNews]);

    const handleUpdate = async (updatedFields) => {
        try {
            const { data } = await updatePreferences({ ...user, ...updatedFields });
            setUser(data);
            return data;
        } catch (error) {
            console.error("Failed to update preferences", error);
            throw error;
        }
    };

    const addTopic = async () => {
        if (!newTopic.trim()) return;
        if (user.topics.includes(newTopic.trim())) {
            alert("Topic already exists!");
            return;
        }
        const updatedTopics = [...user.topics, newTopic.trim()];
        await handleUpdate({ topics: updatedTopics });
        setNewTopic('');
        fetchNews();
    };

    const removeTopic = async (topicToRemove) => {
        const updatedTopics = user.topics.filter(t => t !== topicToRemove);
        await handleUpdate({ topics: updatedTopics });
        if (updatedTopics.length > 0) {
            fetchNews();
        } else {
            setArticles([]);
        }
    };

    const triggerManualMail = async () => {
        setLoading(true);
        try {
            await sendNow();
            alert("Digest Sent Successfully! Check your inbox.");
        } catch (error) {
            alert("Failed to send digest.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen w-full relative bg-gray-900 text-white overflow-hidden">
            {/* Background Image Container */}
            <div
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">
                            Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your personalized news feed</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                            <div className="p-1.5 bg-blue-500/20 rounded-full">
                                <User size={16} className="text-blue-300" />
                            </div>
                            <span className="font-semibold text-gray-200 text-sm">{user.name || user.email?.split('@')[0]}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} className="text-red-400" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Topics */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Newspaper className="text-blue-400" size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Your Topics</h2>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <input
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                                    placeholder="Add a new topic (e.g., AI, Crypto, Space)"
                                    value={newTopic}
                                    onChange={(e) => setNewTopic(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                                />
                                <button
                                    onClick={addTopic}
                                    className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {user.topics.length === 0 ? (
                                    <p className="text-gray-500 italic w-full text-center py-4">No topics added yet. Add some to get started!</p>
                                ) : (
                                    user.topics.map(topic => (
                                        <div key={topic} className="group flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-xl border border-white/10 transition-all hover:border-blue-500/50">
                                            <span className="font-medium text-gray-200">{topic}</span>
                                            <button
                                                onClick={() => removeTopic(topic)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Actions Card */}

                        <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                        <Send size={20} className="text-indigo-400" />
                                        Instant Delivery
                                    </h2>
                                    <p className="text-sm text-gray-300">
                                        Get a news update sent to your email instantly.
                                    </p>
                                </div>
                                <button
                                    onClick={triggerManualMail}
                                    disabled={loading || user.topics.length === 0}
                                    className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    ) : (
                                        <>
                                            Send Now <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Settings & Actions */}
                    <div className="space-y-6">
                        {/* Subscription Card */}
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${user.isSubscribed ? 'from-green-500/20' : 'from-gray-500/20'} to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none`}></div>

                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className={`p-2 rounded-lg ${user.isSubscribed ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                                    <Bell className={user.isSubscribed ? 'text-green-400' : 'text-gray-400'} size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Subscription</h2>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl border border-white/5">
                                    <span className="text-gray-300">Subscribe to Channel</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={user.isSubscribed}
                                            onChange={() => handleUpdate({ isSubscribed: !user.isSubscribed })}
                                        />
                                        <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                {user.isSubscribed
                                    ? "You are receiving daily updates."
                                    : "Enable to receive automated daily News Updates."}
                            </div>

                            {/* Schedule Settings */}
                            {user.isSubscribed && (
                                <div className="mt-6 border-t border-white/5 pt-4">
                                    <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                        <Clock size={16} /> Delivery Schedule
                                    </h3>
                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Preferred Time (UTC)
                                        </label>
                                        <select
                                            value={user.customScheduleTimes?.[0] || "12"}
                                            onChange={(e) => {
                                                const time = e.target.value;
                                                // Save as "custom" type with this specific time
                                                handleUpdate({
                                                    scheduleType: 'custom',
                                                    customScheduleTimes: [time]
                                                });
                                            }}
                                            className="w-full bg-gray-900 text-white text-sm rounded-lg border border-white/10 px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            {Array.from({ length: 24 }).map((_, i) => {
                                                const hour = String(i).padStart(2, '0');
                                                return <option key={hour} value={hour}>{hour}:00</option>;
                                            })}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Select the hour you want to receive your daily digest once per day.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl border border-white/5 mt-4">
                                <span className="text-gray-300 flex items-center gap-2">
                                    Good News Only
                                    {user.goodNewsOnly && <span className="text-xl">🌟</span>}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={user.goodNewsOnly || false}
                                        onChange={() => handleUpdate({ goodNewsOnly: !user.goodNewsOnly })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                            <div className="text-sm text-gray-400 px-1">
                                {user.goodNewsOnly
                                    ? "We'll filter out negative stories."
                                    : "Show all news, good and bad."}
                            </div>
                        </section>


                    </div>
                </div>

                {/* News Feed Section */}
                {user.topics.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold border-l-4 border-blue-500 pl-4">Live News Preview</h2>
                            <button
                                onClick={fetchNews}
                                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors border border-white/10"
                                title="Refresh News"
                            >
                                <RefreshCw size={20} className={loadingNews ? "animate-spin text-blue-400" : "text-gray-400"} />
                            </button>
                        </div>
                        <NewsFeed articles={articles} loading={loadingNews} />
                    </div>
                )}
                {/* Suggestions Section */}
                {/* Suggestions Section */}
                <div className="mt-12">
                    <Suggestions onAddTopic={async (topic) => {
                        if (!user.topics.includes(topic)) {
                            const updatedTopics = [...user.topics, topic];
                            // Optimistic update
                            setUser({ ...user, topics: updatedTopics });

                            // Update backend and then refresh news
                            try {
                                await updatePreferences({ topics: updatedTopics, isSubscribed: user.isSubscribed, goodNewsOnly: user.goodNewsOnly });
                                // Fetch news immediately after backend confirms update
                                await fetchNews();
                            } catch (error) {
                                console.error("Error adding topic:", error);
                            }
                        }
                    }} />
                </div>
            </div >
        </div >
    );
};

export default Dashboard;

