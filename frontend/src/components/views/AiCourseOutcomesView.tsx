import React, { useEffect, useState } from 'react';
import {
  Network,
  Cpu,
  BrainCircuit,
  Sliders,
  Database,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { Job, Candidate, GraphSearchResponse, KnowledgeGraphResponse } from '../../types';
import { api } from '../../api';

interface AiCourseOutcomesViewProps {
  job: Job | null;
  candidates: Candidate[];
  onRefreshData: () => void;
}

export const AiCourseOutcomesView: React.FC<AiCourseOutcomesViewProps> = ({
  job,
  candidates,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'co2' | 'co3' | 'co4' | 'co5' | 'co1'>('co2');

  // CO2 State (Graph Search)
  const [algorithm, setAlgorithm] = useState<'bfs' | 'dfs' | 'a_star'>('bfs');
  const [graphData, setGraphData] = useState<GraphSearchResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // CO3 State (Knowledge Triples)
  const [kgData, setKgData] = useState<KnowledgeGraphResponse | null>(null);
  const [kgFilter, setKgFilter] = useState<'all' | 'explicit' | 'inferred'>('all');

  // CO4 State (Bayesian Reasoning Simulator)
  const [simReq, setSimReq] = useState(85);
  const [simTfidf, setSimTfidf] = useState(75);
  const [simExp, setSimExp] = useState(90);
  const [simRulePassed, setSimRulePassed] = useState(true);

  // CO5 State (ML Weight Tuner)
  const [weightReq, setWeightReq] = useState(job?.weights.req ?? 0.40);
  const [weightPref, setWeightPref] = useState(job?.weights.pref ?? 0.15);
  const [weightTfidf, setWeightTfidf] = useState(job?.weights.tfidf ?? 0.30);
  const [weightExp, setWeightExp] = useState(job?.weights.exp ?? 0.15);
  const [savingWeights, setSavingWeights] = useState(false);

  useEffect(() => {
    if (job) {
      loadGraphSearch(job.id, algorithm);
      loadKnowledgeGraph(job.id);
      if (job.weights) {
        setWeightReq(job.weights.req);
        setWeightPref(job.weights.pref);
        setWeightTfidf(job.weights.tfidf);
        setWeightExp(job.weights.exp);
      }
    }
  }, [job, algorithm]);

  // Step playback loop for CO2
  useEffect(() => {
    let interval: any;
    if (isPlaying && graphData?.search_result.steps) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < graphData.search_result.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 850);
    }
    return () => clearInterval(interval);
  }, [isPlaying, graphData]);

  const loadGraphSearch = async (jobId: number, algo: 'bfs' | 'dfs' | 'a_star') => {
    try {
      const res = await api.getGraphSearch(jobId, algo);
      setGraphData(res);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  const loadKnowledgeGraph = async (jobId: number) => {
    try {
      const res = await api.getKnowledgeGraph(jobId);
      setKgData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyWeights = async () => {
    if (!job) return;
    const total = weightReq + weightPref + weightTfidf + weightExp;
    if (Math.abs(total - 1.0) > 0.02) {
      alert(`Weights must sum to 1.0 (Current sum: ${total.toFixed(2)})`);
      return;
    }

    try {
      setSavingWeights(true);
      await api.recalculateWeights(job.id, {
        req: weightReq,
        pref: weightPref,
        tfidf: weightTfidf,
        exp: weightExp,
      });
      alert('Weights updated! Candidate rankings have been dynamically recalibrated.');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to recalibrate weights');
    } finally {
      setSavingWeights(false);
    }
  };

  const calculateSimBayes = () => {
    const p_s = 0.25;
    const p_ns = 0.75;
    const e_req = Math.max(0.05, Math.min(0.99, simReq / 100));
    const e_tfidf = Math.max(0.05, Math.min(0.99, simTfidf / 100));
    const e_exp = Math.max(0.05, Math.min(0.99, simExp / 100));

    let p_e_given_s = Math.pow(e_req, 1.2) * Math.pow(e_tfidf, 0.8) * Math.pow(e_exp, 0.6);
    const p_e_given_ns =
      Math.pow(1.0 - e_req, 1.0) * Math.pow(1.0 - e_tfidf, 0.6) * Math.pow(1.0 - e_exp, 0.4) + 0.02;

    if (!simRulePassed) p_e_given_s *= 0.35;

    const num = p_e_given_s * p_s;
    const den = num + p_e_given_ns * p_ns;
    const posterior = den > 0 ? num / den : 0.05;

    const score_variance = (Math.pow(simReq - simTfidf, 2) + Math.pow(simReq - simExp, 2)) / 20000.0;
    const uncertainty = 0.05 + Math.min(0.25, score_variance * 0.4);

    return {
      posterior: Math.round(posterior * 100),
      uncertainty: Math.round(uncertainty * 100),
    };
  };

  const currentStep = graphData?.search_result.steps[currentStepIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-electric">
            AI COURSE OUTCOMES LAB (CO1–CO5)
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Algorithmic Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Interactive demonstrations of Search Graphs, Knowledge Triples, Probabilistic Inference, and Machine Learning.
          </p>
        </div>

        <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-electric/10 text-electric border border-electric/20 self-start sm:self-auto">
          Academic Capstone Engine
        </span>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex border-b border-slate-200/80 space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: 'co2', label: 'CO2: Graph Traversal', icon: Network },
          { id: 'co3', label: 'CO3: Knowledge Triples', icon: Database },
          { id: 'co4', label: 'CO4: Rule & Bayesian Reasoning', icon: BrainCircuit },
          { id: 'co5', label: 'CO5: ML Scoring Weight Tuner', icon: Sliders },
          { id: 'co1', label: 'CO1: Intelligent Agent Architecture', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-electric text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: CO2 GRAPH SEARCH TRAVERSAL (BFS, DFS, A*)
      ===================================================================== */}
      {activeSubTab === 'co2' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528]/85 p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/30 pb-4">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                  CO2 SEARCH ALGORITHMS
                </span>
                <h3 className="text-2xl font-bold text-white font-display">
                  Graph Search Traversal Engine
                </h3>
              </div>

              {/* Algorithm Switcher */}
              <div className="flex items-center space-x-2 font-mono text-xs font-semibold uppercase">
                <span className="text-slate-400 text-[11px]">Algorithm:</span>
                <button
                  onClick={() => setAlgorithm('bfs')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    algorithm === 'bfs'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-[#070D1E] text-slate-300 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  BFS (Queue)
                </button>
                <button
                  onClick={() => setAlgorithm('dfs')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    algorithm === 'dfs'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold border-indigo-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                      : 'bg-[#070D1E] text-slate-300 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  DFS (Stack)
                </button>
                <button
                  onClick={() => setAlgorithm('a_star')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    algorithm === 'a_star'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-[#070D1E] text-slate-300 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  A* (Heuristic)
                </button>
              </div>
            </div>

            {/* Step Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#070D1E] p-4 rounded-2xl border border-blue-900/50 shadow-inner">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2 text-xs font-mono font-extrabold uppercase rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Traversal'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    if (
                      graphData &&
                      currentStepIndex < graphData.search_result.steps.length - 1
                    ) {
                      setCurrentStepIndex((prev) => prev + 1);
                    }
                  }}
                  className="inline-flex items-center space-x-1 bg-[#0B1528] hover:bg-[#111f3d] text-slate-200 border border-blue-900/60 px-3.5 py-2 text-xs font-mono font-semibold uppercase rounded-xl cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Next Step</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                  }}
                  className="inline-flex items-center space-x-1 bg-[#0B1528] hover:bg-[#111f3d] text-slate-200 border border-blue-900/60 px-3 py-2 text-xs font-mono font-semibold uppercase rounded-xl cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="font-mono text-xs text-cyan-400 font-semibold">
                STEP 0{currentStepIndex + 1} OF 0{graphData?.search_result.steps.length ?? 0}
              </div>
            </div>

            {/* Current Step State Card */}
            {currentStep && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-[#070D1E] p-4 rounded-2xl border border-blue-900/50 space-y-1 shadow-inner">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Node</span>
                  <div className="text-lg font-bold text-white">
                    {currentStep.current_label}
                  </div>
                  <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                    Type: {currentStep.current_type}
                  </span>
                </div>

                <div className="bg-[#070D1E] p-4 rounded-2xl border border-blue-900/50 space-y-1 md:col-span-2 shadow-inner">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Action Details</span>
                  <div className="font-mono text-xs font-medium text-slate-300 leading-relaxed">
                    {currentStep.action}
                  </div>
                  {currentStep.f_cost !== undefined && (
                    <div className="text-[11px] text-cyan-400 font-semibold pt-1">
                      A* Cost: f(n) = {currentStep.f_cost} [g(n)={currentStep.g_cost}, h(n)={currentStep.h_cost}]
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual Node Representation */}
            <div className="border border-blue-900/50 p-6 rounded-2xl bg-[#070D1E] space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 font-semibold uppercase">
                <span>Graph Nodes (Requisition → Skills → Candidates)</span>
                <div className="flex items-center space-x-3 text-[10px]">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm inline-block"></span>
                    <span>Requisition</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm inline-block"></span>
                    <span>Skills</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block"></span>
                    <span>Candidates</span>
                  </span>
                </div>
              </div>

              {/* Node Visualizer Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {graphData?.graph_topology.nodes.map((node) => {
                  const isCurrent = currentStep?.current_node === node.id;
                  const isVisited = currentStep?.visited.includes(node.id);

                  let bg = 'bg-[#0B1528] text-slate-300 border-blue-900/50';
                  if (node.type === 'job') bg = 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60';
                  else if (node.type.startsWith('skill')) bg = 'bg-blue-950/70 text-blue-300 border-blue-800/60';
                  else if (node.type === 'candidate') bg = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';

                  return (
                    <div
                      key={node.id}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold uppercase transition-all flex items-center space-x-1.5 ${bg} ${
                        isCurrent
                          ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] -translate-y-1 scale-105'
                          : isVisited
                          ? 'opacity-100'
                          : 'opacity-40'
                      }`}
                    >
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                      <span>{node.label}</span>
                      {isVisited && !isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-current" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CO3 KNOWLEDGE REPRESENTATION (SEMANTIC TRIPLES)
      ===================================================================== */}
      {activeSubTab === 'co3' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528]/85 p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/30 pb-4">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                  CO3 ONTOLOGY & REPRESENTATION
                </span>
                <h3 className="text-2xl font-bold text-white font-display">
                  Knowledge Graph Semantic Triples
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold uppercase">
                <button
                  onClick={() => setKgFilter('all')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    kgFilter === 'all'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-xs'
                      : 'bg-[#070D1E] text-slate-400 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  All ({kgData?.total_facts ?? 0})
                </button>
                <button
                  onClick={() => setKgFilter('explicit')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    kgFilter === 'explicit'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-xs'
                      : 'bg-[#070D1E] text-slate-400 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  Explicit Facts ({kgData?.explicit_facts ?? 0})
                </button>
                <button
                  onClick={() => setKgFilter('inferred')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    kgFilter === 'inferred'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-xs'
                      : 'bg-[#070D1E] text-slate-400 border-blue-900/50 hover:bg-[#0e1933]'
                  }`}
                >
                  Inferred Facts ({kgData?.inferred_facts ?? 0})
                </button>
              </div>
            </div>

            {/* Triples Table */}
            <div className="border border-blue-900/50 rounded-2xl overflow-hidden bg-[#070D1E]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0B1528] text-slate-400 border-b border-blue-900/40 uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Predicate (Relationship)</th>
                    <th className="p-3.5">Object</th>
                    <th className="p-3.5">Confidence</th>
                    <th className="p-3.5">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30">
                  {kgData?.triples
                    .filter((t) => {
                      if (kgFilter === 'explicit') return t.is_explicit;
                      if (kgFilter === 'inferred') return !t.is_explicit;
                      return true;
                    })
                    .map((triple, idx) => (
                      <tr key={idx} className="hover:bg-[#0e1c38] transition-colors">
                        <td className="p-3.5 font-semibold text-white">{triple.subject}</td>
                        <td className="p-3.5 text-cyan-400 font-bold">{triple.predicate}</td>
                        <td className="p-3.5 text-slate-300">{triple.object}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full border border-cyan-800/60 bg-cyan-950 font-semibold text-[10px] text-cyan-300">
                            {(triple.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-400">
                          {triple.evidence_type}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: CO4 PROBABILISTIC & RULE REASONING SIMULATOR
      ===================================================================== */}
      {activeSubTab === 'co4' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528]/85 p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-card space-y-6">
            <div className="border-b border-blue-900/30 pb-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                CO4 PROBABILISTIC LOGIC
              </span>
              <h3 className="text-2xl font-bold text-white font-display">
                Bayesian Inference & Rule Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate posterior candidate suitability probability P(Match | Evidence) given observed evidence vectors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Simulator Sliders */}
              <div className="bg-[#070D1E] p-6 rounded-2xl border border-blue-900/50 space-y-5 font-mono text-xs shadow-inner">
                <span className="font-semibold uppercase tracking-wider text-slate-300 block">
                  Simulate Evidence Parameters
                </span>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Required Skill Match Rate:</span>
                    <span className="text-cyan-400 font-bold">{simReq}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simReq}
                    onChange={(e) => setSimReq(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">TF-IDF Semantic Cosine:</span>
                    <span className="text-blue-400 font-bold">{simTfidf}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simTfidf}
                    onChange={(e) => setSimTfidf(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Experience Adequacy:</span>
                    <span className="text-emerald-400 font-bold">{simExp}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simExp}
                    onChange={(e) => setSimExp(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="sim-rule-toggle"
                    checked={simRulePassed}
                    onChange={(e) => setSimRulePassed(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded border-blue-900 bg-[#0B1528]"
                  />
                  <label htmlFor="sim-rule-toggle" className="text-xs font-semibold text-slate-300 uppercase cursor-pointer">
                    Passed Hard Eligibility Rules (Degree & Core Experience)
                  </label>
                </div>
              </div>

              {/* Bayesian Calculation Output Card */}
              {(() => {
                const bayes = calculateSimBayes();
                return (
                  <div className="bg-[#070D1E] p-6 rounded-2xl border border-blue-900/50 shadow-inner space-y-5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400 block">
                      BAYES' THEOREM CALCULATION
                    </span>

                    <div className="flex items-baseline justify-between border-b border-blue-900/30 pb-4">
                      <div>
                        <div className="text-4xl sm:text-5xl font-extrabold font-mono text-cyan-400">
                          {bayes.posterior}%
                        </div>
                        <p className="font-mono text-xs uppercase text-slate-400 mt-1">
                          Posterior Probability P(Suitable | Evidence)
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-white text-base">±{bayes.uncertainty}%</span>
                        <p className="text-[10px] text-slate-500 uppercase">Uncertainty interval</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0B1528] rounded-xl border border-blue-900/50 text-xs space-y-1 font-mono text-[11px] text-slate-300">
                      <div>Prior Probability: P(Suitable) = 0.25</div>
                      <div>P(E | Suitable) = (Req^1.2) * (TFIDF^0.8) * (Exp^0.6)</div>
                      <div className="text-cyan-400 font-bold">
                        P(Suitable | E) = [P(E|S) · P(S)] / P(E)
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {bayes.posterior >= 75
                        ? 'High-confidence suitability. Observed competencies and semantic match strongly support qualification.'
                        : bayes.posterior >= 50
                        ? 'Borderline fit. Human recruiter audit is recommended for ambiguous experience spans.'
                        : 'Low posterior probability. Significant competency deficits observed.'}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: CO5 ML SCORING WEIGHT TUNER
      ===================================================================== */}
      {activeSubTab === 'co5' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528]/85 p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-card space-y-6">
            <div className="border-b border-blue-900/30 pb-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                CO5 DECISION WEIGHTS
              </span>
              <h3 className="text-2xl font-bold text-white font-display">
                Multi-Factor Decision Weight Tuner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure the multi-factor scoring formula weights. Candidates dynamically re-rank in real time.
              </p>
            </div>

            {/* Formula Math Card */}
            <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 font-mono text-xs space-y-1.5 shadow-inner">
              <span className="font-semibold uppercase text-[10px] text-slate-400 block">Mathematical Formula Model:</span>
              <div className="text-base font-bold text-cyan-400">
                Overall Score = ({weightReq.toFixed(2)} × ReqSkills) + ({weightPref.toFixed(2)} × PrefSkills) + ({weightTfidf.toFixed(2)} × TFIDF) + ({weightExp.toFixed(2)} × Experience)
              </div>
              <div className="text-[11px] text-slate-500">
                Sum of weights: {(weightReq + weightPref + weightTfidf + weightExp).toFixed(2)} (Target: 1.00)
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Required Skills Weight:</span>
                  <span className="text-cyan-400 font-bold">{(weightReq * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.70"
                  step="0.05"
                  value={weightReq}
                  onChange={(e) => setWeightReq(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Preferred Skills Weight:</span>
                  <span className="text-indigo-400 font-bold">{(weightPref * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weightPref}
                  onChange={(e) => setWeightPref(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">TF-IDF Text Similarity:</span>
                  <span className="text-blue-400 font-bold">{(weightTfidf * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={weightTfidf}
                  onChange={(e) => setWeightTfidf(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Experience Adequacy:</span>
                  <span className="text-purple-400 font-bold">{(weightExp * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weightExp}
                  onChange={(e) => setWeightExp(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleApplyWeights}
                disabled={savingWeights}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-6 py-3 rounded-xl shadow-md shadow-cyan-500/25 text-xs font-mono font-extrabold uppercase transition-all cursor-pointer"
              >
                <span>{savingWeights ? 'Recalibrating...' : 'Apply Weights & Recalibrate Pool'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: CO1 INTELLIGENT AGENT ARCHITECTURE
      ===================================================================== */}
      {activeSubTab === 'co1' && (
        <div className="space-y-6">
          <div className="bg-[#0B1528]/85 p-6 sm:p-8 rounded-3xl border border-blue-900/40 shadow-card space-y-6">
            <div className="border-b border-blue-900/30 pb-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                CO1 PEAS SPECIFICATION
              </span>
              <h3 className="text-2xl font-bold text-white font-display">
                Intelligent Screening Agent Model
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2 shadow-inner">
                <div className="font-mono font-bold text-cyan-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
                  <span>Performance Measure (P)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-normal">
                  Maximized match precision, zero demographic bias, explainable scoring weights, and verifiable resume evidence excerpts.
                </p>
              </div>

              <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2 shadow-inner">
                <div className="font-mono font-bold text-blue-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block"></span>
                  <span>Environment (E)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-normal">
                  Partially observable (applicants may omit unstated skills), episodic, deterministic given fixed formula weights.
                </p>
              </div>

              <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2 shadow-inner">
                <div className="font-mono font-bold text-emerald-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
                  <span>Actuators (A)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-normal">
                  Ranked candidate recommendations, evidence highlights, shortlist status suggestions, and CSV reports.
                </p>
              </div>

              <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2 shadow-inner">
                <div className="font-mono font-bold text-purple-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block"></span>
                  <span>Sensors (S)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-normal">
                  Document parsers (PyMuPDF, python-docx, XML readers), regex entity extractors, and TF-IDF tokenizers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
