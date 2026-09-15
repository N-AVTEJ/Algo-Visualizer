import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import { Copy, Check, Code2, Download } from 'lucide-react';

export interface CodeDisplayProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  language = 'python',
  title,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState('');

  useEffect(() => {
    const grammar =
      Prism.languages[language] || Prism.languages.python || Prism.languages.javascript;
    const highlighted = Prism.highlight(code.trim(), grammar, language);
    setHighlightedHtml(highlighted);
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const handleDownload = () => {
    try {
      const ext = language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js';
      const cleanTitle = (title || 'algorithm').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const filename = `${cleanTitle}.${ext}`;
      const blob = new Blob([code.trim()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      // Ignore download failure
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex flex-col">
      {/* Code Viewer Header */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80 inline-block" />
          </div>
          {title ? (
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-violet-400" />
              <span>{title}</span>
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-400 lowercase">{language}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center space-x-1 transition-colors border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-violet-400"
            title="Download algorithm script"
          >
            {downloaded ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-slate-400" />
                <span>Export</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center space-x-1 transition-colors border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-violet-400"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-200">
        <div className="flex">
          {showLineNumbers && (
            <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 space-y-0.5">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre className={`pl-4 overflow-x-auto flex-1 font-mono focus:outline-none`} tabIndex={0}>
            <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeDisplay;
