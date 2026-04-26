import { CUSTOMERS, DEFAULT_CUSTOMER, type Customer } from './constants'

// ——————————————————————————————————————
// Types
// ——————————————————————————————————————

export type { Customer }
export type MessageRole = 'user' | 'bot'

export interface FileCardData {
  name: string
  size: string
  rows?: number
  fileType: 'xlsx' | 'pdf' | 'csv'
}

export interface ActionCardData {
  title: string
  subtitle: string
  preview: string[]
  confirmLabel: string
  cancelLabel: string
  confirmFlowId: string
}

export interface TransferCardData {
  agentName: string
  agentRole: string
  avatarInitials: string
  estimatedTime: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  text?: string
  streaming?: boolean
  citation?: string
  file?: FileCardData
  action?: ActionCardData
  transfer?: TransferCardData
  quickReplies?: string[]
  timestamp: Date
}

export type FlowStep =
  | { type: 'typing'; duration: number }
  | { type: 'loader'; duration: number; label: string }
  | {
      type: 'message'
      stream?: boolean
      text?: string
      citation?: string
      file?: FileCardData
      action?: ActionCardData
      transfer?: TransferCardData
      quickReplies?: string[]
    }

export interface Flow {
  id: string
  triggers: string[]
  steps: FlowStep[]
}

// ——————————————————————————————————————
// Static confirm flows (used by unit tests)
// ——————————————————————————————————————

export const confirmFlows: Record<string, FlowStep[]> = {
  confirmar_cobranca: [
    { type: 'typing', duration: 500 },
    { type: 'loader', duration: 2200, label: 'Enviando mensagem via WhatsApp...' },
    {
      type: 'message',
      text: `✅ Mensagem enviada com sucesso para **${DEFAULT_CUSTOMER.name}** (${DEFAULT_CUSTOMER.phone}).\n\nEle receberá a notificação agora e você será alertado quando abrir.`,
    },
  ],
  confirmar_excel: [
    { type: 'typing', duration: 300 },
    { type: 'loader', duration: 2600, label: 'Montando planilha...' },
    {
      type: 'message',
      text: 'Pronto! Planilha gerada. 👇',
      file: {
        name: `${DEFAULT_CUSTOMER.name.toLowerCase().replace(/\s+/g, '_')}_historico_2025.xlsx`,
        size: '52 KB',
        rows: 312,
        fileType: 'xlsx',
      },
    },
  ],
}

// ——————————————————————————————————————
// Dynamic flow builders — use active customer when available
// ——————————————————————————————————————

export function buildConfirmFlowSteps(flowId: string, customer?: Customer | null): FlowStep[] {
  const c = customer ?? DEFAULT_CUSTOMER

  if (flowId === 'confirmar_cobranca') {
    return [
      { type: 'typing', duration: 500 },
      { type: 'loader', duration: 2200, label: 'Enviando mensagem via WhatsApp...' },
      {
        type: 'message',
        text: `✅ Mensagem enviada com sucesso para **${c.name}** (${c.phone}).\n\nEle receberá a notificação agora e você será alertado quando abrir.`,
      },
    ]
  }

  if (flowId === 'confirmar_excel') {
    const filename = c.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    return [
      { type: 'typing', duration: 300 },
      { type: 'loader', duration: 2600, label: 'Montando planilha...' },
      {
        type: 'message',
        text: 'Pronto! Planilha gerada. 👇',
        file: {
          name: `${filename}_historico_2025.xlsx`,
          size: '52 KB',
          rows: 312,
          fileType: 'xlsx',
        },
      },
    ]
  }

  return confirmFlows[flowId] ?? []
}

export function buildCobrancaSteps(customer?: Customer | null): FlowStep[] {
  const c = (customer && customer.status !== 'paid') ? customer : DEFAULT_CUSTOMER
  return [
    { type: 'typing', duration: 950 },
    {
      type: 'message',
      text: 'Encontrei um cliente com pagamento em aberto. Veja o preview da mensagem antes de enviar:',
      action: {
        title: 'Enviar Cobrança via WhatsApp',
        subtitle: `${c.name} · ${c.days} dias em atraso · ${c.value}`,
        preview: [
          `💬 "Olá ${c.firstName}! Tudo bem? Aqui é do time da SistemaX. Sua fatura de ${c.value} está em aberto há ${c.days} dias. Podemos ajudar a regularizar? Acesse: [link de pagamento]"`,
        ],
        confirmLabel: 'Enviar agora',
        cancelLabel: 'Cancelar',
        confirmFlowId: 'confirmar_cobranca',
      },
    },
  ]
}

export function buildExcelSteps(customer?: Customer | null): FlowStep[] {
  const c = customer ?? DEFAULT_CUSTOMER
  return [
    { type: 'typing', duration: 700 },
    {
      type: 'message',
      text: 'Posso gerar essa planilha agora. Confirma os dados abaixo?',
      action: {
        title: 'Gerar Relatório Excel',
        subtitle: `Cliente: ${c.name} (ID #${c.id})`,
        preview: [
          '📅 Período: Janeiro 2025 → Dezembro 2025',
          '📋 Dados: Faturas, pagamentos e histórico completo',
          '📊 Formato: .xlsx (compatível com Excel e Google Sheets)',
        ],
        confirmLabel: 'Gerar planilha',
        cancelLabel: 'Cancelar',
        confirmFlowId: 'confirmar_excel',
      },
    },
  ]
}

// ——————————————————————————————————————
// Flow definitions
// ——————————————————————————————————————

export const flows: Flow[] = [
  // ── Saudação ─────────────────────────────────────────────────
  {
    id: 'saudacao',
    triggers: [
      'oi', 'olá', 'ola', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'hello',
      'tudo bem', 'como vai', 'e aí', 'e ai',
      'voltar', 'voltar ao início', 'voltar ao inicio',
      'menu principal', 'recomeçar', 'recomecar', 'reiniciar',
    ],
    steps: [
      { type: 'typing', duration: 750 },
      {
        type: 'message',
        text: 'Olá! 👋 Sou a **Aria**, sua assistente de operações.\n\nPosso te ajudar com:\n- 📋 Dúvidas sobre processos e faturas\n- 📊 Geração de relatórios e planilhas\n- 📨 Envio de cobranças e notificações\n- 🔍 Consulta de dados de clientes\n\nO que você precisa hoje?',
        quickReplies: [
          'Como dou baixa em fatura?',
          'Gerar Excel do cliente 123',
          'Enviar cobrança',
          'Falar com humano',
        ],
      },
    ],
  },

  // ── Cancelar fatura ───────────────────────────────────────────
  // (before baixa_fatura — 'cancelar'/'estornar' must win over 'fatura'/'pagamento')
  {
    id: 'cancelar_fatura',
    triggers: [
      'cancelar', 'cancelo', 'cancelamento', 'cancelar fatura', 'cancelar nota',
      'estornar', 'estorno', 'anular fatura', 'anulação',
    ],
    steps: [
      { type: 'typing', duration: 800 },
      { type: 'loader', duration: 1600, label: 'Consultando documentação...' },
      {
        type: 'message',
        stream: true,
        text: 'Para cancelar uma fatura:\n\n**1.** Acesse **Financeiro → Faturas** e localize a fatura\n\n**2.** Clique nos três pontos **(⋯)** ao lado da fatura\n\n**3.** Selecione **"Cancelar Fatura"**\n\n> ⚠️ **Atenção:** se já houver pagamento registrado, você precisa estorná-lo primeiro em **Registrar Pagamento → Estornar** antes de cancelar.\n\n**4.** Informe o motivo do cancelamento (obrigatório para auditoria)\n\n**5.** Confirme a operação\n\nA fatura ficará com status **Cancelada** e não poderá ser reativada.',
        citation: 'Manual Financeiro v3.2 — Seção 4.5 · Atualizado em Jan/2026',
        quickReplies: ['Voltar ao início'],
      },
    ],
  },

  // ── Baixa de fatura ───────────────────────────────────────────
  {
    id: 'baixa_fatura',
    triggers: [
      'baixa', 'fatura', 'registrar pagamento', 'como pago',
      'pagar fatura', 'recebimento', 'quitar', 'dar baixa',
      'pagamento', 'recebi',
    ],
    steps: [
      { type: 'typing', duration: 900 },
      { type: 'loader', duration: 1800, label: 'Consultando documentação...' },
      {
        type: 'message',
        stream: true,
        text: 'Para dar baixa em uma fatura, siga estes passos:\n\n**1.** Acesse **Financeiro → Faturas** no menu lateral\n\n**2.** Localize a fatura pelo número ou nome do cliente\n\n**3.** Clique em **"Registrar Pagamento"** (botão azul, canto superior direito)\n\n**4.** Preencha:\n- Data do pagamento\n- Forma de pagamento (PIX, TED, boleto)\n- Valor recebido\n- Comprovante (opcional, mas recomendado)\n\n**5.** Clique em **Salvar**\n\nA fatura aparecerá como **Paga** em até 2 minutos no histórico do cliente.',
        citation: 'Manual Financeiro v3.2 — Seção 4.1 · Atualizado em Jan/2026',
        quickReplies: [
          'E se o valor foi parcial?',
          'Como cancelar uma fatura?',
          'Voltar ao início',
        ],
      },
    ],
  },

  // ── Pagamento parcial ─────────────────────────────────────────
  {
    id: 'pagamento_parcial',
    triggers: ['parcial', 'parte do valor', 'metade', 'não pagou tudo', 'pagou menos'],
    steps: [
      { type: 'typing', duration: 800 },
      { type: 'loader', duration: 1400, label: 'Consultando documentação...' },
      {
        type: 'message',
        stream: true,
        text: 'Para pagamento **parcial**, o processo é o mesmo, mas:\n\n- No campo **Valor Recebido**, informe apenas o valor que entrou\n- O sistema marcará a fatura como **Pago Parcial** (ícone amarelo)\n- O saldo restante aparece automaticamente em **Saldo Devedor**\n\nVocê pode registrar múltiplos pagamentos parciais até zerar o saldo. Cada um fica registrado no histórico da fatura.',
        citation: 'Manual Financeiro v3.2 — Seção 4.3',
        quickReplies: ['Como cobrar o restante?', 'Voltar ao início'],
      },
    ],
  },

  // ── Cobrar saldo restante ─────────────────────────────────────
  // (before enviar_cobranca — 'restante' must win over 'cobrar')
  {
    id: 'cobrar_restante',
    triggers: [
      'restante', 'saldo devedor', 'cobrar o restante', 'valor restante',
      'cobrar saldo', 'cobrar o que falta',
    ],
    steps: [
      { type: 'typing', duration: 700 },
      {
        type: 'message',
        text: 'Para cobrar o saldo restante de um pagamento parcial, você tem duas opções:\n\n**Opção 1 — Cobrança via WhatsApp**\nEnvie uma mensagem ao cliente com o valor pendente e o link de pagamento.\n\n**Opção 2 — Gerar 2ª via de boleto**\nAcesse a fatura → clique em **"Gerar 2ª via"** informando apenas o valor do saldo devedor.\n\nO histórico completo de pagamentos parciais fica na aba **Movimentações** da fatura.',
        citation: 'Manual Financeiro v3.2 — Seção 4.3.2',
        quickReplies: ['Enviar cobrança', 'Voltar ao início'],
      },
    ],
  },

  // ── Gerar Excel ───────────────────────────────────────────────
  {
    id: 'gerar_excel',
    triggers: [
      'excel', 'planilha', 'relatório', 'relatorio',
      'gerar relatório', 'exportar', 'exportação',
      'download de dados', 'cliente 123',
    ],
    steps: buildExcelSteps(),
  },

  // ── Enviar cobrança ───────────────────────────────────────────
  {
    id: 'enviar_cobranca',
    triggers: [
      'cobrar', 'cobrança', 'cobranca', 'enviar mensagem',
      'inadimplente', 'devendo', 'atraso',
      'aviso de cobrança', 'notificar cliente', 'whatsapp',
    ],
    steps: buildCobrancaSteps(),
  },

  // ── Falar com humano ──────────────────────────────────────────
  {
    id: 'falar_humano',
    triggers: [
      'humano', 'falar com pessoa', 'atendente', 'pessoa real',
      'suporte humano', 'transferir', 'não entendi', 'nao entendi',
      'não consigo', 'ajuda urgente', 'falar com humano',
    ],
    steps: [
      { type: 'typing', duration: 600 },
      {
        type: 'message',
        text: 'Sem problema! Estou transferindo você para um especialista agora. Ele terá acesso ao histórico desta conversa.',
        transfer: {
          agentName: 'Fernanda Silva',
          agentRole: 'Especialista de Operações',
          avatarInitials: 'FS',
          estimatedTime: '~2 min',
        },
      },
    ],
  },

  // ── Ajuda ─────────────────────────────────────────────────────
  {
    id: 'ajuda',
    triggers: [
      'ajuda', 'help', 'o que você faz', 'o que voce faz',
      'o que sabe', 'funcionalidades', 'recursos',
      'o que voce sabe fazer', 'o que você sabe fazer', 'o que você sabe',
    ],
    steps: [
      { type: 'typing', duration: 700 },
      {
        type: 'message',
        text: 'Posso te ajudar com várias coisas! Aqui estão os principais recursos:\n\n📋 **Consultas** — Regras de negócio, processos, dúvidas operacionais\n\n📊 **Relatórios** — Gerar Excel, PDF e exportações de dados\n\n📨 **Cobranças** — Enviar avisos de cobrança via WhatsApp ou e-mail\n\n🔍 **Clientes** — Consultar histórico, status de pagamentos, dados cadastrais\n\n👤 **Suporte** — Transferir para um especialista quando necessário\n\nExperimenta perguntar algo específico!',
        quickReplies: [
          'Como dou baixa em fatura?',
          'Gerar relatório Excel',
          'Enviar cobrança',
        ],
      },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────
  {
    id: 'fallback',
    triggers: [],
    steps: [
      { type: 'typing', duration: 650 },
      {
        type: 'message',
        text: 'Não tenho uma resposta treinada para isso ainda. Tente reformular ou escolha uma das opções abaixo:',
        quickReplies: [
          'Baixa de fatura',
          'Gerar relatório Excel',
          'Enviar cobrança',
          'Falar com humano',
        ],
      },
    ],
  },
]

// ——————————————————————————————————————
// Intent matching
// ——————————————————————————————————————

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function matchFlow(input: string): Flow {
  const lower = input.toLowerCase().trim()

  for (const flow of flows) {
    if (flow.id === 'fallback') continue

    const matched = flow.triggers.some(trigger => {
      if (trigger.length <= 4) {
        return new RegExp(
          `(?<![a-záàâãéèêíïóôõúüç])${escapeRegex(trigger)}(?![a-záàâãéèêíïóôõúüç])`,
          'i'
        ).test(lower)
      }
      return lower.includes(trigger)
    })

    if (matched) return flow
  }

  return flows.find(f => f.id === 'fallback')!
}

// Re-export CUSTOMERS so the widget can import from a single place
export { CUSTOMERS, DEFAULT_CUSTOMER }
