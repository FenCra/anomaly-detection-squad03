'use client'

import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ChartCardProps {
  title: string
  data: Array<{ name: string; value: number }>
  type: 'pie' | 'bar' | 'line' | 'horizontalBar'
  colors?: string[] 
  heightClass?: string 
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function ChartCard({ title, data, type, colors, heightClass = 'h-80' }: ChartCardProps) {
  const chartColors = colors || DEFAULT_COLORS
  
  const tooltipStyle = {
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    padding: '12px 16px',
    fontWeight: 600,
    color: '#374151'
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/40 border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
      <div className={heightClass}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 700 }} />
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 700 }} />
              <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          ) : type === 'horizontalBar' ? (
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} itemStyle={{ fontWeight: 700 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} itemStyle={{ fontWeight: 700 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
