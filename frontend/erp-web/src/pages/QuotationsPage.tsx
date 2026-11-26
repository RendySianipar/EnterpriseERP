import { Link } from 'react-router-dom'
import type { Quotation } from '../types/quotation'

type QuotationsPageProps = {
    quotations: Quotation[]
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
})

export default function QuotationsPage({ quotations }: QuotationsPageProps) {
    return (
        <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Quotations</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Manage customer quotations and their statuses.
                    </p>
                </div>
                <Link
                    to="/quotations/new"
                    className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                    + New quotation
                </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Quotation No.</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Amount</th>
                            <th className="px-5 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {quotations.map((quotation) => (
                            <tr key={quotation.number} className="hover:bg-slate-50">
                                <td className="px-5 py-4 font-medium">{quotation.number}</td>
                                <td className="px-5 py-4">{quotation.customer}</td>
                                <td className="px-5 py-4">{quotation.date}</td>
                                <td className="px-5 py-4">
                                    {currencyFormatter.format(quotation.amount)}
                                </td>
                                <td className="px-5 py-4">{quotation.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
