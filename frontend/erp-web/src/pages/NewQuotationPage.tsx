import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const quotationSchema = z.object({
    customer: z.string().trim().min(1, 'Customer name is required'),
    date: z.string().min(1, 'Quotation date is required'),
    amount: z
        .number({ error: 'Amount is required' })
        .positive('Amount must be greater than zero'),
})

type QuotationFormData = z.infer<typeof quotationSchema>

type NewQuotationPageProps = {
    onSubmit: (data: QuotationFormData) => void
    onCancel: () => void
}

export default function NewQuotationPage({
    onSubmit,
    onCancel,
}: NewQuotationPageProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<QuotationFormData>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            customer: '',
            date: new Date().toISOString().slice(0, 10),
            amount: 0,
        },
    })

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">New quotation</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Enter the customer and quotation details.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div>
                    <label htmlFor="customer" className="mb-2 block text-sm font-medium">
                        Customer name
                    </label>
                    <input
                        id="customer"
                        {...register('customer')}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="e.g. Acme Corporation"
                    />
                    {errors.customer && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.customer.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="date" className="mb-2 block text-sm font-medium">
                        Quotation date
                    </label>
                    <input
                        id="date"
                        type="date"
                        {...register('date')}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {errors.date && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.date.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="amount" className="mb-2 block text-sm font-medium">
                        Amount (IDR)
                    </label>
                    <input
                        id="amount"
                        type="number"
                        step="1"
                        {...register('amount', { valueAsNumber: true })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="12500000"
                    />
                    {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.amount.message}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Save quotation
                    </button>
                </div>
            </form>
        </div>
    )
}

