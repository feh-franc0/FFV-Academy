'use client'

import {
  LayoutDashboard, Users, FileText, BarChart2, Settings,
  Bell, Search, ChevronRight, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, Filter, MoreHorizontal,
  Sparkles, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { CUSTOMERS, STATS, type Customer } from '@/lib/constants'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Users,           label: 'Clientes'  },
  { icon: FileText,        label: 'Financeiro' },
  { icon: BarChart2,       label: 'Relatórios' },
  { icon: Settings,        label: 'Configurações' },
]

function StatusBadge({ status, days }: { status: string; days: number }) {
  if (status === 'paid') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3" /> Pago
    </span>
  )
  if (status === 'overdue') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
      <AlertCircle className="w-3 h-3" /> {days}d atraso
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
      <Clock className="w-3 h-3" /> Pendente
    </span>
  )
}

function PlanBadge({ plan }: { plan: Customer['plan'] }) {
  return (
    <span className={clsx(
      'text-xs font-medium px-2 py-0.5 rounded-full',
      plan === 'Enterprise' ? 'bg-violet-500/15 text-violet-400' :
      plan === 'Pro'        ? 'bg-blue-500/15 text-blue-400' :
                              'bg-slate-700/60 text-slate-400'
    )}>
      {plan}
    </span>
  )
}

interface Props {
  onSelectCustomer?: (customer: Customer) => void
  selectedCustomerId?: string | null
}

export default function FakeSystem({ onSelectCustomer, selectedCustomerId }: Props) {
  const [search, setSearch]     = useState('')
  const [activeNav, setActiveNav] = useState('Clientes')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRowClick = (customer: Customer) => {
    onSelectCustomer?.(customer)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">

      {/* ── Mobile sidebar overlay ────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={clsx(
        'fixed sm:static inset-y-0 left-0 z-50 w-56 flex-shrink-0',
        'bg-slate-900 border-r border-slate-800 flex flex-col',
        'transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
      )}>
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">SistemaX</p>
              <p className="text-[10px] text-slate-500 mt-0.5">v4.2.1</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="sm:hidden text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeNav === item.label
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              FF
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">Fernando Franco</p>
              <p className="text-[10px] text-slate-500 truncate">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 sm:px-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 flex-shrink-0">
            <span>SistemaX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300 font-medium">{activeNav}</span>
          </div>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar clientes..."
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              FF
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">

          {/* Stats — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
                <p className="text-xs text-slate-500 mb-1 leading-tight">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-100 mb-1">{stat.value}</p>
                <div className={clsx('flex items-center gap-1 text-xs', stat.up ? 'text-emerald-400' : 'text-red-400')}>
                  {stat.up ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate">{stat.delta}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-200">Lista de Clientes</p>
                <p className="text-xs text-slate-500 mt-0.5">{filtered.length} clientes encontrados</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-slate-800 text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                <span>Cliente</span><span>Email</span><span>Plano</span>
                <span>Valor</span><span>Status</span><span />
              </div>

              <div className="divide-y divide-slate-800/50">
                {filtered.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => handleRowClick(customer)}
                    className={clsx(
                      'grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 items-center',
                      'hover:bg-slate-800/40 transition-colors cursor-pointer group',
                      customer.status === 'overdue' && 'bg-red-500/[0.03]',
                      selectedCustomerId === customer.id && 'ring-1 ring-inset ring-blue-500/40 bg-blue-500/5',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{customer.name}</p>
                      <p className="text-xs text-slate-500">#{customer.id}</p>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{customer.email}</p>
                    <PlanBadge plan={customer.plan} />
                    <p className="text-sm text-slate-300 font-medium">{customer.value}</p>
                    <StatusBadge status={customer.status} days={customer.days} />
                    <button
                      onClick={e => { e.stopPropagation(); handleRowClick(customer) }}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap px-2 py-1 rounded-lg hover:bg-blue-500/10"
                      aria-label={`Analisar ${customer.name} com Aria`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Aria
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-800/50">
              {filtered.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleRowClick(customer)}
                  className={clsx(
                    'px-4 py-3.5 flex items-center gap-3 cursor-pointer active:bg-slate-800/60 transition-colors',
                    selectedCustomerId === customer.id && 'bg-blue-500/5 border-l-2 border-blue-500',
                  )}
                >
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    customer.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    customer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {customer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{customer.name}</p>
                      <PlanBadge plan={customer.plan} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500">{customer.value}</p>
                      <StatusBadge status={customer.status} days={customer.days} />
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); handleRowClick(customer) }}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-400 border border-blue-500/30 px-2.5 py-1.5 rounded-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    Aria
                  </button>
                </div>
              ))}
            </div>
          </div>

          {onSelectCustomer && (
            <p className="text-center text-[11px] text-slate-600 mt-4">
              Clique em qualquer cliente para analisar com a Aria · Dados fictícios para demonstração
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
