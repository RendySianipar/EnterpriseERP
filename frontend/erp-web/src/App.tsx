import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import NewQuotationPage from './pages/NewQuotationPage'
import QuotationsPage from './pages/QuotationsPage'
import type { Quotation } from './types/quotation'

// Data sementara. Akan diganti dengan react-query + API (GET /v1/quotations).
const initialQuotations: Quotation[] = [
  {
    number: 'QUO-2026-001',
    customer: 'Acme Corporation',
    date: '2026-10-20',
    amount: 12500000,
    status: 'Draft',
  },
  {
    number: 'QUO-2026-002',
    customer: 'Global Industries',
    date: '2026-10-21',
    amount: 28750000,
    status: 'Sent',
  },
]

function App() {
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState(initialQuotations)

  function handleCreateQuotation(data: {
    customer: string
    date: string
    amount: number
  }) {
    // Sementara. Nomor dokumen nantinya dibuat oleh server, bukan client.
    const newQuotation: Quotation = {
      ...data,
      number: `QUO-2026-${String(quotations.length + 1).padStart(3, '0')}`,
      status: 'Draft',
    }

    setQuotations((current) => [...current, newQuotation])
    navigate('/quotations')
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="mt-2 text-slate-600">
                Welcome back. Select a module from the sidebar.
              </p>
            </div>
          }
        />
        <Route path="quotations" element={<QuotationsPage quotations={quotations} />} />
        <Route
          path="quotations/new"
          element={
            <NewQuotationPage
              onSubmit={handleCreateQuotation}
              onCancel={() => navigate('/quotations')}
            />
          }
        />
        <Route
          path="*"
          element={<h2 className="text-xl font-semibold">Page not found</h2>}
        />
      </Route>
    </Routes>
  )
}

export default App
