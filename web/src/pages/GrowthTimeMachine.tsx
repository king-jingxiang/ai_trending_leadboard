import React, { useState, useEffect } from 'react';
import { StarHistoryChart } from '../components/StarHistoryChart';
import { fetchTrending } from '../lib/api';
import type { Repo } from '../types';
import { Calendar } from 'lucide-react';

export const GrowthTimeMachine: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    fetchTrending('daily').then(data => {
      setRepos(data);
      if (data.length > 0) setSelectedRepo(data[0]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Growth Analysis</h2>
              <p className="text-gray-500 text-sm">Star history over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar size={16} />
              <span>Last 30 Days</span>
            </div>
          </div>
          
          {selectedRepo && selectedRepo.star_history ? (
            <StarHistoryChart data={selectedRepo.star_history} />
          ) : (
             <div className="h-64 flex items-center justify-center text-gray-400">
               No history data available
             </div>
          )}
        </div>

        {selectedRepo && (
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-gray-900 mb-4">Milestones & Events</h3>
             <div className="space-y-4">
                {/* Placeholder for events */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                     <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                     <div className="w-0.5 h-full bg-gray-100 mt-1"></div>
                  </div>
                  <div className="pb-4">
                     <div className="text-sm font-medium text-gray-900">First 1000 Stars</div>
                     <div className="text-xs text-gray-500">2023-12-01</div>
                  </div>
                </div>
             </div>
           </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Top Growers</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {repos.map(repo => (
              <button
                key={`${repo.owner}/${repo.repo}`}
                onClick={() => setSelectedRepo(repo)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedRepo?.repo === repo.repo ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{repo.repo}</div>
                    <div className="text-xs text-gray-500 truncate">{repo.owner}</div>
                  </div>
                  <div className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    +{repo.growth}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
