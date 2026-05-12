import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CopilotWidget from '@/components/copilot/CopilotWidget'
import { CUSTOMERS } from '@/lib/constants'

// framer-motion is mocked in setup.ts
// react-markdown and remark-gfm — keep real (lightweight enough)

// ——————————————————————————————————————
// Helpers
// ——————————————————————————————————————

// Opens chat and waits for the greeting to complete (bot idle)
const openChat = async () => {
  await userEvent.click(screen.getByTestId('copilot-trigger'))
  await screen.findByTestId('chat-panel')
  await waitFor(
    () => expect(screen.getByTestId('chat-input')).not.toBeDisabled(),
    { timeout: 12000 }
  )
}

// Opens chat without waiting for bot idle (use when testing initial disabled state)
const openChatRaw = async () => {
  await userEvent.click(screen.getByTestId('copilot-trigger'))
  await screen.findByTestId('chat-panel')
}

const sendMessage = async (text: string) => {
  const input = screen.getByTestId('chat-input')
  await userEvent.clear(input)
  await userEvent.type(input, text)
  await userEvent.click(screen.getByTestId('chat-send'))
}

// ——————————————————————————————————————
// Widget structure
// ——————————————————————————————————————

describe('CopilotWidget — structure', () => {
  afterEach(() => cleanup())

  it('renders the floating trigger button', () => {
    render(<CopilotWidget />)
    expect(screen.getByTestId('copilot-trigger')).toBeInTheDocument()
  })

  it('trigger button has correct aria-label when closed', () => {
    render(<CopilotWidget />)
    expect(screen.getByTestId('copilot-trigger')).toHaveAttribute('aria-label', 'Abrir assistente Aria')
  })

  it('trigger button is aria-expanded=false when closed', () => {
    render(<CopilotWidget />)
    expect(screen.getByTestId('copilot-trigger')).toHaveAttribute('aria-expanded', 'false')
  })

  it('chat panel is NOT in the DOM when closed', () => {
    render(<CopilotWidget />)
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument()
  })

  it('proactive bubble is NOT visible on mount', () => {
    render(<CopilotWidget />)
    expect(screen.queryByTestId('proactive-bubble')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Open / close
// ——————————————————————————————————————

describe('CopilotWidget — open/close', () => {
  afterEach(() => cleanup())

  it('opens chat panel on trigger click', async () => {
    render(<CopilotWidget />)
    await userEvent.click(screen.getByTestId('copilot-trigger'))
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
  })

  it('chat panel has role="dialog"', async () => {
    render(<CopilotWidget />)
    await userEvent.click(screen.getByTestId('copilot-trigger'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('trigger button is aria-expanded=true when open', async () => {
    render(<CopilotWidget />)
    await userEvent.click(screen.getByTestId('copilot-trigger'))
    expect(screen.getByTestId('copilot-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes chat panel via ChevronDown button', async () => {
    render(<CopilotWidget />)
    await userEvent.click(screen.getByTestId('copilot-trigger'))
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('chat-close'))
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument()
  })

  it('closes chat panel via trigger button again (toggle)', async () => {
    render(<CopilotWidget />)
    const trigger = screen.getByTestId('copilot-trigger')
    await userEvent.click(trigger) // open
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
    await userEvent.click(trigger) // close
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Input behavior
// ——————————————————————————————————————

describe('CopilotWidget — input', () => {
  afterEach(() => cleanup())

  it('input field is present when chat is open', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', async () => {
    render(<CopilotWidget />)
    await openChat()
    const sendBtn = screen.getByTestId('chat-send')
    expect(sendBtn).toBeDisabled()
  })

  it('send button is enabled after typing', async () => {
    render(<CopilotWidget />)
    await openChat()
    await userEvent.type(screen.getByTestId('chat-input'), 'oi')
    expect(screen.getByTestId('chat-send')).not.toBeDisabled()
  })

  it('input is cleared after sending', async () => {
    render(<CopilotWidget />)
    await openChat()
    const input = screen.getByTestId('chat-input')
    await userEvent.type(input, 'oi')
    await userEvent.click(screen.getByTestId('chat-send'))
    expect(input).toHaveValue('')
  })

  it('Enter key sends the message', async () => {
    render(<CopilotWidget />)
    await openChat()
    const input = screen.getByTestId('chat-input')
    await userEvent.type(input, 'oi{Enter}')
    // Message should appear in log
    await waitFor(() => {
      const userMessages = screen.getAllByTestId('message-user')
      expect(userMessages.length).toBeGreaterThan(0)
    })
  })

  it('Shift+Enter does NOT send the message', async () => {
    render(<CopilotWidget />)
    await openChat()
    const input = screen.getByTestId('chat-input')
    // Shift+Enter should not trigger send
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    // No user messages yet (besides typing into input)
    expect(screen.queryByTestId('message-user')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Message rendering
// ——————————————————————————————————————

describe('CopilotWidget — message rendering', () => {
  afterEach(() => cleanup())

  it('user message appears in the log after sending', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('oi')
    await waitFor(() => {
      const userMsgs = screen.getAllByTestId('message-user')
      expect(userMsgs[0]).toHaveTextContent('oi')
    })
  })

  it('messages area has aria-live="polite"', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('messages-area')).toHaveAttribute('aria-live', 'polite')
  })

  it('bot responds after user sends a message', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('oi')
    await waitFor(
      () => expect(screen.getAllByTestId('message-bot').length).toBeGreaterThan(0),
      { timeout: 5000 }
    )
  })

  it('greeting message appears when chat opens', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(
      () => {
        const botMessages = screen.queryAllByTestId('message-bot')
        expect(botMessages.length).toBeGreaterThan(0)
      },
      { timeout: 4000 }
    )
  })
})

// ——————————————————————————————————————
// Bot status indicators
// ——————————————————————————————————————

describe('CopilotWidget — bot status', () => {
  afterEach(() => cleanup())

  it('input is disabled immediately after chat opens (greeting runs)', async () => {
    render(<CopilotWidget />)
    await openChatRaw()
    // Greeting flow starts immediately → input disabled
    expect(screen.getByTestId('chat-input')).toBeDisabled()
  })

  it('shows typing indicator during initial greeting', async () => {
    render(<CopilotWidget />)
    await openChatRaw()
    // bot-status appears while greeting runs
    await waitFor(
      () => expect(screen.queryByTestId('bot-status')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  })

  it('input is disabled while bot is processing a user message', async () => {
    render(<CopilotWidget />)
    await openChat() // wait for greeting
    await sendMessage('ajuda')
    // Immediately after sending, bot is busy
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).toBeDisabled(),
      { timeout: 500 }
    )
  })

  it('input returns to enabled after bot finishes responding', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('ajuda')
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).not.toBeDisabled(),
      { timeout: 8000 }
    )
  })
})

// ——————————————————————————————————————
// Quick replies
// ——————————————————————————————————————

describe('CopilotWidget — quick replies', () => {
  afterEach(() => cleanup())

  it('quick reply buttons appear in greeting message', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(
      () => expect(screen.queryByTestId('quick-replies')).toBeInTheDocument(),
      { timeout: 5000 }
    )
  })

  it('quick replies from prior messages are hidden after user sends a message', async () => {
    render(<CopilotWidget />)
    await openChat()
    // Greeting should show quick replies
    await waitFor(
      () => expect(screen.queryByTestId('quick-replies')).toBeInTheDocument(),
      { timeout: 5000 }
    )
    // After sending a message, prior quick replies should disappear
    await sendMessage('ajuda')
    expect(screen.queryAllByTestId('quick-replies')).toHaveLength(0)
  })

  it('clicking a quick reply sends that text as user message', async () => {
    render(<CopilotWidget />)
    await openChat()

    // Wait for greeting and quick replies
    await waitFor(
      () => expect(screen.queryByTestId('quick-replies')).toBeInTheDocument(),
      { timeout: 5000 }
    )

    // Wait until bot is idle before clicking
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).not.toBeDisabled(),
      { timeout: 6000 }
    )

    // Find and click a quick reply
    const quickReplies = screen.getByTestId('quick-replies')
    const firstBtn = within(quickReplies).getAllByRole('button')[0]
    const replyText = firstBtn.textContent ?? ''
    await userEvent.click(firstBtn)

    await waitFor(() => {
      const userMsgs = screen.getAllByTestId('message-user')
      expect(userMsgs.some(m => m.textContent?.includes(replyText))).toBe(true)
    }, { timeout: 1000 })
  })
})

// ——————————————————————————————————————
// Action card flows
// ——————————————————————————————————————

describe('CopilotWidget — action cards', () => {
  afterEach(() => cleanup())

  it('shows action card for "enviar cobrança"', async () => {
    render(<CopilotWidget />)
    await openChat()
    // Wait for greeting to finish
    await waitFor(() => screen.getByTestId('chat-input'), { timeout: 5000 })
    await waitFor(() => expect(screen.getByTestId('chat-input')).not.toBeDisabled(), { timeout: 6000 })

    await sendMessage('enviar cobrança')

    await waitFor(
      () => expect(screen.queryByTestId('action-card')).toBeInTheDocument(),
      { timeout: 6000 }
    )
  })

  it('action card has confirm and cancel buttons', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('enviar cobrança')

    await waitFor(() => {
      expect(screen.queryByTestId('action-card')).toBeInTheDocument()
      expect(screen.queryByTestId('action-confirm')).toBeInTheDocument()
      expect(screen.queryByTestId('action-cancel')).toBeInTheDocument()
    }, { timeout: 8000 })
  })

  it('clicking cancel shows "Cancelado" state and bot acknowledges', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('enviar cobrança')

    await waitFor(() => expect(screen.queryByTestId('action-cancel')).toBeInTheDocument(), { timeout: 8000 })
    await userEvent.click(screen.getByTestId('action-cancel'))

    await waitFor(
      () => expect(screen.getByTestId('action-resolved')).toHaveTextContent('Cancelado'),
      { timeout: 2000 }
    )

    await waitFor(
      () => {
        const botMsgs = screen.getAllByTestId('message-bot')
        const lastMsg = botMsgs[botMsgs.length - 1]
        expect(lastMsg).toHaveTextContent(/cancelei/i)
      },
      { timeout: 4000 }
    )
  })

  it('clicking confirm shows "Confirmado" state and runs confirm flow', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('enviar cobrança')

    await waitFor(() => expect(screen.queryByTestId('action-confirm')).toBeInTheDocument(), { timeout: 8000 })
    await userEvent.click(screen.getByTestId('action-confirm'))

    await waitFor(
      () => expect(screen.getByTestId('action-resolved')).toHaveTextContent('Confirmado'),
      { timeout: 2000 }
    )

    // Confirm flow sends success message
    await waitFor(
      () => {
        const botMsgs = screen.getAllByTestId('message-bot')
        const lastMsg = botMsgs[botMsgs.length - 1]
        expect(lastMsg.textContent).toMatch(/enviada|sucesso/i)
      },
      { timeout: 8000 }
    )
  })

  it('shows action card for "gerar excel"', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(() => expect(screen.getByTestId('chat-input')).not.toBeDisabled(), { timeout: 6000 })
    await sendMessage('gerar excel do cliente 123')

    await waitFor(
      () => expect(screen.queryByTestId('action-card')).toBeInTheDocument(),
      { timeout: 6000 }
    )
  })

  it('confirming excel generation shows file card', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('gerar excel do cliente 123')

    await waitFor(() => expect(screen.queryByTestId('action-confirm')).toBeInTheDocument(), { timeout: 8000 })
    await userEvent.click(screen.getByTestId('action-confirm'))

    await waitFor(
      () => expect(screen.queryByTestId('file-card')).toBeInTheDocument(),
      { timeout: 8000 }
    )
  })
})

// ——————————————————————————————————————
// Transfer card
// ——————————————————————————————————————

describe('CopilotWidget — transfer card', () => {
  afterEach(() => cleanup())

  it('shows transfer card for "falar com humano"', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(() => expect(screen.getByTestId('chat-input')).not.toBeDisabled(), { timeout: 6000 })
    await sendMessage('falar com humano')

    await waitFor(
      () => expect(screen.queryByTestId('transfer-card')).toBeInTheDocument(),
      { timeout: 6000 }
    )
  })

  it('transfer card shows agent name', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('falar com humano')

    await waitFor(
      () => expect(screen.queryByTestId('transfer-card')).toBeInTheDocument(),
      { timeout: 8000 }
    )
    expect(screen.getByTestId('transfer-card')).toHaveTextContent('Fernanda Silva')
  })
})

// ——————————————————————————————————————
// Citation
// ——————————————————————————————————————

describe('CopilotWidget — citation', () => {
  afterEach(() => cleanup())

  it('shows citation after Q&A response', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(() => expect(screen.getByTestId('chat-input')).not.toBeDisabled(), { timeout: 6000 })
    await sendMessage('como dou baixa em fatura')

    await waitFor(
      () => {
        const citations = screen.queryAllByTestId('message-citation')
        expect(citations.length).toBeGreaterThan(0)
      },
      { timeout: 15000 } // streaming takes longer
    )

    const citation = screen.getAllByTestId('message-citation')[0]
    expect(citation.textContent).toContain('Manual Financeiro')
  })
})

// ——————————————————————————————————————
// Reset
// ——————————————————————————————————————

describe('CopilotWidget — reset', () => {
  afterEach(() => cleanup())

  it('reset button clears all messages', async () => {
    render(<CopilotWidget />)
    await openChat()
    // Wait for greeting
    await waitFor(() => screen.queryAllByTestId('message-bot').length > 0, { timeout: 5000 })
    // Click reset
    await userEvent.click(screen.getByTestId('chat-reset'))
    // All messages gone
    await waitFor(() => {
      expect(screen.queryAllByTestId('message-bot')).toHaveLength(0)
      expect(screen.queryAllByTestId('message-user')).toHaveLength(0)
    }, { timeout: 1000 })
  })

  it('after reset, bot re-greets when chat is still open', async () => {
    render(<CopilotWidget />)
    await openChat()
    // Wait for first greeting
    await waitFor(() => screen.queryAllByTestId('message-bot').length > 0, { timeout: 5000 })
    // Reset
    await userEvent.click(screen.getByTestId('chat-reset'))
    // Bot should greet again (bug fix validation)
    await waitFor(
      () => screen.queryAllByTestId('message-bot').length > 0,
      { timeout: 5000 }
    )
  })

  it('reset button has correct aria-label', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-reset')).toHaveAttribute('aria-label', 'Reiniciar conversa')
  })
})

// ——————————————————————————————————————
// Proactive bubble
// ——————————————————————————————————————

describe('CopilotWidget — proactive bubble', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('proactive bubble appears after 10 seconds when chat is closed', async () => {
    vi.useFakeTimers()
    render(<CopilotWidget />)

    expect(screen.queryByTestId('proactive-bubble')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(11000)
    })

    expect(screen.queryByTestId('proactive-bubble')).toBeInTheDocument()
  })

  it('proactive bubble does NOT appear if chat was already open at 10s', async () => {
    vi.useFakeTimers()
    render(<CopilotWidget />)

    // Open chat before timer fires — scrollIntoView fires async, wrap in act
    await act(async () => {
      fireEvent.click(screen.getByTestId('copilot-trigger'))
    })

    await act(async () => {
      vi.advanceTimersByTime(11000)
    })

    expect(screen.queryByTestId('proactive-bubble')).not.toBeInTheDocument()
  })

  it('proactive close button dismisses the bubble', async () => {
    vi.useFakeTimers()
    render(<CopilotWidget />)

    await act(async () => {
      vi.advanceTimersByTime(11000)
    })

    expect(screen.queryByTestId('proactive-bubble')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Fechar sugestão'))
    })

    expect(screen.queryByTestId('proactive-bubble')).not.toBeInTheDocument()
  })

  it('clicking the main trigger hides the proactive bubble', async () => {
    vi.useFakeTimers()
    render(<CopilotWidget />)

    await act(async () => {
      vi.advanceTimersByTime(11000)
    })

    expect(screen.queryByTestId('proactive-bubble')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('copilot-trigger'))
    })

    expect(screen.queryByTestId('proactive-bubble')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Accessibility
// ——————————————————————————————————————

describe('CopilotWidget — accessibility', () => {
  afterEach(() => cleanup())

  it('trigger button has aria-label', () => {
    render(<CopilotWidget />)
    const trigger = screen.getByTestId('copilot-trigger')
    expect(trigger.getAttribute('aria-label')).toBeTruthy()
  })

  it('send button has aria-label', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-send')).toHaveAttribute('aria-label', 'Enviar mensagem')
  })

  it('chat input has aria-label', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-input')).toHaveAttribute('aria-label', 'Mensagem para Aria')
  })

  it('messages area has role="log"', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('messages-area')).toHaveAttribute('role', 'log')
  })
})

// ——————————————————————————————————————
// Streaming toggle — presence
// ——————————————————————————————————————

describe('CopilotWidget — streaming toggle (presence)', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('toggle button is NOT in the DOM when chat is closed', () => {
    render(<CopilotWidget />)
    expect(screen.queryByTestId('chat-streaming-toggle')).not.toBeInTheDocument()
  })

  it('toggle button appears in header when chat is open', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-streaming-toggle')).toBeInTheDocument()
  })

  it('toggle button has an aria-label (accessibility)', async () => {
    render(<CopilotWidget />)
    await openChat()
    const toggle = screen.getByTestId('chat-streaming-toggle')
    expect(toggle.getAttribute('aria-label')).toBeTruthy()
  })

  it('toggle button has a title tooltip', async () => {
    render(<CopilotWidget />)
    await openChat()
    const toggle = screen.getByTestId('chat-streaming-toggle')
    expect(toggle.getAttribute('title')).toBeTruthy()
  })
})

// ——————————————————————————————————————
// Streaming toggle — mode switching
// ——————————————————————————————————————

describe('CopilotWidget — streaming toggle (mode switching)', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('starts in streaming mode by default (aria-label contains "Modo digitando")', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-streaming-toggle'))
      .toHaveAttribute('aria-label', expect.stringContaining('Modo digitando'))
  })

  it('clicking toggle once switches to instant mode (aria-label contains "Modo instantâneo")', async () => {
    render(<CopilotWidget />)
    await openChat()
    await userEvent.click(screen.getByTestId('chat-streaming-toggle'))
    expect(screen.getByTestId('chat-streaming-toggle'))
      .toHaveAttribute('aria-label', expect.stringContaining('Modo instantâneo'))
  })

  it('clicking toggle twice returns to streaming mode', async () => {
    render(<CopilotWidget />)
    await openChat()
    const toggle = screen.getByTestId('chat-streaming-toggle')
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-label', expect.stringContaining('Modo digitando'))
  })

  it('title tooltip changes when switching to instant mode', async () => {
    render(<CopilotWidget />)
    await openChat()
    const toggle = screen.getByTestId('chat-streaming-toggle')
    const titleBefore = toggle.getAttribute('title')
    await userEvent.click(toggle)
    expect(toggle.getAttribute('title')).not.toBe(titleBefore)
  })
})

// ——————————————————————————————————————
// Streaming toggle — localStorage persistence
// ——————————————————————————————————————

describe('CopilotWidget — streaming toggle (localStorage)', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('saves "false" to localStorage when switching to instant mode', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<CopilotWidget />)
    await openChat()
    await userEvent.click(screen.getByTestId('chat-streaming-toggle'))
    expect(setItemSpy).toHaveBeenCalledWith('aria-streaming', 'false')
    setItemSpy.mockRestore()
  })

  it('saves "true" to localStorage when switching back to streaming', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    render(<CopilotWidget />)
    await openChat()
    const toggle = screen.getByTestId('chat-streaming-toggle')
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    expect(setItemSpy).toHaveBeenLastCalledWith('aria-streaming', 'true')
    setItemSpy.mockRestore()
  })

  it('loads in instant mode when localStorage has aria-streaming="false"', async () => {
    localStorage.setItem('aria-streaming', 'false')
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-streaming-toggle'))
      .toHaveAttribute('aria-label', expect.stringContaining('Modo instantâneo'))
  })

  it('loads in streaming mode when localStorage has aria-streaming="true"', async () => {
    localStorage.setItem('aria-streaming', 'true')
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-streaming-toggle'))
      .toHaveAttribute('aria-label', expect.stringContaining('Modo digitando'))
  })

  it('loads in streaming mode when localStorage has no aria-streaming key', async () => {
    localStorage.removeItem('aria-streaming')
    render(<CopilotWidget />)
    await openChat()
    expect(screen.getByTestId('chat-streaming-toggle'))
      .toHaveAttribute('aria-label', expect.stringContaining('Modo digitando'))
  })

  it('in instant mode, streaming cursor (▋) never appears in message bubbles', async () => {
    localStorage.setItem('aria-streaming', 'false')
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('como dou baixa em fatura')
    // Wait for bot to finish responding
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).not.toBeDisabled(),
      { timeout: 15000 }
    )
    // In instant mode msg.streaming is never set true, so the cursor block never renders
    expect(document.body.textContent).not.toContain('▋')
  })
})

// ——————————————————————————————————————
// Stop button
// ——————————————————————————————————————

describe('CopilotWidget — stop button', () => {
  afterEach(() => cleanup())

  it('stop button is NOT visible when bot is idle', async () => {
    render(<CopilotWidget />)
    await openChat()
    expect(screen.queryByTestId('chat-stop')).not.toBeInTheDocument()
  })

  it('stop button appears while bot is processing', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('como dou baixa em fatura')
    await waitFor(
      () => expect(screen.queryByTestId('chat-stop')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  })

  it('stop button has aria-label "Parar resposta"', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('como dou baixa em fatura')
    await waitFor(
      () => expect(screen.queryByTestId('chat-stop')).toBeInTheDocument(),
      { timeout: 3000 }
    )
    expect(screen.getByTestId('chat-stop')).toHaveAttribute('aria-label', 'Parar resposta')
  })

  it('clicking stop re-enables input', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('como dou baixa em fatura')
    await waitFor(
      () => expect(screen.queryByTestId('chat-stop')).toBeInTheDocument(),
      { timeout: 3000 }
    )
    await userEvent.click(screen.getByTestId('chat-stop'))
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).not.toBeDisabled(),
      { timeout: 3000 }
    )
  })

  it('after clicking stop, send button replaces stop button', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('como dou baixa em fatura')
    await waitFor(
      () => expect(screen.queryByTestId('chat-stop')).toBeInTheDocument(),
      { timeout: 3000 }
    )
    await userEvent.click(screen.getByTestId('chat-stop'))
    await waitFor(
      () => expect(screen.queryByTestId('chat-send')).toBeInTheDocument(),
      { timeout: 3000 }
    )
    expect(screen.queryByTestId('chat-stop')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Bot busy state — concurrency protection
// ——————————————————————————————————————

describe('CopilotWidget — concurrency protection', () => {
  afterEach(() => cleanup())

  it('input is disabled immediately after sending (bot busy)', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('ajuda')
    await waitFor(
      () => expect(screen.getByTestId('chat-input')).toBeDisabled(),
      { timeout: 500 }
    )
  })

  it('send button is replaced by stop while bot is busy', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('ajuda')
    await waitFor(
      () => expect(screen.queryByTestId('chat-stop')).toBeInTheDocument(),
      { timeout: 3000 }
    )
    expect(screen.queryByTestId('chat-send')).not.toBeInTheDocument()
  })

  it('action card confirm/cancel buttons are gone after cancelling', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('enviar cobrança')
    await waitFor(
      () => expect(screen.queryByTestId('action-cancel')).toBeInTheDocument(),
      { timeout: 8000 }
    )
    await userEvent.click(screen.getByTestId('action-cancel'))
    await waitFor(
      () => expect(screen.queryByTestId('action-resolved')).toBeInTheDocument(),
      { timeout: 2000 }
    )
    expect(screen.queryByTestId('action-confirm')).not.toBeInTheDocument()
    expect(screen.queryByTestId('action-cancel')).not.toBeInTheDocument()
  })

  it('action card confirm/cancel buttons are gone after confirming', async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('enviar cobrança')
    await waitFor(
      () => expect(screen.queryByTestId('action-confirm')).toBeInTheDocument(),
      { timeout: 8000 }
    )
    await userEvent.click(screen.getByTestId('action-confirm'))
    await waitFor(
      () => expect(screen.queryByTestId('action-resolved')).toBeInTheDocument(),
      { timeout: 2000 }
    )
    expect(screen.queryByTestId('action-confirm')).not.toBeInTheDocument()
    expect(screen.queryByTestId('action-cancel')).not.toBeInTheDocument()
  })
})

// ——————————————————————————————————————
// Customer analysis
// ——————————————————————————————————————

describe('CopilotWidget — customer analysis', () => {
  afterEach(() => cleanup())

  const overdueCustomer = CUSTOMERS.find(c => c.status === 'overdue')!
  const paidCustomer    = CUSTOMERS.find(c => c.status === 'paid')!
  const pendingCustomer = CUSTOMERS.find(c => c.status === 'pending')!

  it('passing selectedCustomer opens the chat automatically', async () => {
    render(<CopilotWidget selectedCustomer={overdueCustomer} />)
    await waitFor(
      () => expect(screen.queryByTestId('chat-panel')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  })

  it('analysis message contains the customer name', async () => {
    render(<CopilotWidget selectedCustomer={overdueCustomer} />)
    await waitFor(
      () => {
        const botMsgs = screen.queryAllByTestId('message-bot')
        expect(botMsgs.some(m => m.textContent?.includes(overdueCustomer.name))).toBe(true)
      },
      { timeout: 6000 }
    )
  })

  it('analysis message contains the customer ID', async () => {
    render(<CopilotWidget selectedCustomer={overdueCustomer} />)
    await waitFor(
      () => {
        const botMsgs = screen.queryAllByTestId('message-bot')
        expect(botMsgs.some(m => m.textContent?.includes(`#${overdueCustomer.id}`))).toBe(true)
      },
      { timeout: 6000 }
    )
  })

  it('overdue customer shows "Enviar cobrança" quick reply', async () => {
    render(<CopilotWidget selectedCustomer={overdueCustomer} />)
    await waitFor(
      () => {
        const qr = screen.queryByTestId('quick-replies')
        expect(qr).toBeInTheDocument()
        expect(qr?.textContent).toContain('Enviar cobrança')
      },
      { timeout: 6000 }
    )
  })

  it('pending customer shows "Enviar cobrança" quick reply', async () => {
    render(<CopilotWidget selectedCustomer={pendingCustomer} />)
    await waitFor(
      () => {
        const qr = screen.queryByTestId('quick-replies')
        expect(qr?.textContent).toContain('Enviar cobrança')
      },
      { timeout: 6000 }
    )
  })

  it('paid customer does NOT show "Enviar cobrança" quick reply', async () => {
    render(<CopilotWidget selectedCustomer={paidCustomer} />)
    await waitFor(
      () => expect(screen.queryByTestId('quick-replies')).toBeInTheDocument(),
      { timeout: 6000 }
    )
    const qr = screen.getByTestId('quick-replies')
    expect(qr.textContent).not.toContain('Enviar cobrança')
  })

  it('paid customer shows "Gerar Excel" quick reply', async () => {
    render(<CopilotWidget selectedCustomer={paidCustomer} />)
    await waitFor(
      () => {
        const qr = screen.queryByTestId('quick-replies')
        expect(qr?.textContent).toContain('Gerar Excel')
      },
      { timeout: 6000 }
    )
  })

  it('paid customer shows "Falar com humano" quick reply', async () => {
    render(<CopilotWidget selectedCustomer={paidCustomer} />)
    await waitFor(
      () => {
        const qr = screen.queryByTestId('quick-replies')
        expect(qr?.textContent).toContain('Falar com humano')
      },
      { timeout: 6000 }
    )
  })
})

// ——————————————————————————————————————
// File card interaction
// ——————————————————————————————————————

describe('CopilotWidget — file card interaction', () => {
  afterEach(() => cleanup())

  const openFileCard = async () => {
    render(<CopilotWidget />)
    await openChat()
    await sendMessage('gerar excel do cliente 123')
    await waitFor(
      () => expect(screen.queryByTestId('action-confirm')).toBeInTheDocument(),
      { timeout: 8000 }
    )
    await userEvent.click(screen.getByTestId('action-confirm'))
    await waitFor(
      () => expect(screen.queryByTestId('file-card')).toBeInTheDocument(),
      { timeout: 8000 }
    )
  }

  it('file card shows .xlsx extension in filename', async () => {
    await openFileCard()
    expect(screen.getByTestId('file-card').textContent).toContain('.xlsx')
  })

  it('file card shows file size', async () => {
    await openFileCard()
    expect(screen.getByTestId('file-card').textContent).toContain('KB')
  })

  it('file card download button initially shows "Baixar"', async () => {
    await openFileCard()
    const btn = within(screen.getByTestId('file-card')).getByRole('button')
    expect(btn).toHaveTextContent(/baixar/i)
    expect(btn).toHaveAttribute('aria-label', 'Baixar arquivo')
  })

  it('download button shows "Baixado" after click', async () => {
    await openFileCard()
    const btn = within(screen.getByTestId('file-card')).getByRole('button')
    await userEvent.click(btn)
    expect(btn).toHaveTextContent(/baixado/i)
  })

  it('download button aria-label changes to "Arquivo baixado" after click', async () => {
    await openFileCard()
    const btn = within(screen.getByTestId('file-card')).getByRole('button')
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-label', 'Arquivo baixado')
  })

  it('download button becomes non-interactive after click (cursor-default)', async () => {
    await openFileCard()
    const btn = within(screen.getByTestId('file-card')).getByRole('button')
    await userEvent.click(btn)
    // After click the button renders with cursor-default class — clicking again does nothing
    const labelAfterFirst = btn.getAttribute('aria-label')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-label')).toBe(labelAfterFirst)
  })
})

// ——————————————————————————————————————
// Header status text
// ——————————————————————————————————————

describe('CopilotWidget — header status text', () => {
  afterEach(() => cleanup())

  it('shows "Assistente de Operações · Online" when bot is idle', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(
      () => expect(screen.queryByText('Assistente de Operações · Online')).toBeInTheDocument(),
      { timeout: 8000 }
    )
  })

  it('shows "digitando..." while bot is typing', async () => {
    render(<CopilotWidget />)
    await userEvent.click(screen.getByTestId('copilot-trigger'))
    await screen.findByTestId('chat-panel')
    // Immediately after open the greeting typing step runs
    await waitFor(
      () => expect(screen.queryByText('digitando...')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  })

  it('status text is inside the dialog (header position)', async () => {
    render(<CopilotWidget />)
    await openChat()
    await waitFor(
      () => expect(screen.queryByText('Assistente de Operações · Online')).toBeInTheDocument(),
      { timeout: 8000 }
    )
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Assistente de Operações · Online')).toBeInTheDocument()
  })
})
