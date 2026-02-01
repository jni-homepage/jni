interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'yellow' | 'green' | 'purple'
}

const COLOR_MAP = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
}

const ICON_BG = {
  blue: 'bg-blue-100',
  yellow: 'bg-amber-100',
  green: 'bg-emerald-100',
  purple: 'bg-purple-100',
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${COLOR_MAP[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-70 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${ICON_BG[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
