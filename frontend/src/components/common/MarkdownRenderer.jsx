import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function MarkdownRenderer({ content }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeSanitize]}
            components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-black text-white mt-10 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mt-6 mb-3" {...props} />,
                a: ({node, ...props}) => <a className="text-[#34d99a] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-black/50 border border-white/5 rounded-2xl p-5 my-6 font-mono text-xs text-mint overflow-x-auto leading-relaxed" {...props} />,
                code: ({node, inline, ...props}) => inline ? <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs text-mint" {...props} /> : <code {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#34d99a] bg-white/[0.02] pl-5 py-2 my-6 italic text-[#b0b3c0]" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-6 my-4 space-y-2 text-[#b0b3c0]" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-4 space-y-2 text-[#b0b3c0]" {...props} />,
                li: ({node, ...props}) => <li className="text-[#b0b3c0]" {...props} />,
                p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-[#b0b3c0]" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-8"><table className="w-full text-left border-collapse border border-white/10" {...props} /></div>,
                th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 px-4 py-3 font-bold text-white" {...props} />,
                td: ({node, ...props}) => <td className="border border-white/10 px-4 py-3 text-[#b0b3c0]" {...props} />,
            }}
        >
            {content || ''}
        </ReactMarkdown>
    );
}
