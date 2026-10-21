import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Tag,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';

const CATEGORIES = ['All', 'Eligibility', 'Documents', 'Disbursement', 'Verification', 'General'];

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDocId, setExpandedDocId] = useState(null);

  useEffect(() => {
    fetchKnowledgeDocs();
  }, [selectedCategory]);

  const fetchKnowledgeDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/rag/knowledge', { params });
      setDocs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load knowledge docs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKnowledgeDocs();
  };

  const triggerAIWithDoc = (docTitle) => {
    window.dispatchEvent(
      new CustomEvent('open-ai-advisor', {
        detail: { query: `Explain the guidelines for: ${docTitle}` },
      })
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Eligibility':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Documents':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Disbursement':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'Verification':
        return <Building className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Eligibility':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Documents':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Disbursement':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-10 shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>RAG Knowledge Base & Policy Repository</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Scholarship Policy Guidelines & Verification Standards
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Official gazette circulars, document compliance rubrics, Tehsildar issuing authority standards, and Direct Benefit Transfer (DBT) guidelines indexed for students, institution verifiers, and state administrators.
            </p>

            {/* Quick AI Search Trigger */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search income certificate validity, bonafide rules, DBT UTR, defect fixes..."
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Search Guidelines
              </button>
            </form>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Knowledge Documents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No matching policy documents found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search terms or select "All" categories to view all guidelines.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => {
              const isExpanded = expandedDocId === doc._id;
              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                          doc.category
                        )}`}
                      >
                        {getCategoryIcon(doc.category)}
                        {doc.category}
                      </span>
                      {doc.schemeCode && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.schemeCode}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug hover:text-indigo-600 transition-colors">
                      {doc.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {doc.summary || doc.content.substring(0, 140) + '...'}
                    </p>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 bg-slate-50/70 -mx-6 -mb-6 p-6 space-y-2 leading-relaxed">
                        <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">
                          {doc.content}
                        </pre>
                      </div>
                    )}

                    {/* Source Citation */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-3">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{doc.sourceRef}</span>
                    </div>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {doc.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedDocId(isExpanded ? null : doc._id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Read Full Guideline'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <button
                      onClick={() => triggerAIWithDoc(doc.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      title="Ask AI Advisor about this document"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
