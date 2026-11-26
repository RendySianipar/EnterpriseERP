export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected'

export type Quotation = {
    number: string
    customer: string
    date: string
    amount: number
    status: QuotationStatus
}
