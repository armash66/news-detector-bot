"use client";

import React, { useEffect, useState } from 'react';

type Source = {
    domain: string;
    reliability: number;
    bias: string;
    verified: boolean;
    last_audit: string;
};

export default function SourceAudit() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/sources/credibility');
                if (!res.ok) throw new Error("Failed to fetch source credibility");
                const data = await res.json();
                setSources(data.data || []);
            } catch (e) {
                console.error("Error loading sources:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSources();
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[70vh]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Global Source Credibility</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Automated Reliability Audits & Bias Analysis</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-md border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Total Sources Audited</p>
                    <p className="text-lg font-bold text-slate-200">{sources.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                                <th className="pb-4 font-semibold">Domain / Entity</th>
                                <th className="pb-4 font-semibold">Reliability</th>
                                <th className="pb-4 font-semibold">Bias Rating</th>
                                <th className="pb-4 font-semibold">Verified</th>
                                <th className="pb-4 font-semibold">Last Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {sources.map((source) => (
                                <tr key={source.domain} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {source.domain.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{source.domain}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${source.reliability > 0.7 ? 'bg-emerald-500' :
                                                            source.reliability > 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${source.reliability * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{(source.reliability * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${source.bias === 'Center' ? 'border-emerald-900 text-emerald-500 bg-emerald-500/5' :
                                                'border-slate-800 text-slate-400 bg-slate-800/10'
                                            }`}>
                                            {source.bias.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        {source.verified ? (
                                            <div className="flex items-center gap-1 text-emerald-500">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-[10px] font-bold uppercase">Audited</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 uppercase font-bold italic">Unverified</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-xs font-mono text-slate-500">
                                        {new Date(source.last_audit).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
