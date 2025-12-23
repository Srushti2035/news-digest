import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

const NewsFeed = ({ articles, loading }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!articles || articles.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400 bg-white/5 rounded-xl border border-white/10">
                <p>No news available. Add some topics to see a preview here!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
                <div
                    key={`${article.url}-${index}`}
                    className="group bg-gray-800/40 border border-white/10 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                    {/* Image */}
                    <div className="h-48 overflow-hidden relative">
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white z-10">
                            {article.topic}
                        </div>
                        {article.urlToImage ? (
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-500">
                                <span className="text-4xl">📰</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                            <span className="font-semibold text-blue-400">{article.source.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                            {article.title}
                        </h3>

                        <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
                            {article.description || "No description available."}
                        </p>

                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Read Full Story <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NewsFeed;
