import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SurveyLayout from '../../components/layout/SurveyLayout'

const MAX_BIO = 200

const QUICK_TAGS = [
  '아침형', '올빼미형', '도서관파', '카페파', '운동 즐김',
  '조용한 편', '깔끔함', '요리 좋아함', '게임 즐김', '집순이/집돌이',
]

export default function Survey4() {
  const navigate = useNavigate()
  const [bio, setBio] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const toggleTag = tag => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <SurveyLayout
      current={5}
      total={6}
      onPrev={() => navigate('/survey/3')}
      onNext={() => navigate('/certification')}
    >
      <p className="text-sm font-semibold text-primary mb-1 mt-2">자기소개</p>
      <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug mb-2">나를 소개해 주세요</h2>
      <p className="text-sm text-[#9CAFC6] mb-8">룸메이트가 나를 더 잘 이해할 수 있어요.</p>

      {/* 자기소개 입력 */}
      <div className="mb-7">
        <h3 className="text-[15px] font-bold text-primary mb-3">자기소개</h3>
        <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-primary transition-colors">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, MAX_BIO))}
            placeholder="안녕하세요! 저는 규칙적인 생활을 좋아하고..."
            rows={6}
            className="w-full px-4 pt-4 pb-10 text-[14px] text-gray-800 placeholder:text-gray-300 outline-none resize-none leading-relaxed bg-transparent"
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-300 font-medium">
            {bio.length} / {MAX_BIO}
          </span>
        </div>
      </div>

      {/* 키워드 태그 */}
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-primary mb-1">나를 표현하는 키워드</h3>
        <p className="text-xs text-[#9CAFC6] mb-3">여러 개 선택할 수 있어요</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map(tag => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition-colors ${
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>
    </SurveyLayout>
  )
}
