import React from 'react';
import { Star, GitFork, TrendingUp, ExternalLink } from 'lucide-react';
import type { Repo } from '../types';

interface RepoCardProps {
  repo: Repo;
  rank?: number;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, rank }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {rank && (
            <span className="text-gray-400 font-mono text-xl font-bold">#{rank}</span>
          )}
          <a 
            href={`https://github.com/${repo.owner}/${repo.repo}`}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 min-w-0"
          >
            <span className="truncate">{repo.owner} / <span className="font-bold">{repo.repo}</span></span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        </div>
        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
          <TrendingUp size={14} className="mr-1" />
          +{repo.growth} today
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem] break-words">
        {repo.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="truncate">{repo.language || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} />
            <span>{(repo.stars || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={16} />
            <span>{(repo.forks || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex flex-wrap gap-2">
        {repo.tags.slice(0, 3).map((tag) => (
          <span 
            key={tag} 
            className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
