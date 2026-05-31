import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraIcon, LocationIcon, PlusIcon } from '../components/icons'

const SUGGESTED_TAGS = ['#러닝', '#모집', '#공부', '#밥친구', '#나눔', '#정보']

export default function BoardNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [tags, setTags] = useState(['#러닝', '#모집'])

  const toggleTag = tag => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const canSubmit = title.trim().length > 0 && body.trim().length > 0

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 border-b border-gray-100">
        <button onClick={() => navigate('/board')} className="text-[15px] text-gray-500 font-medium">
          취소
        </button>
        <span className="text-[16px] font-bold text-[#0F1F4B]">새 글</span>
        <button
          onClick={() => navigate('/board')}
          disabled={!canSubmit}
          className={`text-[15px] font-bold ${canSubmit ? 'text-primary' : 'text-gray-300'}`}
        >
          등록
        </button>
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button className="text-gray-400"><CameraIcon size={22} /></button>
          <button className="text-gray-400"><LocationIcon size={22} /></button>
        </div>
        <button
          onClick={() => setAnonymous(!anonymous)}
          className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${
            anonymous ? 'text-primary bg-[#EEF2FA]' : 'text-gray-400 bg-gray-100'
          }`}
        >
          익명 {anonymous ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 글 작성 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value.slice(0, 40))}
          placeholder="제목"
          className="w-full text-[18px] font-bold text-[#0F1F4B] placeholder:text-gray-300 outline-none mb-1"
        />
        <p className="text-xs text-gray-300 mb-4">제목 ({title.length} / 40)</p>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="내용을 입력하세요."
          rows={10}
          className="w-full text-[15px] text-gray-700 placeholder:text-gray-300 outline-none resize-none leading-relaxed"
        />
      </div>

      {/* 태그 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-sm px-3 py-1.5 rounded-full font-semibold transition-colors ${
                tags.includes(tag)
                  ? 'bg-[#EEF2FA] text-primary'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {tag}
            </button>
          ))}
          <button className="text-sm px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 flex items-center gap-1">
            <PlusIcon size={12} color="currentColor" />
            태그
          </button>
        </div>
      </div>
    </div>
  )
}
