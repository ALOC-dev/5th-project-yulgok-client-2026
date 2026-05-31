export default function ProgressBar({ current, total }) {
  const pct = (current / total) * 100
  return (
    <div className="px-5 pt-5 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[3px] bg-[#D0DCF0] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{current} / {total}</span>
      </div>
    </div>
  )
}
