import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RepoCard } from '../components/RepoCard';
import { fetchTrending } from '../lib/api';
import type { Repo } from '../types';
import clsx from 'clsx';

type SortMode = 'composite' | 'trend' | 'stars';
type FilterMode = 'tag' | 'topic';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'composite', label: '综合排序' },
  { value: 'trend', label: '增长趋势' },
  { value: 'stars', label: 'Star 数' }
];

const TAG_DEFINITIONS: Record<string, string> = {
  "Foundation Model": "开源或可训练的基础模型/大模型权重与训练框架",
  "Inference & Serving": "推理引擎、模型服务、加速与部署",
  "Fine-tuning & Training": "微调、训练框架、参数高效训练",
  "Quantization": "量化、低比特推理、模型压缩",
  "Agent Framework": "多智能体或代理应用框架",
  "Workflow Orchestration": "面向流程编排、自动化工作流平台",
  "RAG": "检索增强生成、索引与知识增强",
  "Vector Database": "向量数据库、向量检索引擎",
  "Coding Assistant": "代码生成/补全/重构等开发助手",
  "Chatbot": "对话机器人、客服/聊天应用",
  "Image & Video Generation": "图像/视频生成与编辑",
  "Audio & Speech": "语音识别/合成/音频生成",
  "AI Application": "AI 有关的应用程序，网站或客户端程序等",
  "Skill": "AI 技能库、技能/工具市场、可复用能力集合",
  "MCP": "Model Context Protocol 相关服务器/客户端/SDK/注册表",
  "LLMOps & Evaluation": "模型监控、评测、可观测性、数据/反馈闭环",
  "Security & Safety": "安全、对齐、红队、内容审核",
  "Data & Datasets": "数据集、数据清洗与数据标注工具",
  "Prompt Engineering": "提示词工程、Prompt 模板与最佳实践",
  "Benchmark & Evaluation": "基准测试、评测套件与排行榜",
  "AI for Science": "科学计算、材料/化学/生物等科研场景",
  "Robotics & Physical AI": "机器人、具身智能、物理世界交互",
  "Computer Vision": "传统视觉任务、检测/分割/三维重建/三维分割",
  "Middleware": "中间件、应用开发框架（Streamlit/Gradio）、搜索引擎（ES）等基础设施",
};

export const CategoryExplorer: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>('composite');
  const [filterMode, setFilterMode] = useState<FilterMode>('tag');
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrending('daily').then(setRepos);
  }, []);

  useEffect(() => {
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedCategory]);

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setSelectedCategory("All");
  };

  const tagCategories = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((repo) => {
      repo.tags.forEach((tag) => {
        const normalized = tag.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    const ordered = Object.keys(TAG_DEFINITIONS)
      .map((name) => ({ name, count: counts.get(name) || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .map((item) => item.name);
    return ["All", ...ordered];
  }, [repos]);

  const topicCategories = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((repo) => {
      (repo.topics || []).forEach((topic) => {
        const normalized = topic.trim();
        if (!normalized) return;
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });
    const ordered = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
    return ["All", ...ordered];
  }, [repos]);

  const normalizedCategory = selectedCategory.trim().toLowerCase();
  const filteredRepos = selectedCategory === "All"
    ? repos
    : repos.filter(repo => {
        const list = filterMode === 'tag' ? repo.tags : (repo.topics || []);
        return list.some(item => item.trim().toLowerCase() === normalizedCategory);
      });

  const parseUpdatedAt = (repo: Repo) => {
    if (!repo.last_seen) return 0;
    const time = new Date(repo.last_seen).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  const maxValues = filteredRepos.reduce(
    (acc, repo) => ({
      stars: Math.max(acc.stars, repo.stars),
      growth: Math.max(acc.growth, repo.growth),
      forks: Math.max(acc.forks, repo.forks),
      updated: Math.max(acc.updated, parseUpdatedAt(repo))
    }),
    { stars: 1, growth: 1, forks: 1, updated: 1 }
  );

  const getCompositeScore = (repo: Repo) => {
    const updatedScore = parseUpdatedAt(repo) / maxValues.updated;
    const starsScore = repo.stars / maxValues.stars;
    const growthScore = repo.growth / maxValues.growth;
    const forksScore = repo.forks / maxValues.forks;
    return 0.1 * updatedScore + 0.3 * starsScore + 0.4 * growthScore + 0.2 * forksScore;
  };

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    if (sortMode === 'trend') return b.growth - a.growth;
    if (sortMode === 'stars') return b.stars - a.stars;
    return getCompositeScore(b) - getCompositeScore(a);
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => handleFilterModeChange('tag')}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-md transition-colors border",
                filterMode === 'tag'
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Tag
            </button>
            <button
              onClick={() => handleFilterModeChange('topic')}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-md transition-colors border",
                filterMode === 'topic'
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Topic
            </button>
          </div>
          <h3 className="font-semibold text-gray-900 mb-4 px-2">
            {filterMode === 'tag' ? 'Tags' : 'Topics'}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(filterMode === 'tag' ? tagCategories : topicCategories).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                title={
                  filterMode === 'tag'
                    ? (category !== "All" ? TAG_DEFINITIONS[category] : "显示全部类别")
                    : (category !== "All" ? `Topic: ${category}` : "显示全部 Topic")
                }
                className={clsx(
                  "px-2 py-1 rounded-md text-xs text-left transition-colors",
                  selectedCategory === category
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1" ref={mainContentRef}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              title={
                filterMode === 'tag'
                  ? (selectedCategory !== "All" ? TAG_DEFINITIONS[selectedCategory] : "显示全部类别")
                  : (selectedCategory !== "All" ? `Topic: ${selectedCategory}` : "显示全部 Topic")
              }
            >
              {selectedCategory}
            </h1>
            <p className="text-gray-500 mt-1">
              Found {filteredRepos.length} repositories · {filterMode === 'tag' ? 'Tag' : 'Topic'} 视图
            </p>
          </div>
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortMode(option.value)}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  sortMode === option.value
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRepos.map((repo, idx) => (
            <RepoCard key={`${repo.owner}/${repo.repo}`} repo={repo} rank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};
