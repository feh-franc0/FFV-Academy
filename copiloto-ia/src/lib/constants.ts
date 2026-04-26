export interface Customer {
  id: string
  name: string
  firstName: string
  email: string
  plan: 'Starter' | 'Pro' | 'Enterprise'
  status: 'paid' | 'overdue' | 'pending'
  value: string
  days: number
  phone: string
}

export const CUSTOMERS: Customer[] = [
  { id: '123', name: 'João Santos',        firstName: 'João',     email: 'joao@acmecorp.com',          plan: 'Pro',        status: 'overdue', value: 'R$ 1.240,00', days: 32, phone: '+55 11 99234-5678' },
  { id: '124', name: 'Maria Oliveira',     firstName: 'Maria',    email: 'maria@techsolutions.io',      plan: 'Starter',    status: 'paid',    value: 'R$ 490,00',   days: 0,  phone: '+55 21 98765-4321' },
  { id: '125', name: 'Acme Corp',          firstName: 'Acme',     email: 'financeiro@acme.com',         plan: 'Enterprise', status: 'pending', value: 'R$ 4.800,00', days: 5,  phone: '+55 11 94321-8765' },
  { id: '126', name: 'Rafael Lima',        firstName: 'Rafael',   email: 'rafael@startupxyz.com',       plan: 'Pro',        status: 'paid',    value: 'R$ 890,00',   days: 0,  phone: '+55 31 97654-3210' },
  { id: '127', name: 'Carla Mendes',       firstName: 'Carla',    email: 'carla@designstudio.com',      plan: 'Starter',    status: 'overdue', value: 'R$ 290,00',   days: 14, phone: '+55 11 96543-2109' },
  { id: '128', name: 'Tech Solutions Ltda',firstName: 'Tech',     email: 'admin@techsolutions.io',      plan: 'Enterprise', status: 'paid',    value: 'R$ 6.200,00', days: 0,  phone: '+55 11 95432-1098' },
  { id: '129', name: 'Pedro Alves',        firstName: 'Pedro',    email: 'pedro.alves@gmail.com',       plan: 'Starter',    status: 'pending', value: 'R$ 290,00',   days: 2,  phone: '+55 85 94321-0987' },
  { id: '130', name: 'Fernanda Costa',     firstName: 'Fernanda', email: 'fernanda@fcprojetos.com',     plan: 'Pro',        status: 'paid',    value: 'R$ 890,00',   days: 0,  phone: '+55 48 93210-9876' },
]

export const STATS = [
  { label: 'Total de clientes', value: '1.284', delta: '+12 esse mês',           up: true  },
  { label: 'Inadimplentes',     value: '47',    delta: '+3 essa semana',          up: false },
  { label: 'Faturamento (mês)', value: 'R$ 89.4k', delta: '+8.2% vs mês anterior', up: true },
  { label: 'Faturas em aberto', value: '138',   delta: '23 vencidas',             up: false },
]

export const DEFAULT_CUSTOMER = CUSTOMERS[0]
