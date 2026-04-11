import { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  iconColorClass?: string
  comparisonText?: string
  comparisonColorClass?: string
}

export default function KPICard({ 
  title, 
  value, 
  icon, 
  iconColorClass = 'text-gray-600',
  comparisonText,
  comparisonColorClass = 'text-gray-600'
}: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600">{title}</span>
        <div className={`w-5 h-5 ${iconColorClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="text-2xl font-semibold text-gray-900">
        {value}
      </div>
      
      {comparisonText && (
        <div className={`text-sm mt-1 ${comparisonColorClass}`}>
          {comparisonText}
        </div>
      )}
    </div>
  )
}
