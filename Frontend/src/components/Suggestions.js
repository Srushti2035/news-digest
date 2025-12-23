import React, { useEffect, useState } from 'react';
import { getSuggestions } from '../api';
import { Sparkles, ArrowRight, ExternalLink, RefreshCw, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Suggestions = ({ onAddTopic }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0);
    const ITEMS_PER_PAGE = 4;

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await getSuggestions();
            setSuggestions(data);
            setStartIndex(0);
        } catch (error) {
            console.error("Failed to load suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setStartIndex((prev) =>
            prev + ITEMS_PER_PAGE >= suggestions.length ? 0 : prev + ITEMS_PER_PAGE
        );
    };

    const prevSlide = () => {
        setStartIndex((prev) =>
            prev - ITEMS_PER_PAGE < 0 ? Math.max(0, suggestions.length - ITEMS_PER_PAGE) : prev - ITEMS_PER_PAGE
        );
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 h-64 animate-pulse">
                <div className="flex flex-col items-center text-gray-400 gap-3">
                    <RefreshCw className="animate-spin" size={24} />
                    <span>Discovering trending stories...</span>
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <section className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mt-8 text-center text-gray-400">
                <p className="mb-2">We couldn't load trending topics right now.</p>
                <button
                    onClick={fetchSuggestions}
                    className="text-blue-400 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 mx-auto"
                >
                    <RefreshCw size={16} /> Try Again
                </button>
            </section>
        );
    }

    return (
        <section className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mt-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Trending Now</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={prevSlide}
                            disabled={suggestions.length <= ITEMS_PER_PAGE}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} className="text-white" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={suggestions.length <= ITEMS_PER_PAGE}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} className="text-white" />
                        </button>
                    </div>
                    <button
                        onClick={fetchSuggestions}
                        className="text-sm text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.slice(startIndex, startIndex + ITEMS_PER_PAGE).map((item, index) => (
                    <div
                        key={`${startIndex}-${index}`}
                        className="group relative bg-gray-900/60 hover:bg-gray-800/80 border border-white/5 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                    >
                        {item.urlToImage && (
                            <div className="h-32 w-full overflow-hidden">
                                <img
                                    src={item.urlToImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                            </div>
                        )}

                        <div className="p-4 flex flex-col flex-1">
                            <span className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wide truncate">
                                {item.source}
                            </span>
                            <h3 className="text-sm font-medium text-gray-200 line-clamp-3 mb-4 flex-1">
                                {item.title}
                            </h3>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors z-20 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Read <ExternalLink size={10} />
                                </a>
                                {onAddTopic && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault(); // Prevent accidental navigation if nested
                                            onAddTopic(item.source);
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold z-20 cursor-pointer bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                                        title={`Add "${item.source}" to topics`}
                                    >
                                        <PlusCircle size={12} /> Add Source
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Suggestions;
