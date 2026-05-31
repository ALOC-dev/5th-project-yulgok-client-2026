export default function SliderInput({ question, sublabel, value, onChange, leftLabel, rightLabel, min = 1, max = 5 }) {
  const pct = ((value - min) / (max - min)) * 100
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  return (
    <div className="mb-8">
      <h3 className="text-[15px] font-bold text-primary mb-5">
        {question}
        {sublabel && <span className="ml-1.5 text-sm font-normal text-gray-400">{sublabel}</span>}
      </h3>
      <div className="px-1">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step="1"
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #1D3D7A 0%, #1D3D7A ${pct}%, #D0DCF0 ${pct}%, #D0DCF0 100%)`,
          }}
        />
        <div className="flex justify-between mt-2.5">
          {steps.map(v => (
            <span
              key={v}
              className={`text-sm font-bold text-center transition-colors ${
                v === value ? 'text-primary' : 'text-[#C5D1E8]'
              }`}
            >
              {v}
            </span>
          ))}
        </div>
        {(leftLabel || rightLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">{leftLabel}</span>
            <span className="text-xs text-gray-400">{rightLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
