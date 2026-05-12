import { describe, it, expect } from 'vitest'
import { CUSTOMERS, STATS, DEFAULT_CUSTOMER } from '@/lib/constants'

// ——————————————————————————————————————
// CUSTOMERS — data integrity
// ——————————————————————————————————————

describe('CUSTOMERS — uniqueness', () => {
  it('all customer IDs are unique', () => {
    const ids = CUSTOMERS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all customer emails are unique', () => {
    const emails = CUSTOMERS.map(c => c.email)
    expect(new Set(emails).size).toBe(emails.length)
  })

  it('all customer phones are unique', () => {
    const phones = CUSTOMERS.map(c => c.phone)
    expect(new Set(phones).size).toBe(phones.length)
  })
})

describe('CUSTOMERS — required fields', () => {
  it('every customer has a non-empty id', () => {
    CUSTOMERS.forEach(c => expect(c.id.trim().length).toBeGreaterThan(0))
  })

  it('every customer has a non-empty name', () => {
    CUSTOMERS.forEach(c => expect(c.name.trim().length).toBeGreaterThan(0))
  })

  it('every customer has a non-empty firstName', () => {
    CUSTOMERS.forEach(c => expect(c.firstName.trim().length).toBeGreaterThan(0))
  })

  it('every customer email contains "@"', () => {
    CUSTOMERS.forEach(c => expect(c.email).toContain('@'))
  })

  it('every customer has a valid plan', () => {
    const validPlans = new Set(['Starter', 'Pro', 'Enterprise'])
    CUSTOMERS.forEach(c => {
      expect(validPlans.has(c.plan), `Customer "${c.name}" has invalid plan "${c.plan}"`).toBe(true)
    })
  })

  it('every customer has a valid status', () => {
    const validStatuses = new Set(['paid', 'overdue', 'pending'])
    CUSTOMERS.forEach(c => {
      expect(validStatuses.has(c.status), `Customer "${c.name}" has invalid status "${c.status}"`).toBe(true)
    })
  })

  it('every customer has a non-empty value (monetary amount)', () => {
    CUSTOMERS.forEach(c => expect(c.value.trim().length).toBeGreaterThan(0))
  })

  it('every customer has a non-empty phone', () => {
    CUSTOMERS.forEach(c => expect(c.phone.trim().length).toBeGreaterThan(0))
  })
})

describe('CUSTOMERS — business rules', () => {
  it('overdue customers have days > 0', () => {
    CUSTOMERS.filter(c => c.status === 'overdue').forEach(c => {
      expect(c.days, `Overdue customer "${c.name}" should have days > 0`).toBeGreaterThan(0)
    })
  })

  it('pending customers have days >= 0', () => {
    CUSTOMERS.filter(c => c.status === 'pending').forEach(c => {
      expect(c.days, `Pending customer "${c.name}" should have days >= 0`).toBeGreaterThanOrEqual(0)
    })
  })

  it('firstName is a substring of the full name (case-insensitive)', () => {
    CUSTOMERS.forEach(c => {
      expect(c.name.toLowerCase()).toContain(c.firstName.toLowerCase())
    })
  })

  it('has at least one customer with status "paid"', () => {
    expect(CUSTOMERS.some(c => c.status === 'paid')).toBe(true)
  })

  it('has at least one customer with status "overdue"', () => {
    expect(CUSTOMERS.some(c => c.status === 'overdue')).toBe(true)
  })

  it('has at least one customer with status "pending"', () => {
    expect(CUSTOMERS.some(c => c.status === 'pending')).toBe(true)
  })

  it('has at least one customer per plan tier', () => {
    const plans = new Set(CUSTOMERS.map(c => c.plan))
    expect(plans.has('Starter')).toBe(true)
    expect(plans.has('Pro')).toBe(true)
    expect(plans.has('Enterprise')).toBe(true)
  })
})

// ——————————————————————————————————————
// DEFAULT_CUSTOMER
// ——————————————————————————————————————

describe('DEFAULT_CUSTOMER', () => {
  it('DEFAULT_CUSTOMER is the first entry in CUSTOMERS', () => {
    expect(DEFAULT_CUSTOMER.id).toBe(CUSTOMERS[0].id)
  })

  it('DEFAULT_CUSTOMER is present in the CUSTOMERS array', () => {
    expect(CUSTOMERS.some(c => c.id === DEFAULT_CUSTOMER.id)).toBe(true)
  })

  it('DEFAULT_CUSTOMER is not paid (used as cobrança fallback)', () => {
    expect(DEFAULT_CUSTOMER.status).not.toBe('paid')
  })

  it('DEFAULT_CUSTOMER has days > 0 (meaningful fallback for cobrança flows)', () => {
    expect(DEFAULT_CUSTOMER.days).toBeGreaterThan(0)
  })

  it('DEFAULT_CUSTOMER has a firstName (used in WhatsApp preview message)', () => {
    expect(DEFAULT_CUSTOMER.firstName.trim().length).toBeGreaterThan(0)
  })

  it('DEFAULT_CUSTOMER has a phone (used in confirm cobrança message)', () => {
    expect(DEFAULT_CUSTOMER.phone.trim().length).toBeGreaterThan(0)
  })
})

// ——————————————————————————————————————
// STATS — data integrity
// ——————————————————————————————————————

describe('STATS — data integrity', () => {
  it('has exactly 4 stats (matches the 2×2 mobile grid and 4-col desktop grid)', () => {
    expect(STATS).toHaveLength(4)
  })

  it('every stat has a non-empty label', () => {
    STATS.forEach(s => expect(s.label.trim().length).toBeGreaterThan(0))
  })

  it('every stat has a non-empty value', () => {
    STATS.forEach(s => expect(s.value.trim().length).toBeGreaterThan(0))
  })

  it('every stat has a non-empty delta (trend description)', () => {
    STATS.forEach(s => expect(s.delta.trim().length).toBeGreaterThan(0))
  })

  it('every stat has a boolean "up" field (drives TrendingUp vs TrendingDown icon)', () => {
    STATS.forEach(s => expect(typeof s.up).toBe('boolean'))
  })

  it('stat labels are all unique', () => {
    const labels = STATS.map(s => s.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
