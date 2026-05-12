'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  X, Send, Square, Download, CheckCheck, Sparkles,
  ChevronDown, FileSpreadsheet, PhoneForwarded, Loader2, RotateCcw,
  Zap, Type,
} from 'lucide-react'
import clsx from 'clsx'
import {
  flows,
  matchFlow,
  buildConfirmFlowSteps,
  buildCobrancaSteps,
  buildExcelSteps,
  type ChatMessage,
  type FlowStep,
} from '@/lib/flows'
import { type Customer } from '@/lib/constants'

// ——————————————————————————————————————
// Utilities
// ——————————————————————————————————————

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const newId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const fmt   = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Streaming constants — batch chars to reduce render count
const STREAM_CHUNK = 4
const STREAM_DELAY = 22

// ——————————————————————————————————————
// Sub-components
// ——————————————————————————————————————

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-0.5 py-0.5 h-5" aria-label="Bot digitando">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function LoaderRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400 py-0.5" aria-label={label}>
      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0" />
      <span className="italic">{label}</span>
    </div>
  )
}

function FileCard({ file }: { file: ChatMessage['file'] & {} }) {
  const [clicked, setClicked] = useState(false)
  return (
    <div className="mt-2 flex items-center gap-3 bg-slate-700/50 rounded-xl px-3 py-2.5 border border-slate-600/40" data-testid="file-card">
      <div className="flex-shrink-0 w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">
        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{file.size}{file.rows ? ` · ${file.rows} linhas` : ''}</p>
      </div>
      <button
        onClick={() => setClicked(true)}
        aria-label={clicked ? 'Arquivo baixado' : 'Baixar arquivo'}
        className={clsx(
          'flex-shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all',
          clicked
            ? 'bg-emerald-500/15 text-emerald-400 cursor-default'
            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
        )}
      >
        {clicked ? <CheckCheck className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        {clicked ? 'Baixado' : 'Baixar'}
      </button>
    </div>
  )
}

function ActionCard({
  action, onConfirm, onCancel, resolvedAs,
}: {
  action: NonNullable<ChatMessage['action']>
  onConfirm: () => void
  onCancel: () => void
  resolvedAs: 'confirmed' | 'cancelled' | null
}) {
  return (
    <div className="mt-2 rounded-xl border border-slate-600/50 overflow-hidden" data-testid="action-card">
      <div className="bg-slate-700/50 px-3.5 py-2.5">
        <p className="text-sm font-semibold text-slate-100">{action.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{action.subtitle}</p>
      </div>
      <div className="bg-slate-800/50 px-3.5 py-2.5 space-y-1.5">
        {action.preview.map((line, i) => (
          <p key={i} className="text-xs text-slate-300 leading-relaxed">{line}</p>
        ))}
      </div>
      {resolvedAs === null ? (
        <div className="flex gap-2 px-3.5 py-2.5 bg-slate-700/30 border-t border-slate-600/40">
          <button onClick={onConfirm} data-testid="action-confirm"
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors">
            {action.confirmLabel}
          </button>
          <button onClick={onCancel} data-testid="action-cancel"
            className="flex-1 bg-slate-600/50 hover:bg-slate-600 text-slate-300 text-sm font-medium py-1.5 rounded-lg transition-colors">
            {action.cancelLabel}
          </button>
        </div>
      ) : (
        <div data-testid="action-resolved" className={clsx(
          'flex items-center gap-1.5 px-3.5 py-2 border-t border-slate-600/40 text-xs font-medium',
          resolvedAs === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-500'
        )}>
          {resolvedAs === 'confirmed'
            ? <><CheckCheck className="w-3.5 h-3.5" /> Confirmado</>
            : <><X className="w-3.5 h-3.5" /> Cancelado</>}
        </div>
      )}
    </div>
  )
}

function TransferCard({ transfer }: { transfer: NonNullable<ChatMessage['transfer']> }) {
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 2500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="mt-2 rounded-xl border border-slate-600/50 overflow-hidden" data-testid="transfer-card">
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-3.5 py-2 flex items-center gap-2">
        <PhoneForwarded className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-xs font-medium text-blue-300">
          {connected ? 'Conectado com especialista' : 'Transferindo conversa...'}
        </span>
        {connected
          ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
          : <Loader2 className="w-3 h-3 animate-spin text-blue-400 ml-auto" />}
      </div>
      <div className="bg-slate-800/50 px-3.5 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {transfer.avatarInitials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-100">{transfer.agentName}</p>
          <p className="text-xs text-slate-400">{transfer.agentRole}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">Tempo estimado</p>
          <p className="text-sm font-medium text-slate-300">{transfer.estimatedTime}</p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  msg, resolvedAs, onConfirm, onCancel, onQuickReply, isBotBusy, hasUserMessageAfter,
}: {
  msg: ChatMessage
  resolvedAs: 'confirmed' | 'cancelled' | null
  onConfirm: (flowId: string) => void
  onCancel: () => void
  onQuickReply: (text: string) => void
  isBotBusy: boolean
  hasUserMessageAfter: boolean
}) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
      data-testid={isUser ? 'message-user' : 'message-bot'}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-0.5">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}

      <div className={clsx('flex flex-col gap-1', isUser ? 'items-end max-w-[80%]' : 'items-start max-w-[85%]')}>
        {msg.text !== undefined && (
          <div className={clsx(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm',
          )}>
            {isUser ? (
              <p>{msg.text}</p>
            ) : (
              <div className="chat-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text ?? ''}</ReactMarkdown>
                {msg.streaming && (
                  <span className="animate-pulse text-blue-400 ml-0.5 inline-block" aria-hidden="true">▋</span>
                )}
              </div>
            )}
          </div>
        )}

        {msg.citation && !msg.streaming && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 rounded-lg border border-slate-700/50" data-testid="message-citation">
            <span className="text-[10px] text-slate-500">📄</span>
            <span className="text-[10px] text-slate-500">{msg.citation}</span>
          </div>
        )}

        {msg.file && <FileCard file={msg.file} />}

        {msg.action && (
          <ActionCard
            action={msg.action}
            resolvedAs={resolvedAs}
            onConfirm={() => onConfirm(msg.action!.confirmFlowId)}
            onCancel={onCancel}
          />
        )}

        {msg.transfer && <TransferCard transfer={msg.transfer} />}

        {/* Quick replies disappear after the user sends a new message */}
        {msg.quickReplies && !msg.streaming && resolvedAs === null && !hasUserMessageAfter && (
          <div className="flex flex-wrap gap-1.5 mt-1" data-testid="quick-replies">
            {msg.quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => onQuickReply(reply)}
                disabled={isBotBusy}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-full border transition-all',
                  isBotBusy
                    ? 'border-slate-700 text-slate-600 cursor-not-allowed opacity-50'
                    : 'border-slate-600 text-slate-300 hover:border-blue-500/60 hover:text-blue-300 hover:bg-blue-500/5 active:scale-95'
                )}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <p className={clsx('text-[10px] text-slate-600 px-1', isUser ? 'text-right' : 'text-left')}>
          {fmt(msg.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}

// ——————————————————————————————————————
// Main widget
// ——————————————————————————————————————

interface WidgetProps {
  selectedCustomer?: Customer | null
}

export default function CopilotWidget({ selectedCustomer }: WidgetProps) {
  const [isOpen,           setIsOpen]           = useState(false)
  const [messages,         setMessages]         = useState<ChatMessage[]>([])
  const [botState,         setBotState]         = useState<'idle' | 'typing' | 'loading'>('idle')
  const [loaderLabel,      setLoaderLabel]      = useState('')
  const [inputValue,       setInputValue]       = useState('')
  const [showProactive,    setShowProactive]    = useState(false)
  const [resolvedActions,  setResolvedActions]  = useState<Record<string, 'confirmed' | 'cancelled'>>({})
  const [isBotBusy,        setIsBotBusy]        = useState(false)
  const [streamingEnabled, setStreamingEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aria-streaming') !== 'false'
    }
    return true
  })

  const messagesEndRef     = useRef<HTMLDivElement>(null)
  const inputRef           = useRef<HTMLInputElement>(null)
  const isBusyRef          = useRef(false)
  const hasGreetedRef      = useRef(false)
  const currentCustomerRef = useRef<Customer | null>(null)
  const stopRef            = useRef<() => void>(() => {})
  const streamingRef       = useRef(streamingEnabled)

  const setBusy = useCallback((val: boolean) => {
    isBusyRef.current = val
    setIsBotBusy(val)
  }, [])

  useEffect(() => { streamingRef.current = streamingEnabled }, [streamingEnabled])

  const toggleStreaming = useCallback(() => {
    setStreamingEnabled(prev => {
      const next = !prev
      localStorage.setItem('aria-streaming', String(next))
      return next
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, botState])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    const t = setTimeout(() => {
      setShowProactive(open => open || !isOpen)
    }, 10000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOpen && !hasGreetedRef.current) {
      hasGreetedRef.current = true
      void runNamedFlow('saudacao')
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Customer click-to-analyze ─────────────────────────────────

  useEffect(() => {
    if (!selectedCustomer) return
    void analyzeCustomer(selectedCustomer)
  }, [selectedCustomer]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Message helpers ──────────────────────────────────────────

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    const id = newId()
    setMessages(prev => [...prev, { ...msg, id, timestamp: new Date() }])
    return id
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [])

  // ── Flow execution engine ─────────────────────────────────────
  // Uses a local `stopped` flag; stopRef.current() sets it true.
  // Batches streaming in STREAM_CHUNK chars every STREAM_DELAY ms to
  // reduce render count (was 1 render/char, now 1 render/4 chars).

  const executeSteps = useCallback(async (steps: FlowStep[]) => {
    let stopped = false
    stopRef.current = () => { stopped = true }

    try {
      for (const step of steps) {
        if (stopped) break

        if (step.type === 'typing') {
          setBotState('typing')
          await sleep(step.duration)
          if (stopped) break
          setBotState('idle')
        } else if (step.type === 'loader') {
          setBotState('loading')
          setLoaderLabel(step.label)
          await sleep(step.duration)
          if (stopped) break
          setBotState('idle')
        } else if (step.type === 'message') {
          if (step.stream && step.text && streamingRef.current) {
            const msgId = addMessage({ role: 'bot', text: '', streaming: true })
            const full  = step.text
            for (let i = STREAM_CHUNK; i <= full.length + STREAM_CHUNK; i += STREAM_CHUNK) {
              if (stopped) break
              await sleep(STREAM_DELAY)
              updateMessage(msgId, { text: full.slice(0, Math.min(i, full.length)) })
            }
            updateMessage(msgId, {
              text: stopped ? undefined : full,
              streaming: false,
              citation:    stopped ? undefined : step.citation,
              quickReplies: stopped ? undefined : step.quickReplies,
            })
          } else {
            addMessage({
              role: 'bot',
              text:         step.text,
              citation:     step.citation,
              file:         step.file,
              action:       step.action,
              transfer:     step.transfer,
              quickReplies: step.quickReplies,
            })
          }
        }
      }
    } finally {
      setBusy(false)
      setBotState('idle')
    }
  }, [addMessage, updateMessage, setBusy])

  const runNamedFlow = useCallback(async (flowId: string) => {
    if (isBusyRef.current) return
    setBusy(true)
    const flow = flows.find(f => f.id === flowId)
    if (flow) await executeSteps(flow.steps)
    else setBusy(false)
  }, [executeSteps, setBusy])

  // ── Customer analysis ────────────────────────────────────────

  const analyzeCustomer = useCallback(async (customer: Customer) => {
    currentCustomerRef.current = customer
    hasGreetedRef.current = true  // suppress greeting when chat auto-opens

    // Stop any running flow and open the chat
    stopRef.current()
    setIsOpen(true)
    setShowProactive(false)

    await sleep(120)
    if (isBusyRef.current) await sleep(300)  // let previous flow wind down

    setBusy(true)

    const statusLine =
      customer.status === 'overdue'
        ? `⚠️ Em atraso há **${customer.days} dias** — ${customer.value} em aberto`
        : customer.status === 'pending'
        ? `🕐 Pagamento pendente (${customer.days}d) — ${customer.value}`
        : `✅ Em dia — ${customer.value}`

    const steps: FlowStep[] = [
      { type: 'typing', duration: 550 },
      {
        type: 'message',
        text: `Analisando **${customer.name}** (ID #${customer.id})\n\n${statusLine}\n📦 Plano: **${customer.plan}** · 📧 ${customer.email}\n\nO que deseja fazer?`,
        quickReplies: customer.status !== 'paid'
          ? ['Enviar cobrança', 'Gerar Excel', 'Falar com humano']
          : ['Gerar Excel', 'Como dou baixa em fatura?', 'Falar com humano'],
      },
    ]
    await executeSteps(steps)
  }, [executeSteps, setBusy])

  // ── User interactions ────────────────────────────────────────

  const handleUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isBusyRef.current) return
    setShowProactive(false)
    addMessage({ role: 'user', text })
    await sleep(80)
    setBusy(true)

    const flow  = matchFlow(text)
    let   steps = flow.steps

    // Use customer-contextual steps when applicable
    if (flow.id === 'enviar_cobranca') steps = buildCobrancaSteps(currentCustomerRef.current)
    if (flow.id === 'gerar_excel')     steps = buildExcelSteps(currentCustomerRef.current)

    await executeSteps(steps)
  }, [addMessage, executeSteps, setBusy])

  const handleConfirm = useCallback(async (msgId: string, confirmFlowId: string) => {
    if (isBusyRef.current) return
    setResolvedActions(prev => ({ ...prev, [msgId]: 'confirmed' }))
    const steps = buildConfirmFlowSteps(confirmFlowId, currentCustomerRef.current)
    if (steps.length > 0) {
      setBusy(true)
      await executeSteps(steps)
    }
  }, [executeSteps, setBusy])

  const handleCancel = useCallback(async (msgId: string) => {
    if (isBusyRef.current) return
    setResolvedActions(prev => ({ ...prev, [msgId]: 'cancelled' }))
    setBusy(true)
    setBotState('typing')
    await sleep(650)
    setBotState('idle')
    addMessage({ role: 'bot', text: 'Tudo bem, cancelei. 👍 Posso te ajudar com mais alguma coisa?' })
    setBusy(false)
  }, [addMessage, setBusy])

  const handleStop = useCallback(() => {
    stopRef.current()
  }, [])

  const handleProactiveClick = useCallback(() => {
    setShowProactive(false)
    setIsOpen(true)
    setTimeout(() => void handleUserInput('Enviar cobrança para o cliente João Santos'), 600)
  }, [handleUserInput])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    void handleUserInput(text)
  }, [inputValue, handleUserInput])

  const handleReset = useCallback(() => {
    stopRef.current()
    setMessages([])
    setBusy(false)
    setBotState('idle')
    setResolvedActions({})
    hasGreetedRef.current     = false
    currentCustomerRef.current = null
    if (isOpen) setTimeout(() => void runNamedFlow('saudacao'), 100)
  }, [isOpen, runNamedFlow, setBusy])

  const handleOpen = useCallback(() => {
    setIsOpen(o => !o)
    setShowProactive(false)
  }, [])

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      {/* ── Proactive bubble ─────────────────────────────────── */}
      <AnimatePresence>
        {showProactive && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-[74px] right-3 sm:bottom-[88px] sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-auto sm:max-w-[300px]"
            data-testid="proactive-bubble"
          >
            <div className="relative">
              <div className="absolute -bottom-2 right-6 w-3 h-3 bg-slate-800 border-r border-b border-slate-700/60 rotate-45" />
              <div
                onClick={handleProactiveClick}
                data-testid="proactive-bubble-cta"
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleProactiveClick()}
                aria-label="Ver sugestão de cobrança"
                className="cursor-pointer bg-slate-800 border border-slate-700/60 rounded-2xl shadow-xl px-4 py-3 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-blue-400 mb-1">Aria · Sugestão</p>
                    <p className="text-sm text-slate-200 leading-snug">
                      <strong>João Santos</strong> está há 32 dias sem pagar. Quer enviar uma cobrança agora?
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setShowProactive(false) }}
                    aria-label="Fechar sugestão"
                    className="text-slate-600 hover:text-slate-400 flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ───────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="relative">
          {showProactive && !isOpen && (
            <div className="absolute inset-0 rounded-full ripple-ring pointer-events-none" />
          )}
          <motion.button
            onClick={handleOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="copilot-trigger"
            aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente Aria'}
            aria-expanded={isOpen}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="spark" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Chat panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            data-testid="chat-panel"
            role="dialog"
            aria-label="Assistente Aria"
            className={clsx(
              'fixed z-50 flex flex-col bg-slate-900 overflow-hidden',
              'border border-slate-700/70 shadow-2xl',
              'inset-x-0 bottom-0 rounded-t-2xl h-[92dvh]',
              'sm:inset-x-auto sm:bottom-[88px] sm:right-6 sm:w-[390px] sm:h-[600px] sm:rounded-2xl',
            )}
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-none">Aria</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {botState === 'typing'  ? 'digitando...' :
                   botState === 'loading' ? loaderLabel :
                   'Assistente de Operações · Online'}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={toggleStreaming}
                  data-testid="chat-streaming-toggle"
                  aria-label={streamingEnabled ? 'Modo digitando (clique para instantâneo)' : 'Modo instantâneo (clique para digitando)'}
                  title={streamingEnabled ? 'Digitando — clique para enviar instantâneo' : 'Instantâneo — clique para modo digitando'}
                  className={clsx(
                    'p-1.5 rounded-lg transition-all',
                    streamingEnabled
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  )}
                >
                  {streamingEnabled ? <Type className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                </button>
                <button onClick={handleReset} data-testid="chat-reset" aria-label="Reiniciar conversa"
                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} data-testid="chat-close" aria-label="Minimizar chat"
                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-scroll"
              data-testid="messages-area"
              role="log"
              aria-live="polite"
              aria-label="Mensagens"
            >
              {messages.length === 0 && botState === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Olá! Sou a Aria</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Sua assistente de operações. Pergunte sobre faturas, relatórios ou clique em um cliente na tabela.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                const hasUserMessageAfter = messages.slice(i + 1).some(m => m.role === 'user')
                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    resolvedAs={msg.action ? (resolvedActions[msg.id] ?? null) : null}
                    onConfirm={flowId => void handleConfirm(msg.id, flowId)}
                    onCancel={() => void handleCancel(msg.id)}
                    onQuickReply={text => void handleUserInput(text)}
                    isBotBusy={isBotBusy}
                    hasUserMessageAfter={hasUserMessageAfter}
                  />
                )
              })}

              <AnimatePresence>
                {botState !== 'idle' && (
                  <motion.div
                    key="bot-status"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    data-testid="bot-status"
                    className="flex items-end gap-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                      {botState === 'typing'  && <TypingDots />}
                      {botState === 'loading' && <LoaderRow label={loaderLabel} />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-3 py-3 bg-slate-800/60 border-t border-slate-700/60 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-2 bg-slate-700/40 rounded-xl px-3 py-2.5 border border-slate-600/30 focus-within:border-blue-500/40 transition-colors">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={isBotBusy ? 'Aria está processando...' : 'Pergunte algo, ex: como dou baixa em fatura...'}
                  disabled={isBotBusy}
                  data-testid="chat-input"
                  aria-label="Mensagem para Aria"
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none disabled:opacity-50 min-w-0"
                />
                {isBotBusy ? (
                  <button
                    onClick={handleStop}
                    data-testid="chat-stop"
                    aria-label="Parar resposta"
                    title="Parar"
                    className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-0.5"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    data-testid="chat-send"
                    aria-label="Enviar mensagem"
                    className="flex-shrink-0 text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors p-0.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-2">
                Aria · Protótipo v1 · Dados fictícios para demonstração
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
