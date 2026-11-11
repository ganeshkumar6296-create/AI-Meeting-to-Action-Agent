'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  ListTodo, 
  FileText, 
  Loader2, 
  Copy, 
  Check 
} from 'lucide-react';

const SAMPLE_TRANSCRIPT = `Rahul: Okay team, we need the new onboarding flow live by next Friday. Ganesh, can you own the frontend in Next.js?
Ganesh: Yes, I will deliver the UI components by Wednesday. But do we have the final Figma designs?
Priya: I uploaded them yesterday, but wait, marketing says we might remove step 2. Actually, let's keep step 2 for now, or maybe launch without it? We need to decide.
Rahul: Let's finalize step 2 tomorrow. Also, Amit, please prepare the backend auth endpoints by Thursday.
Amit: Thursday is tight because of DB migration, but I'll try. Also, who is handling the email verification service?
Rahul: Ganesh will handle it. Wait, actually Priya, you take email verification.
Ganesh: Got it, I will focus only on frontend components.`;

export default function Home() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');

      setResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListTodo className="text-indigo-400" /> AI Meeting-to-Action Agent
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Convert unstructured transcripts into decisions, tasks, owners, and detect contradictions.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">
              Meeting Transcript:
            </label>
            <button 
              onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Load Sample Transcript
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={7}
            placeholder="Paste your meeting notes or raw transcript here..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-200"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Analyzing Transcript...
                </>
              ) : (
                'Extract Actions & Insights'
              )}
            </button>
            {error && <span className="text-xs text-rose-400">{error}</span>}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            
            {/* Executive Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Executive Summary
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                {result.summary}
              </p>
            </div>

            {/* Action Items */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Action Items & Tasks
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Task</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Deadline</th>
                      <th className="p-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.action_items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-medium text-slate-200">{item.task}</td>
                        <td className="p-3">
                          <span className="bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                            {item.owner}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-xs">{item.deadline || 'Not specified'}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            item.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            item.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decisions, Questions & Contradictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Decisions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4 text-emerald-400" /> Key Decisions
                </h3>
                <ul className="space-y-2">
                  {result.decisions?.map((dec, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                      • {dec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unresolved Questions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-amber-400" /> Open Questions
                </h3>
                <ul className="space-y-2">
                  {result.unresolved_questions?.map((q, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                      ? {q}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contradictions */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Contradictions Detected
                </h3>
                <ul className="space-y-2">
                  {result.contradictions_and_ambiguities?.map((c, i) => (
                    <li key={i} className="text-xs bg-rose-950/20 border border-rose-900/50 p-2.5 rounded text-rose-200">
                      <strong className="block text-rose-300 mb-1">{c.issue}</strong>
                      <span className="text-slate-400">{c.context}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* JSON Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Structured JSON Output</span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}