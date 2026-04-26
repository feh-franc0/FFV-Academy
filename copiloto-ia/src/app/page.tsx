'use client'

import { useState } from 'react'
import FakeSystem from '@/components/system/FakeSystem'
import CopilotWidget from '@/components/copilot/CopilotWidget'
import { type Customer } from '@/lib/constants'

export default function Home() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  return (
    <>
      <FakeSystem
        onSelectCustomer={setSelectedCustomer}
        selectedCustomerId={selectedCustomer?.id ?? null}
      />
      <CopilotWidget selectedCustomer={selectedCustomer} />
    </>
  )
}
