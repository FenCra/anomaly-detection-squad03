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
  
  const bgColorClass = iconColorClass.replace('text-', 'bg-').replace('-600', '-50')

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm shadow-gray-200/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${bgColorClass} ${iconColorClass}`}>
          <div className="w-5 h-5">
            {icon}
          </div>
        </div>
      </div>
      
      <div className="text-3xl font-black text-gray-900 tracking-tight">
        {value}
      </div>
      
      {comparisonText && (
        <div className={`text-sm mt-3 font-medium flex items-center gap-1.5 ${comparisonColorClass}`}>
          {comparisonColorClass.includes('green') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : comparisonColorClass.includes('red') ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : null}
          {comparisonText}
        </div>
      )}
    </div>
  )
}
