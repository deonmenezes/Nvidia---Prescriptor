import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9' }}>
      <Sidebar />
      <div style={{ marginLeft: 248 }}>
        {children}
      </div>
    </div>
  )
}
