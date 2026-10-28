import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  GraduationCap,
  Trash2,
  Edit2,
  X,
  Search,
  Users,
  ArrowRight
} from 'lucide-react';
import { Job } from '../../types';
import { api } from '../../api';

interface JobsViewProps {
  jobs: Job[];
  onRefresh: () => void;
  onSelectJob: (jobId: number) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ jobs, onRefresh, onSelectJob }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [minExp, setMinExp] = useState(2);
  const [degree, setDegree] = useState("Bachelor's Degree in CS or related field");
  const [description, setDescription] = useState('');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('');
  const [preferredSkillsStr, setPreferredSkillsStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDepartment('Engineering');
    setLocation('San Francisco, CA (Hybrid)');
    setEmploymentType('Full-time');
    setMinExp(2);
    setDegree("Bachelor's Degree in CS or related field");
    setDescription('');
    setRequiredSkillsStr('');
    setPreferredSkillsStr('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setEmploymentType(job.employment_type);
    setMinExp(job.min_experience_years);
    setDegree(job.required_degree);
    setDescription(job.description);
    setRequiredSkillsStr(job.required_skills.join(', '));
    setPreferredSkillsStr(job.preferred_skills.join(', '));
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a job title and description.');
      return;
    }

    const reqSkills = requiredSkillsStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const prefSkills = preferredSkillsStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (reqSkills.length === 0) {
      setError('Please enter at least one required skill.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: Partial<Job> = {
        title,
        department,
        location,
        employment_type: employmentType,
        min_experience_years: minExp,
        required_degree: degree,
        description,
        required_skills: reqSkills,
        preferred_skills: prefSkills,
      };

      if (editingJob) {
        await api.updateJob(editingJob.id, payload);
      } else {
        await api.createJob(payload);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save job opening');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this requisition opening and its candidates?')) {
      return;
    }

    try {
      await api.deleteJob(jobId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-electric">
            REQUISITION MANAGEMENT & CRITERIA SPECIFICATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Job Openings
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Specify mandatory competencies, preferred qualifications, and minimum experience thresholds.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white px-5 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Create New Requisition</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by title, department, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 text-navy-900 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder:text-slate-400 shadow-xs"
        />
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white p-14 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold text-navy-900">No requisitions located</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a requisition to start parsing and ranking applicant resumes.
          </p>
          <button
            onClick={openCreateModal}
            className="text-xs font-semibold uppercase bg-electric hover:bg-electric-hover text-white px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
          >
            Create First Requisition
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="bg-white border border-slate-200/80 hover:border-electric/50 hover:shadow-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-5 cursor-pointer group transition-all duration-300 shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-electric/10 text-electric">
                      {job.department}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-navy-900 group-hover:text-electric transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-1.5 text-slate-400 hover:text-electric hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit job requisition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(job.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete job requisition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min {job.min_experience_years} Years</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[180px]">{job.required_degree}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Mandatory Competencies ({job.required_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-[#EFF2FC] text-[#2E4374] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-500">
                  <Users className="w-4 h-4 text-electric" />
                  <span>
                    <strong className="text-navy-900">{job.candidate_count ?? 0}</strong> applicants (
                    <span className="text-emerald-700 font-semibold">{job.shortlisted_count ?? 0}</span> shortlisted)
                  </span>
                </div>

                <span className="text-electric flex items-center space-x-1 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Inspect Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requisition Create/Edit Modal — Dark Navy */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0B1528] border border-blue-900/60 max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
              <h3 className="text-xl font-bold text-white font-display">
                {editingJob ? 'Edit Requisition Opening' : 'Create New Requisition Opening'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                    Min Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={minExp}
                    onChange={(e) => setMinExp(Number(e.target.value))}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                  Required Degree
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-[11px] text-slate-400 block mb-1">
                  Job Description & Context *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the role responsibilities and technical expectations..."
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-[11px] text-cyan-400 block mb-1">
                  Required Mandatory Skills * (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={requiredSkillsStr}
                  onChange={(e) => setRequiredSkillsStr(e.target.value)}
                  placeholder="python, pytorch, sql, scikit-learn"
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-[11px] text-blue-400 block mb-1">
                  Preferred / Nice-to-Have Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={preferredSkillsStr}
                  onChange={(e) => setPreferredSkillsStr(e.target.value)}
                  placeholder="docker, kubernetes, aws, fastapi"
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-blue-900/60 rounded-xl bg-[#070D1E] text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {loading ? 'Saving...' : editingJob ? 'Update Requisition' : 'Create Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
