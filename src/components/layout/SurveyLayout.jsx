import ProgressBar from '../ui/ProgressBar'

export default function SurveyLayout({ current, total, onPrev, onNext, nextLabel = '다음', children }) {
  return (
    <div className="flex flex-col h-screen bg-bg">
      <ProgressBar current={current} total={total} />
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {children}
      </div>
      <div className="flex gap-3 px-5 pb-10 pt-3 bg-bg">
        <button
          onClick={onPrev}
          className="w-20 py-4 rounded-full bg-[#E2E8F4] text-gray-500 font-semibold text-sm"
        >
          이전
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-full bg-primary text-white font-bold text-sm"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
