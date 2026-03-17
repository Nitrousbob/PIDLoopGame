export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-gray-800 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            active === tab.id
              ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
