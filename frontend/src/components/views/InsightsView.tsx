import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { JobInsights, Job } from '../../types';
import { api } from '../../api';

interface InsightsViewProps {
  job: Job | null;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ job }) => {
  const [insights, setInsights] = useState<JobInsights | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      loadInsights(job.id);
    }
  }, [job]);

  const loadInsights = async (jobId: number) => {
    try {
      setLoading(true);
      const data = await api.getInsights(jobId);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Please select a requisition opening to inspect AI analytics.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-electric">
              AGGREGATE METRICS & TELEMETRY
            </span>
            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-electric/10 text-electric border border-electric/20">
              {job.title}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Requisition Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Aggregate skill coverage, missing competency deficits, and score distribution histograms.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-500 uppercase block font-medium">Sample Size</span>
          <span className="text-2xl font-bold font-mono text-electric">
            {insights?.total_candidates ?? 0} Resumes
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-electric border-t-transparent rounded-full animate-spin"></div>
          <span>Computing aggregate telemetry distributions...</span>
        </div>
      ) : !insights || insights.total_candidates === 0 ? (
        <div className="bg-white p-14 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold text-navy-900">Insufficient Candidate Data</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload resumes for this requisition to generate skill coverage and score distribution analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Skill Coverage Across Applicants */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-electric">
                  SUPPLY PROFILE
                </span>
                <h3 className="text-xl font-serif font-bold text-navy-900">Applicant Skill Coverage</h3>
              </div>
              <CheckCircle2 className="w-5 h-5 text-electric" />
            </div>

            <div className="space-y-4 pt-1">
              {insights.skill_coverage.map((item) => (
                <div key={item.skill} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-sm font-medium text-navy-900">{item.skill}</span>
                    <span className="font-mono text-xs text-electric font-bold">
                      {item.count} / {insights.total_candidates} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-electric h-full rounded-full transition-all duration-700 shimmer-bar"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Frequently Missing Job Requirements */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">
                  DEFICIT RADAR
                </span>
                <h3 className="text-xl font-serif font-bold text-navy-900">Missing Requirements</h3>
              </div>
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>

            {insights.missing_skills_freq.length === 0 ? (
              <div className="py-16 text-center text-sm text-emerald-600 font-semibold">
                ✓ No skill deficits detected across all applicants!
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {insights.missing_skills_freq.map((item) => (
                  <div key={item.skill} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-sm font-medium text-navy-900">{item.skill}</span>
                      <span className="font-mono text-xs text-rose-600 font-bold">
                        Missing in {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 3: Score Distribution Histogram */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-electric">
                  FIT DENSITY
                </span>
                <h3 className="text-xl font-serif font-bold text-navy-900">Score Distribution Histogram</h3>
              </div>
              <BarChart3 className="w-5 h-5 text-electric" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {insights.score_distribution.map((bucket) => (
                <div key={bucket.range} className="bg-[#FAF8F3] p-4 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-xs text-slate-500 font-medium block">{bucket.range}</span>
                  <span className="text-3xl font-bold font-mono text-electric mt-1 block">
                    {bucket.count}
                  </span>
                  <span className="text-[11px] text-slate-400">Candidates in Range</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
