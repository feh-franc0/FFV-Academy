'use client';

/**
 * CodePlayground — editor + runtime client-side, zero backend.
 *
 * Linguagens suportadas: 'python' (via Pyodide CDN), 'ts' e 'js' (via esbuild-wasm CDN para TS → JS, eval nativo para JS).
 * Runtime é carregado sob demanda no primeiro Run e cacheado em `window` pra sessão.
 * Nenhuma dep npm nova: `<textarea>` editável com Tab-aware + syntax display via sugar-high.
 *
 * Uso em artigo:
 *   <CodePlayground lang="python" initial={`print(sum([1,2,3]))`} />
 */

import { useEffect, useRef, useState } from 'react';
import { highlight } from 'sugar-high';
import { Play, Loader2, RotateCcw, Terminal } from 'lucide-react';

type Lang = 'python' | 'ts' | 'js';

type OutputLine = { kind: 'log' | 'error' | 'info'; text: string };

// URLs de CDN dos runtimes. Versões pinadas para reprodutibilidade.
const PYODIDE_VERSION = 'v0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const ESBUILD_WASM_URL = 'https://esm.sh/esbuild-wasm@0.24.0/esm/browser.js';
const ESBUILD_WASM_BINARY = 'https://esm.sh/esbuild-wasm@0.24.0/esbuild.wasm';

type PyodideApi = {
  runPython: (code: string) => unknown;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

type EsbuildModule = {
  initialize: (opts: { wasmURL: string; worker: boolean }) => Promise<void>;
  transform: (code: string, opts: { loader: string; target: string }) => Promise<{ code: string }>;
};

type GlobalWithRuntimes = Window & {
  __ffvPyodide?: PyodideApi;
  __ffvPyodidePromise?: Promise<PyodideApi>;
  __ffvEsbuildReady?: Promise<EsbuildModule>;
  loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideApi>;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(s);
  });
}

async function getPyodide(): Promise<PyodideApi> {
  const g = window as GlobalWithRuntimes;
  if (g.__ffvPyodide) return g.__ffvPyodide;
  if (g.__ffvPyodidePromise) return g.__ffvPyodidePromise;
  g.__ffvPyodidePromise = (async () => {
    await loadScript(PYODIDE_URL);
    if (!g.loadPyodide) throw new Error('Pyodide não expôs loadPyodide');
    const py = await g.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    g.__ffvPyodide = py;
    return py;
  })();
  return g.__ffvPyodidePromise;
}

async function getEsbuild(): Promise<EsbuildModule> {
  const g = window as GlobalWithRuntimes;
  if (g.__ffvEsbuildReady) return g.__ffvEsbuildReady;
  g.__ffvEsbuildReady = (async () => {
    const mod = (await import(/* webpackIgnore: true */ ESBUILD_WASM_URL)) as EsbuildModule;
    await mod.initialize({ wasmURL: ESBUILD_WASM_BINARY, worker: false });
    return mod;
  })();
  return g.__ffvEsbuildReady;
}

const LANG_LABEL: Record<Lang, string> = {
  python: 'Python',
  ts: 'TypeScript',
  js: 'JavaScript',
};

export function CodePlayground({
  lang,
  initial,
  height = 240,
  accent = 'var(--ffv-blue)',
  title,
}: {
  lang: Lang;
  initial: string;
  height?: number;
  accent?: string;
  title?: string;
}) {
  const [code, setCode] = useState(initial);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [bootStage, setBootStage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sincroniza scroll do overlay com textarea
  const highlightRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    if (!ta || !hl) return;
    const syncScroll = () => {
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
    };
    ta.addEventListener('scroll', syncScroll);
    return () => ta.removeEventListener('scroll', syncScroll);
  }, []);

  function reset() {
    setCode(initial);
    setOutput([]);
  }

  function appendOutput(kind: OutputLine['kind'], text: string) {
    setOutput(prev => [...prev, { kind, text }]);
  }

  async function run() {
    setRunning(true);
    setOutput([]);
    try {
      if (lang === 'python') {
        setBootStage('Carregando Pyodide (primeiro uso ~10MB, depois cache)…');
        const py = await getPyodide();
        setBootStage(null);
        py.setStdout({ batched: s => appendOutput('log', s) });
        py.setStderr({ batched: s => appendOutput('error', s) });
        try {
          const result = py.runPython(code);
          if (result !== undefined && result !== null) {
            appendOutput('info', `→ ${String(result)}`);
          }
        } catch (e) {
          appendOutput('error', e instanceof Error ? e.message : String(e));
        }
      } else if (lang === 'ts' || lang === 'js') {
        let jsCode = code;
        if (lang === 'ts') {
          setBootStage('Carregando esbuild-wasm (primeiro uso ~3MB)…');
          const esb = await getEsbuild();
          setBootStage(null);
          const res = await esb.transform(code, {
            loader: 'ts',
            target: 'es2020',
          });
          jsCode = res.code;
        }
        const logs: OutputLine[] = [];
        const fakeConsole = {
          log: (...args: unknown[]) => logs.push({ kind: 'log', text: args.map(stringify).join(' ') }),
          info: (...args: unknown[]) => logs.push({ kind: 'info', text: args.map(stringify).join(' ') }),
          warn: (...args: unknown[]) => logs.push({ kind: 'info', text: args.map(stringify).join(' ') }),
          error: (...args: unknown[]) => logs.push({ kind: 'error', text: args.map(stringify).join(' ') }),
        };
        try {
          const fn = new Function('console', `"use strict";\n${jsCode}`);
          const result = fn(fakeConsole);
          for (const line of logs) appendOutput(line.kind, line.text);
          if (result !== undefined) appendOutput('info', `→ ${stringify(result)}`);
        } catch (e) {
          for (const line of logs) appendOutput(line.kind, line.text);
          appendOutput('error', e instanceof Error ? e.message : String(e));
        }
      }
    } catch (e) {
      setBootStage(null);
      appendOutput('error', e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter → Run
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!running) run();
      return;
    }
    // Tab → 2 espaços
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = code.slice(0, start);
      const after = code.slice(end);
      const INDENT = '  ';
      const next = before + INDENT + after;
      setCode(next);
      // Reposicionar cursor
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + INDENT.length;
      });
    }
  }

  const highlighted = lang === 'python' ? code : highlight(code);

  return (
    <div
      className="rounded-xl overflow-hidden my-4"
      style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 gap-2 flex-wrap"
        style={{
          background: `color-mix(in srgb, ${accent} 10%, var(--ffv-bg2))`,
          borderBottom: `1px solid ${accent}20`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-mono uppercase tracking-wider font-semibold"
            style={{ color: accent }}
          >
            ▶ {LANG_LABEL[lang]}
          </span>
          {title && (
            <span
              className="text-xs truncate"
              style={{ color: 'var(--ffv-muted)' }}
            >
              · {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            aria-label="Resetar código"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--ffv-bg3)',
              border: '1px solid var(--ffv-border)',
              color: 'var(--ffv-muted)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">Resetar</span>
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold"
            style={{
              background: running ? 'var(--ffv-bg3)' : accent,
              color: running ? 'var(--ffv-muted)' : '#0d1117',
              border: `1px solid ${accent}`,
              cursor: running ? 'not-allowed' : 'pointer',
              minWidth: 68,
            }}
          >
            {running ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
            <span>{running ? 'Rodando…' : 'Rodar'}</span>
          </button>
        </div>
      </div>

      {/* Editor (textarea + overlay com highlight) */}
      <div className="relative" style={{ height }}>
        <pre
          ref={highlightRef}
          aria-hidden
          className="absolute inset-0 overflow-auto p-3 text-xs leading-5 pointer-events-none whitespace-pre"
          style={{
            fontFamily: 'var(--font-roboto-mono), ui-monospace, Menlo, monospace',
            color: 'var(--foreground)',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          className="absolute inset-0 w-full h-full p-3 text-xs leading-5 resize-none outline-none whitespace-pre"
          style={{
            fontFamily: 'var(--font-roboto-mono), ui-monospace, Menlo, monospace',
            background: 'transparent',
            color: lang === 'python' ? 'var(--foreground)' : 'transparent',
            caretColor: 'var(--foreground)',
            border: 'none',
            tabSize: 2,
          }}
          aria-label={`Editor ${LANG_LABEL[lang]}`}
        />
      </div>

      {/* Hint */}
      <div
        className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-mono"
        style={{
          background: 'var(--ffv-bg3)',
          color: 'var(--ffv-muted)',
          borderTop: '1px solid var(--ffv-border)',
        }}
      >
        <span>⌘/Ctrl + Enter pra rodar</span>
        <span>·</span>
        <span>Tab = 2 espaços</span>
      </div>

      {/* Output */}
      {(bootStage || output.length > 0) && (
        <div
          className="p-3 text-xs font-mono overflow-auto"
          style={{
            background: 'var(--ffv-bg)',
            borderTop: `1px solid ${accent}20`,
            maxHeight: 200,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--ffv-muted)' }}>
            <Terminal size={10} />
            <span>Saída</span>
          </div>
          {bootStage && (
            <p className="text-[11px] mb-2" style={{ color: 'var(--ffv-muted)' }}>
              ⏳ {bootStage}
            </p>
          )}
          {output.map((line, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap leading-5"
              style={{
                color:
                  line.kind === 'error' ? 'var(--ffv-red)' :
                  line.kind === 'info' ? accent : 'var(--foreground)',
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function stringify(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
