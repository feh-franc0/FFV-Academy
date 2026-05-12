import { describe, it, expect } from 'vitest'
import {
  flows, confirmFlows, matchFlow,
  buildCobrancaSteps, buildExcelSteps, buildConfirmFlowSteps,
  CUSTOMERS, DEFAULT_CUSTOMER,
} from '@/lib/flows'

// ——————————————————————————————————————
// Data integrity
// ——————————————————————————————————————

describe('flows — data integrity', () => {
  it('all flow IDs are unique', () => {
    const ids = flows.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('fallback flow exists and has no triggers', () => {
    const fallback = flows.find(f => f.id === 'fallback')
    expect(fallback).toBeDefined()
    expect(fallback?.triggers).toHaveLength(0)
  })

  it('every flow has at least one step', () => {
    flows.forEach(flow => {
      expect(flow.steps.length).toBeGreaterThan(0)
    })
  })

  it('all step types are valid', () => {
    const validTypes = new Set(['typing', 'loader', 'message'])
    flows.forEach(flow => {
      flow.steps.forEach(step => {
        expect(validTypes.has(step.type), `"${step.type}" is not a valid step type`).toBe(true)
      })
    })
  })

  it('typing steps have positive duration', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'typing')
        .forEach(step => {
          if (step.type === 'typing') {
            expect(step.duration).toBeGreaterThan(0)
          }
        })
    })
  })

  it('loader steps have positive duration and non-empty label', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'loader')
        .forEach(step => {
          if (step.type === 'loader') {
            expect(step.duration).toBeGreaterThan(0)
            expect(step.label.trim().length).toBeGreaterThan(0)
          }
        })
    })
  })

  it('message steps have at least one content field (text, file, action, or transfer)', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'message')
        .forEach(step => {
          if (step.type === 'message') {
            const hasContent =
              step.text !== undefined ||
              step.file !== undefined ||
              step.action !== undefined ||
              step.transfer !== undefined
            expect(hasContent, `Message step in flow "${flow.id}" has no content`).toBe(true)
          }
        })
    })
  })

  it('all action confirmFlowIds reference existing entries in confirmFlows', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'message')
        .forEach(step => {
          if (step.type === 'message' && step.action) {
            const { confirmFlowId } = step.action
            expect(
              confirmFlows[confirmFlowId],
              `confirmFlowId "${confirmFlowId}" in flow "${flow.id}" does not exist`
            ).toBeDefined()
          }
        })
    })
  })

  it('action cards have all required UI fields', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'message')
        .forEach(step => {
          if (step.type === 'message' && step.action) {
            const { action } = step
            expect(action.title.length).toBeGreaterThan(0)
            expect(action.subtitle.length).toBeGreaterThan(0)
            expect(action.preview.length).toBeGreaterThan(0)
            expect(action.confirmLabel.length).toBeGreaterThan(0)
            expect(action.cancelLabel.length).toBeGreaterThan(0)
          }
        })
    })
  })

  it('file cards have required fields', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'message')
        .forEach(step => {
          if (step.type === 'message' && step.file) {
            const { file } = step
            expect(file.name.length).toBeGreaterThan(0)
            expect(file.size.length).toBeGreaterThan(0)
            expect(['xlsx', 'pdf', 'csv']).toContain(file.fileType)
          }
        })
    })
  })

  it('transfer cards have required fields', () => {
    flows.forEach(flow => {
      flow.steps
        .filter(s => s.type === 'message')
        .forEach(step => {
          if (step.type === 'message' && step.transfer) {
            const { transfer } = step
            expect(transfer.agentName.length).toBeGreaterThan(0)
            expect(transfer.agentRole.length).toBeGreaterThan(0)
            expect(transfer.avatarInitials.length).toBeGreaterThanOrEqual(1)
            expect(transfer.avatarInitials.length).toBeLessThanOrEqual(3)
            expect(transfer.estimatedTime.length).toBeGreaterThan(0)
          }
        })
    })
  })
})

// ——————————————————————————————————————
// confirmFlows integrity
// ——————————————————————————————————————

describe('confirmFlows — data integrity', () => {
  it('all confirmFlows have at least one step', () => {
    Object.entries(confirmFlows).forEach(([id, steps]) => {
      expect(steps.length, `confirmFlow "${id}" has no steps`).toBeGreaterThan(0)
    })
  })

  it('all confirmFlow steps have valid types', () => {
    const validTypes = new Set(['typing', 'loader', 'message'])
    Object.entries(confirmFlows).forEach(([id, steps]) => {
      steps.forEach(step => {
        expect(validTypes.has(step.type), `confirmFlow "${id}" has invalid step type "${step.type}"`).toBe(true)
      })
    })
  })

  it('confirm flows end with a message step (provides user feedback)', () => {
    Object.entries(confirmFlows).forEach(([id, steps]) => {
      const lastStep = steps[steps.length - 1]
      expect(lastStep.type, `confirmFlow "${id}" does not end with a message`).toBe('message')
    })
  })
})

// ——————————————————————————————————————
// matchFlow — happy paths
// ——————————————————————————————————————

describe('matchFlow — intent matching', () => {
  it('returns saudacao for "oi"', () => {
    expect(matchFlow('oi').id).toBe('saudacao')
  })

  it('returns saudacao for "olá"', () => {
    expect(matchFlow('olá').id).toBe('saudacao')
  })

  it('returns saudacao for "bom dia"', () => {
    expect(matchFlow('bom dia').id).toBe('saudacao')
  })

  it('returns saudacao for "boa tarde professor"', () => {
    expect(matchFlow('boa tarde professor').id).toBe('saudacao')
  })

  it('returns baixa_fatura for "como dou baixa em fatura"', () => {
    expect(matchFlow('como dou baixa em fatura').id).toBe('baixa_fatura')
  })

  it('returns baixa_fatura for "preciso registrar pagamento"', () => {
    expect(matchFlow('preciso registrar pagamento').id).toBe('baixa_fatura')
  })

  it('returns baixa_fatura for "como pago a fatura do cliente"', () => {
    expect(matchFlow('como pago a fatura do cliente').id).toBe('baixa_fatura')
  })

  it('returns gerar_excel for "gerar excel do cliente"', () => {
    expect(matchFlow('gerar excel do cliente').id).toBe('gerar_excel')
  })

  it('returns gerar_excel for "quero uma planilha"', () => {
    expect(matchFlow('quero uma planilha').id).toBe('gerar_excel')
  })

  it('returns gerar_excel for "exportar relatório"', () => {
    expect(matchFlow('exportar relatório').id).toBe('gerar_excel')
  })

  it('returns enviar_cobranca for "enviar cobrança"', () => {
    expect(matchFlow('enviar cobrança').id).toBe('enviar_cobranca')
  })

  it('returns enviar_cobranca for "cliente está inadimplente"', () => {
    expect(matchFlow('cliente está inadimplente').id).toBe('enviar_cobranca')
  })

  it('returns enviar_cobranca for "aviso de cobrança pro cliente"', () => {
    expect(matchFlow('aviso de cobrança pro cliente').id).toBe('enviar_cobranca')
  })

  it('returns falar_humano for "quero falar com humano"', () => {
    expect(matchFlow('quero falar com humano').id).toBe('falar_humano')
  })

  it('returns falar_humano for "me transfere pra atendente"', () => {
    expect(matchFlow('me transfere pra atendente').id).toBe('falar_humano')
  })

  it('returns ajuda for "o que você faz"', () => {
    expect(matchFlow('o que você faz').id).toBe('ajuda')
  })

  it('returns pagamento_parcial for "e se o valor foi parcial"', () => {
    // "foi" must not match trigger "oi" — word boundary fix
    expect(matchFlow('e se o valor foi parcial').id).toBe('pagamento_parcial')
  })

  it('returns saudacao for "voltar ao início"', () => {
    expect(matchFlow('Voltar ao início').id).toBe('saudacao')
  })

  it('returns saudacao for "voltar"', () => {
    expect(matchFlow('voltar').id).toBe('saudacao')
  })

  it('returns cancelar_fatura for "como cancelar uma fatura"', () => {
    expect(matchFlow('como cancelar uma fatura').id).toBe('cancelar_fatura')
  })

  it('returns cancelar_fatura for "preciso estornar um pagamento"', () => {
    expect(matchFlow('preciso estornar um pagamento').id).toBe('cancelar_fatura')
  })

  it('returns cobrar_restante for "como cobrar o restante"', () => {
    expect(matchFlow('como cobrar o restante').id).toBe('cobrar_restante')
  })

  it('returns cobrar_restante for "qual o saldo devedor"', () => {
    expect(matchFlow('qual o saldo devedor').id).toBe('cobrar_restante')
  })
})

// ——————————————————————————————————————
// matchFlow — edge cases
// ——————————————————————————————————————

describe('matchFlow — edge cases', () => {
  it('returns fallback for completely unknown input', () => {
    expect(matchFlow('qual o sentido da vida').id).toBe('fallback')
  })

  it('returns fallback for random characters', () => {
    expect(matchFlow('qwerty asdfgh 12345').id).toBe('fallback')
  })

  it('returns fallback for empty string', () => {
    expect(matchFlow('').id).toBe('fallback')
  })

  it('returns fallback for whitespace-only string', () => {
    expect(matchFlow('   ').id).toBe('fallback')
  })

  it('is case-insensitive for "OI"', () => {
    expect(matchFlow('OI').id).toBe('saudacao')
  })

  it('is case-insensitive for "EXCEL"', () => {
    expect(matchFlow('EXCEL').id).toBe('gerar_excel')
  })

  it('is case-insensitive for "FATURA"', () => {
    expect(matchFlow('FATURA').id).toBe('baixa_fatura')
  })

  it('handles leading/trailing whitespace', () => {
    expect(matchFlow('  oi  ').id).toBe('saudacao')
    expect(matchFlow('\texcel\n').id).toBe('gerar_excel')
  })

  it('matches partial trigger in longer sentence', () => {
    expect(matchFlow('preciso dar baixa em várias faturas hoje').id).toBe('baixa_fatura')
    expect(matchFlow('me ajuda a enviar uma cobrança urgente').id).toBe('enviar_cobranca')
  })

  it('does not match fallback when valid intent is present', () => {
    const result = matchFlow('quero gerar um excel')
    expect(result.id).not.toBe('fallback')
  })

  it('returns a flow with steps for every possible input', () => {
    const inputs = [
      '', 'oi', 'fatura', 'excel', 'cobrança', 'humano', 'ajuda', 'xyz123',
    ]
    inputs.forEach(input => {
      const flow = matchFlow(input)
      expect(flow.steps.length).toBeGreaterThan(0)
    })
  })
})

// ——————————————————————————————————————
// Non-regression: specific known-good mappings
// ——————————————————————————————————————

describe('matchFlow — non-regression table', () => {
  const table: [string, string][] = [
    ['Como dou baixa em fatura?', 'baixa_fatura'],
    ['Gerar Excel do cliente 123', 'gerar_excel'],
    ['Enviar cobrança', 'enviar_cobranca'],
    ['Falar com humano', 'falar_humano'],
    ['oi tudo bem', 'saudacao'],
    ['Quero uma planilha do relatório', 'gerar_excel'],
    ['Como registro o recebimento?', 'baixa_fatura'],
    ['Manda um aviso pro cliente inadimplente', 'enviar_cobranca'],
    ['Não estou conseguindo ajuda', 'ajuda'],  // "ajuda" trigger matches correctly
    ['O que você sabe fazer?', 'ajuda'],  // trigger "o que você sabe fazer" added to flow
    ['Como cancelar uma fatura?', 'cancelar_fatura'],
    ['Preciso estornar um boleto', 'cancelar_fatura'],
    ['Como cobrar o restante?', 'cobrar_restante'],
    ['Qual o saldo devedor do cliente?', 'cobrar_restante'],
    ['Voltar ao início', 'saudacao'],
  ]

  table.forEach(([input, expectedId]) => {
    it(`"${input}" → ${expectedId}`, () => {
      expect(matchFlow(input).id).toBe(expectedId)
    })
  })
})

// ——————————————————————————————————————
// Flow ordering invariants
// ——————————————————————————————————————

describe('flows — ordering invariants', () => {
  it('cancelar_fatura comes before baixa_fatura in the array', () => {
    const cancelIdx = flows.findIndex(f => f.id === 'cancelar_fatura')
    const baixaIdx  = flows.findIndex(f => f.id === 'baixa_fatura')
    expect(cancelIdx).toBeLessThan(baixaIdx)
  })

  it('cobrar_restante comes before enviar_cobranca in the array', () => {
    const restanteIdx = flows.findIndex(f => f.id === 'cobrar_restante')
    const cobrancaIdx = flows.findIndex(f => f.id === 'enviar_cobranca')
    expect(restanteIdx).toBeLessThan(cobrancaIdx)
  })

  it('fallback is the last flow', () => {
    expect(flows[flows.length - 1].id).toBe('fallback')
  })

  it('"cancelar fatura" resolves to cancelar_fatura, not baixa_fatura', () => {
    expect(matchFlow('cancelar fatura').id).toBe('cancelar_fatura')
  })

  it('"cobrar o restante" resolves to cobrar_restante, not enviar_cobranca', () => {
    expect(matchFlow('cobrar o restante').id).toBe('cobrar_restante')
  })

  it('"como estornar fatura" resolves to cancelar_fatura', () => {
    expect(matchFlow('como estornar fatura').id).toBe('cancelar_fatura')
  })

  it('"cobrar saldo devedor" resolves to cobrar_restante', () => {
    expect(matchFlow('cobrar saldo devedor').id).toBe('cobrar_restante')
  })
})

// ——————————————————————————————————————
// matchFlow — word boundary precision
// ——————————————————————————————————————

describe('matchFlow — word boundary precision', () => {
  it('"foi" does not match saudacao ("oi" inside a word)', () => {
    expect(matchFlow('foi').id).not.toBe('saudacao')
  })

  it('"moinho" does not match saudacao ("oi" inside a word)', () => {
    expect(matchFlow('moinho').id).not.toBe('saudacao')
  })

  it('"oito" does not match saudacao ("oi" followed immediately by letter)', () => {
    expect(matchFlow('oito').id).not.toBe('saudacao')
  })

  it('"oi" as standalone word matches saudacao', () => {
    expect(matchFlow('oi').id).toBe('saudacao')
  })

  it('"oi!" (with punctuation) matches saudacao', () => {
    expect(matchFlow('oi!').id).toBe('saudacao')
  })

  it('"oi, preciso de ajuda" matches saudacao', () => {
    expect(matchFlow('oi, preciso de ajuda').id).toBe('saudacao')
  })

  it('"hey" standalone matches saudacao', () => {
    expect(matchFlow('hey').id).toBe('saudacao')
  })

  it('"ola" matches saudacao (no accent variant)', () => {
    expect(matchFlow('ola').id).toBe('saudacao')
  })

  it('"foi parcial" resolves to pagamento_parcial (not saudacao)', () => {
    const result = matchFlow('foi parcial')
    expect(result.id).toBe('pagamento_parcial')
    expect(result.id).not.toBe('saudacao')
  })
})

// ——————————————————————————————————————
// buildCobrancaSteps
// ——————————————————————————————————————

describe('buildCobrancaSteps', () => {
  const overdueCustomer  = CUSTOMERS.find(c => c.status === 'overdue')!
  const paidCustomer     = CUSTOMERS.find(c => c.status === 'paid')!

  it('returns at least one step when called with null', () => {
    expect(buildCobrancaSteps(null).length).toBeGreaterThan(0)
  })

  it('last step is a message with an action card', () => {
    const steps = buildCobrancaSteps(null)
    const last  = steps[steps.length - 1]
    expect(last.type).toBe('message')
    if (last.type === 'message') expect(last.action).toBeDefined()
  })

  it('action confirmFlowId is "confirmar_cobranca"', () => {
    const steps   = buildCobrancaSteps(null)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.confirmFlowId).toBe('confirmar_cobranca')
    }
  })

  it('uses the overdue customer name and days in the action subtitle', () => {
    const steps   = buildCobrancaSteps(overdueCustomer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.subtitle).toContain(overdueCustomer.name)
      expect(msgStep.action.subtitle).toContain(String(overdueCustomer.days))
    }
  })

  it('preview contains customer firstName and value', () => {
    const steps   = buildCobrancaSteps(overdueCustomer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      const preview = msgStep.action.preview.join(' ')
      expect(preview).toContain(overdueCustomer.firstName)
      expect(preview).toContain(overdueCustomer.value)
    }
  })

  it('falls back to DEFAULT_CUSTOMER when supplied customer is paid', () => {
    const steps   = buildCobrancaSteps(paidCustomer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.subtitle).toContain(DEFAULT_CUSTOMER.name)
    }
  })

  it('all steps have valid types', () => {
    const validTypes = new Set(['typing', 'loader', 'message'])
    buildCobrancaSteps(overdueCustomer).forEach(step => {
      expect(validTypes.has(step.type)).toBe(true)
    })
  })
})

// ——————————————————————————————————————
// buildExcelSteps
// ——————————————————————————————————————

describe('buildExcelSteps', () => {
  const customer = CUSTOMERS[0]

  it('returns at least one step when called with null', () => {
    expect(buildExcelSteps(null).length).toBeGreaterThan(0)
  })

  it('last step is a message with an action card', () => {
    const steps = buildExcelSteps(null)
    const last  = steps[steps.length - 1]
    expect(last.type).toBe('message')
    if (last.type === 'message') expect(last.action).toBeDefined()
  })

  it('action confirmFlowId is "confirmar_excel"', () => {
    const steps   = buildExcelSteps(null)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.confirmFlowId).toBe('confirmar_excel')
    }
  })

  it('action subtitle contains the customer name and ID', () => {
    const steps   = buildExcelSteps(customer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.subtitle).toContain(customer.name)
      expect(msgStep.action.subtitle).toContain(customer.id)
    }
  })

  it('uses DEFAULT_CUSTOMER when called with undefined', () => {
    const steps   = buildExcelSteps(undefined)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      expect(msgStep.action.subtitle).toContain(DEFAULT_CUSTOMER.name)
    }
  })

  it('action preview contains ".xlsx" format reference', () => {
    const steps   = buildExcelSteps(customer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.action) {
      const preview = msgStep.action.preview.join(' ')
      expect(preview.toLowerCase()).toContain('.xlsx')
    }
  })

  it('all steps have valid types', () => {
    const validTypes = new Set(['typing', 'loader', 'message'])
    buildExcelSteps(customer).forEach(step => {
      expect(validTypes.has(step.type)).toBe(true)
    })
  })
})

// ——————————————————————————————————————
// buildConfirmFlowSteps
// ——————————————————————————————————————

describe('buildConfirmFlowSteps', () => {
  const overdueCustomer = CUSTOMERS.find(c => c.status === 'overdue')!

  it('confirmar_cobranca with null uses DEFAULT_CUSTOMER name and phone', () => {
    const steps   = buildConfirmFlowSteps('confirmar_cobranca', null)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.text) {
      expect(msgStep.text).toContain(DEFAULT_CUSTOMER.name)
      expect(msgStep.text).toContain(DEFAULT_CUSTOMER.phone)
    }
  })

  it('confirmar_cobranca with a specific customer uses that customer data', () => {
    const steps   = buildConfirmFlowSteps('confirmar_cobranca', overdueCustomer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.text) {
      expect(msgStep.text).toContain(overdueCustomer.name)
      expect(msgStep.text).toContain(overdueCustomer.phone)
    }
  })

  it('confirmar_excel generates a sanitized filename from customer name', () => {
    const steps   = buildConfirmFlowSteps('confirmar_excel', overdueCustomer)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.file) {
      const expected = overdueCustomer.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      expect(msgStep.file.name).toContain(expected)
      expect(msgStep.file.name).toContain('.xlsx')
    }
  })

  it('confirmar_excel file has 312 rows and 52 KB size', () => {
    const steps   = buildConfirmFlowSteps('confirmar_excel', null)
    const msgStep = steps.find(s => s.type === 'message')
    if (msgStep?.type === 'message' && msgStep.file) {
      expect(msgStep.file.rows).toBe(312)
      expect(msgStep.file.size).toBe('52 KB')
      expect(msgStep.file.fileType).toBe('xlsx')
    }
  })

  it('returns empty array for unknown flowId', () => {
    expect(buildConfirmFlowSteps('does_not_exist', null)).toHaveLength(0)
  })

  it('both confirm flows end with a message step', () => {
    const cobrancaSteps = buildConfirmFlowSteps('confirmar_cobranca', null)
    const excelSteps    = buildConfirmFlowSteps('confirmar_excel', null)
    expect(cobrancaSteps[cobrancaSteps.length - 1].type).toBe('message')
    expect(excelSteps[excelSteps.length - 1].type).toBe('message')
  })

  it('all steps in both confirm flows have valid types', () => {
    const validTypes = new Set(['typing', 'loader', 'message'])
    const allSteps = [
      ...buildConfirmFlowSteps('confirmar_cobranca', null),
      ...buildConfirmFlowSteps('confirmar_excel', null),
    ]
    allSteps.forEach(step => {
      expect(validTypes.has(step.type)).toBe(true)
    })
  })

  it('confirmar_cobranca includes a loader step (WhatsApp sending simulation)', () => {
    const steps = buildConfirmFlowSteps('confirmar_cobranca', null)
    expect(steps.some(s => s.type === 'loader')).toBe(true)
  })

  it('confirmar_excel includes a loader step (spreadsheet generation simulation)', () => {
    const steps = buildConfirmFlowSteps('confirmar_excel', null)
    expect(steps.some(s => s.type === 'loader')).toBe(true)
  })
})
