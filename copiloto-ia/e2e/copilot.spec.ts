import { test, expect, type Page } from '@playwright/test'

// ——————————————————————————————————————
// Helpers
// ——————————————————————————————————————

async function openChat(page: Page) {
  await page.getByTestId('copilot-trigger').click()
  await expect(page.getByTestId('chat-panel')).toBeVisible()
}

async function waitForBotIdle(page: Page, timeout = 15000) {
  await expect(page.getByTestId('chat-input')).not.toBeDisabled({ timeout })
}

async function sendMessage(page: Page, text: string) {
  const input = page.getByTestId('chat-input')
  await input.fill(text)
  await page.getByTestId('chat-send').click()
}

async function waitForBotMessage(page: Page, pattern?: RegExp | string, timeout = 12000) {
  const messages = page.getByTestId('message-bot')
  await expect(messages.last()).toBeVisible({ timeout })
  if (pattern) {
    await expect(messages.last()).toContainText(pattern, { timeout })
  }
}

// ——————————————————————————————————————
// Setup: navigate before each test
// ——————————————————————————————————————

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

// ——————————————————————————————————————
// Smoke tests
// ——————————————————————————————————————

test.describe('Smoke — page loads correctly', () => {
  test('fake CRM system renders', async ({ page }) => {
    await expect(page.locator('text=SistemaX')).toBeVisible()
    await expect(page.locator('text=Lista de Clientes')).toBeVisible()
  })

  test('copilot trigger button is visible', async ({ page }) => {
    await expect(page.getByTestId('copilot-trigger')).toBeVisible()
  })

  test('CRM has customer data', async ({ page }) => {
    await expect(page.locator('text=João Santos')).toBeVisible()
    await expect(page.locator('text=Maria Oliveira')).toBeVisible()
  })
})

// ——————————————————————————————————————
// Widget open/close
// ——————————————————————————————————————

test.describe('Widget — open/close', () => {
  test('opens chat on button click', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('chat-panel')).toBeVisible()
    await expect(page.getByTestId('chat-input')).toBeVisible()
  })

  test('header shows Aria name and Online status', async ({ page }) => {
    await openChat(page)
    await expect(page.locator('text=Aria')).toBeVisible()
    await expect(page.locator('text=Online')).toBeVisible()
  })

  test('closes via ChevronDown button', async ({ page }) => {
    await openChat(page)
    await page.getByTestId('chat-close').click()
    await expect(page.getByTestId('chat-panel')).not.toBeVisible()
  })

  test('closes via trigger toggle', async ({ page }) => {
    await openChat(page)
    await page.getByTestId('copilot-trigger').click()
    await expect(page.getByTestId('chat-panel')).not.toBeVisible()
  })
})

// ——————————————————————————————————————
// Flow 1: Greeting
// ——————————————————————————————————————

test.describe('Flow — greeting', () => {
  test('bot greets on first open', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('message-bot').first()).toBeVisible({ timeout: 6000 })
    await expect(page.getByTestId('message-bot').first()).toContainText('Aria', { timeout: 6000 })
  })

  test('greeting includes quick reply buttons', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('quick-replies').first()).toBeVisible({ timeout: 6000 })
  })

  test('greeting quick replies include key actions', async ({ page }) => {
    await openChat(page)
    const quickReplies = page.getByTestId('quick-replies').first()
    await expect(quickReplies).toBeVisible({ timeout: 6000 })
    await expect(quickReplies.getByRole('button', { name: /baixa/i })).toBeVisible()
    await expect(quickReplies.getByRole('button', { name: /excel/i })).toBeVisible()
  })
})

// ——————————————————————————————————————
// Flow 2: Q&A baixa de fatura
// ——————————————————————————————————————

test.describe('Flow — baixa de fatura (Q&A)', () => {
  test('shows loader "Consultando documentação..."', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'como dou baixa em fatura')
    await expect(page.getByLabel(/consultando documentação/i)).toBeVisible({ timeout: 4000 })
  })

  test('responds with step-by-step instructions', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'como dou baixa em fatura')
    // Wait for the streaming to finish and citation to appear
    await expect(page.getByTestId('message-citation').first()).toBeVisible({ timeout: 15000 })
  })

  test('response includes citation from Manual Financeiro', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'como dou baixa em fatura')
    await expect(page.getByTestId('message-citation').first()).toContainText('Manual Financeiro', { timeout: 15000 })
  })

  test('response mentions "Registrar Pagamento"', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'como dou baixa em fatura')
    const lastBot = page.getByTestId('message-bot').last()
    await expect(lastBot).toContainText('Registrar Pagamento', { timeout: 15000 })
  })

  test('quick replies appear after Q&A response', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'como dou baixa em fatura')
    await expect(page.getByTestId('message-citation').first()).toBeVisible({ timeout: 15000 })
    await waitForBotIdle(page, 16000)
    const allQuickReplies = page.getByTestId('quick-replies')
    await expect(allQuickReplies.last()).toBeVisible({ timeout: 3000 })
  })
})

// ——————————————————————————————————————
// Flow 3: Gerar Excel (action card + confirm)
// ——————————————————————————————————————

test.describe('Flow — gerar Excel', () => {
  test('shows action card with title "Gerar Relatório Excel"', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await expect(page.getByTestId('action-card')).toBeVisible({ timeout: 6000 })
    await expect(page.getByTestId('action-card')).toContainText('Gerar Relatório Excel')
  })

  test('action card shows client details', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await expect(page.getByTestId('action-card')).toContainText('João Santos', { timeout: 6000 })
  })

  test('confirm button triggers file generation', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await expect(page.getByTestId('action-confirm')).toBeVisible({ timeout: 6000 })
    await page.getByTestId('action-confirm').click()
    await expect(page.getByTestId('action-resolved')).toContainText('Confirmado', { timeout: 3000 })
  })

  test('file card appears after confirmation', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await expect(page.getByTestId('action-confirm')).toBeVisible({ timeout: 6000 })
    await page.getByTestId('action-confirm').click()
    await expect(page.getByTestId('file-card')).toBeVisible({ timeout: 8000 })
  })

  test('file card has download button', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await page.getByTestId('action-confirm').click({ timeout: 6000 })
    const fileCard = page.getByTestId('file-card')
    await expect(fileCard.getByLabel('Baixar arquivo')).toBeVisible({ timeout: 8000 })
  })

  test('cancel dismisses the action and bot acknowledges', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await expect(page.getByTestId('action-cancel')).toBeVisible({ timeout: 6000 })
    await page.getByTestId('action-cancel').click()
    await expect(page.getByTestId('action-resolved')).toContainText('Cancelado', { timeout: 2000 })
    const lastBot = page.getByTestId('message-bot').last()
    await expect(lastBot).toContainText('cancelei', { timeout: 5000 })
  })
})

// ——————————————————————————————————————
// Flow 4: Enviar cobrança
// ——————————————————————————————————————

test.describe('Flow — enviar cobrança', () => {
  test('shows action card with WhatsApp preview', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'enviar cobrança')
    await expect(page.getByTestId('action-card')).toBeVisible({ timeout: 6000 })
    await expect(page.getByTestId('action-card')).toContainText('WhatsApp')
  })

  test('action card shows customer name and overdue info', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'enviar cobrança')
    await expect(page.getByTestId('action-card')).toContainText('João Santos', { timeout: 6000 })
    await expect(page.getByTestId('action-card')).toContainText('32 dias', { timeout: 6000 })
  })

  test('confirm sends the message and shows success', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'enviar cobrança')
    await expect(page.getByTestId('action-confirm')).toBeVisible({ timeout: 6000 })
    await page.getByTestId('action-confirm').click()

    await expect(page.getByTestId('action-resolved')).toContainText('Confirmado', { timeout: 3000 })
    const lastBot = page.getByTestId('message-bot').last()
    await expect(lastBot).toContainText(/enviada|sucesso/i, { timeout: 10000 })
  })
})

// ——————————————————————————————————————
// Flow 5: Falar com humano
// ——————————————————————————————————————

test.describe('Flow — falar com humano', () => {
  test('shows transfer card', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'falar com humano')
    await expect(page.getByTestId('transfer-card')).toBeVisible({ timeout: 6000 })
  })

  test('transfer card shows Fernanda Silva', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'falar com humano')
    await expect(page.getByTestId('transfer-card')).toContainText('Fernanda Silva', { timeout: 6000 })
  })

  test('transfer card shows estimated time', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'falar com humano')
    await expect(page.getByTestId('transfer-card')).toContainText('~2 min', { timeout: 6000 })
  })
})

// ——————————————————————————————————————
// Flow 6: Fallback
// ——————————————————————————————————————

test.describe('Flow — fallback (unknown intent)', () => {
  test('bot responds to unknown input with suggestions', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'qwerty asdfgh zxcvbn 12345')
    await waitForBotIdle(page, 10000)
    const lastBot = page.getByTestId('message-bot').last()
    await expect(lastBot).toContainText(/sei|alguma/i, { timeout: 6000 })
  })

  test('fallback includes quick reply suggestions', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'não sei o que quero')
    await waitForBotIdle(page, 10000)
    const allQuickReplies = page.getByTestId('quick-replies')
    await expect(allQuickReplies.last()).toBeVisible({ timeout: 6000 })
  })
})

// ——————————————————————————————————————
// Reset conversation
// ——————————————————————————————————————

test.describe('Reset', () => {
  test('reset button clears all messages', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('message-bot').first()).toBeVisible({ timeout: 6000 })

    await page.getByTestId('chat-reset').click()

    await expect(page.getByTestId('message-bot').first()).not.toBeVisible({ timeout: 2000 })
  })

  test('after reset, bot greets again automatically', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('message-bot').first()).toBeVisible({ timeout: 6000 })

    await page.getByTestId('chat-reset').click()

    // Bug fix: bot should re-greet even when panel stays open
    await expect(page.getByTestId('message-bot').first()).toBeVisible({ timeout: 6000 })
  })
})

// ——————————————————————————————————————
// Proactive bubble
// ——————————————————————————————————————

test.describe('Proactive bubble', () => {
  test('appears after 10 seconds when chat is closed', async ({ page }) => {
    // Intercept timers to fast-forward proactive delay
    await page.clock.install()
    await page.goto('/')

    expect(await page.getByTestId('proactive-bubble').count()).toBe(0)

    await page.clock.fastForward(11000)

    await expect(page.getByTestId('proactive-bubble')).toBeVisible({ timeout: 3000 })
  })

  test('close button dismisses the bubble', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.clock.fastForward(11000)
    await expect(page.getByTestId('proactive-bubble')).toBeVisible({ timeout: 3000 })

    await page.getByLabel('Fechar sugestão').click()
    await expect(page.getByTestId('proactive-bubble')).not.toBeVisible({ timeout: 2000 })
  })

  test('clicking CTA opens chat and triggers cobrança flow', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    await page.clock.fastForward(11000)
    await expect(page.getByTestId('proactive-bubble')).toBeVisible({ timeout: 3000 })

    await page.getByTestId('proactive-bubble-cta').click()

    await expect(page.getByTestId('chat-panel')).toBeVisible({ timeout: 2000 })
    await expect(page.getByTestId('action-card')).toBeVisible({ timeout: 8000 })
  })
})

// ——————————————————————————————————————
// Visual / layout regression
// ——————————————————————————————————————

test.describe('Visual regression', () => {
  test('CRM page matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('crm-page.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    })
  })

  test('chat panel open state matches baseline', async ({ page }) => {
    await openChat(page)
    await expect(page.getByTestId('message-bot').first()).toBeVisible({ timeout: 6000 })
    await waitForBotIdle(page)

    await expect(page).toHaveScreenshot('chat-panel-open.png', {
      maxDiffPixelRatio: 0.03,
      animations: 'disabled',
    })
  })

  test('action card (cobrança) matches baseline', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'enviar cobrança')
    await expect(page.getByTestId('action-card')).toBeVisible({ timeout: 6000 })

    await expect(page.getByTestId('chat-panel')).toHaveScreenshot('action-card-cobranca.png', {
      maxDiffPixelRatio: 0.03,
      animations: 'disabled',
    })
  })

  test('file card (Excel) matches baseline', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'gerar excel do cliente 123')
    await page.getByTestId('action-confirm').click({ timeout: 6000 })
    await expect(page.getByTestId('file-card')).toBeVisible({ timeout: 8000 })

    await expect(page.getByTestId('chat-panel')).toHaveScreenshot('file-card-excel.png', {
      maxDiffPixelRatio: 0.03,
      animations: 'disabled',
    })
  })

  test('transfer card matches baseline', async ({ page }) => {
    await openChat(page)
    await waitForBotIdle(page)
    await sendMessage(page, 'falar com humano')
    await expect(page.getByTestId('transfer-card')).toBeVisible({ timeout: 6000 })

    await expect(page.getByTestId('chat-panel')).toHaveScreenshot('transfer-card.png', {
      maxDiffPixelRatio: 0.03,
      animations: 'disabled',
    })
  })
})
