export default function StatCard({ label, value, icon: Icon, delta, color = 'text-apple-blue' }) {
  return (
    <div className="glass p-5 relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-200 hover:-translate-y-0.5">
      {/* Gradient blur accent */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl ${color.replace('text-', 'bg-')}`} />
      <div className="relative">
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color.replace('text-', 'bg-')}/10`}>
            <Icon size={16} className={color} />
          </div>
        )}
        <p className="text-3xl font-bold text-ink-primary tabular-nums tracking-tight mb-0.5">{value}</p>
        <p className="text-xs text-ink-tertiary">{label}</p>
        {delta !== undefined && (
          <p className={`text-xs font-medium mt-1 ${delta >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
            {delta >= 0 ? '+' : ''}{delta} this week
          </p>
        )}
      </div>
    </div>
  );
}
