export default function ToggleGroup({ question, options, value, onChange, cols = 2 }) {
  const gridClass = cols === 3 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <div className="mb-7">
      <h3 className="text-[15px] font-bold text-primary mb-3">{question}</h3>
      <div className={`grid ${gridClass} gap-2`}>
        {options.map((option, i) => {
          const isSelected = value === option.value
          const isLastOdd = options.length % cols !== 0 && i === options.length - 1
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={[
                'py-3.5 px-3 rounded-2xl text-sm font-semibold border-[1.5px] transition-colors text-center',
                isLastOdd ? (cols === 2 ? 'col-span-2' : 'col-span-3') : '',
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-200',
              ].join(' ')}
            >
              {isSelected ? `✓ ${option.label}` : option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
