import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/quotations', label: 'Quotations', end: false },
]

function navClass({ isActive }: { isActive: boolean }) {
    return `block rounded-lg px-4 py-3 ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
        }`
}

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-950 p-6 text-white md:block">
                <h1 className="text-2xl font-bold">Enterprise ERP</h1>
                <p className="mt-2 text-sm text-slate-400">Business management</p>

                <nav className="mt-10 space-y-2">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <main className="md:ml-64">
                <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-10">
                    <h2 className="text-xl font-semibold">Enterprise ERP</h2>
                    <p className="mt-1 text-sm text-slate-500">Business operations</p>
                </header>

                <section className="p-6 md:p-10">
                    <Outlet />
                </section>
            </main>
        </div>
    )
}
