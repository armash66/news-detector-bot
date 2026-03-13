"use client";

import React, { useEffect, useState } from 'react';

type TreeNode = {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    node_type: "Origin" | "Propagation";
    parent_id: string | null;
};

interface NarrativeTreeProps {
    narrativeId: string;
    topic: string;
    onBack: () => void;
}

export default function NarrativeTree({ narrativeId, topic, onBack }: NarrativeTreeProps) {
    const [nodes, setNodes] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/v1/narratives/${narrativeId}/tree`);
                if (!res.ok) throw new Error("Failed to fetch narrative tree");
                const data = await res.json();
                setNodes(data.nodes || []);
            } catch (e) {
                console.error("Error loading tree:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [narrativeId]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[70vh]">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest font-semibold"
                >
                    ← Back to Clusters
                </button>
                <div className="text-right">
                    <h2 className="text-lg font-bold text-indigo-400">{topic}</h2>
                    <p className="text-[10px] text-slate-500 uppercase font-mono mt-1">NARRATIVE ORIGIN TRACING (ID: {narrativeId.slice(0, 8)})</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-slate-500 text-sm">Reconstructing propagation path...</p>
                </div>
            ) : nodes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                    <p className="text-slate-500 text-sm italic">No propagation data available for this cluster.</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Visual Connector Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800 z-0"></div>

                    <div className="space-y-12 relative z-10">
                        {nodes.map((node, index) => (
                            <div key={node.id} className="flex gap-6 items-start group">
                                {/* Node Indicator */}
                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 bg-slate-900 shrink-0 ${node.node_type === 'Origin' ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-slate-700'
                                    }`}>
                                    {node.node_type === 'Origin' ? (
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    )}

                                    {/* Propagation Link Arrow */}
                                    {index < nodes.length - 1 && (
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-700">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex-1 p-4 rounded-md border ${node.node_type === 'Origin' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-950 border-slate-800'
                                    } hover:border-slate-600 transition-all cursor-default`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${node.node_type === 'Origin' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                            {node.node_type}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(node.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium mb-1">{node.title}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Source: <span className="text-slate-400">{node.source}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
