import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { BellIcon, MenuIcon, HeartIcon, XIcon, ChatIcon } from '../components/icons'
import { mockMatch } from '../data/mockData'

export default function Matching() {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showBio, setShowBio] = useState(false)

  if (dismissed) {
    return (
      <MainLayout>
        <div className="flex flex-col h-full items-center justify-center px-8 text-center gap-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-primary">오늘 추천은 여기까지예요!</h2>
          <p className="text-sm text-gray-400">내일 새로운 룸메를 추천해드릴게요.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-bg">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#0F1F4B]">오늘의 룸메</h1>
            <p className="text-xs text-[#9CAFC6] mt-0.5">당신과 결이 비슷한 3명을 골라봤어요</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400"><BellIcon size={22} /></button>
            <button className="text-gray-400"><MenuIcon size={22} /></button>
          </div>
        </div>

        {/* 프로필 카드 */}
        <div className="flex-1 px-4 overflow-hidden flex flex-col">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col flex-1 max-h-[520px]">
            {/* 좋아요 배너 */}
            {mockMatch.likedMe && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF0F3]">
                <HeartIcon size={14} filled color="#E85D8A" />
                <span className="text-xs font-semibold text-[#E85D8A]">나에게 좋아요를 보냈어요</span>
              </div>
            )}

            {/* 프로필 사진 */}
            <div className="flex-1 bg-[#EEF2FA] flex items-center justify-center min-h-[200px]">
              <ProfilePhotoPlaceholder />
            </div>

            {/* 프로필 정보 */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-[18px] font-extrabold text-[#0F1F4B]">
                  {mockMatch.name} <span className="font-semibold">{mockMatch.age}살</span>
                </h3>
                <span className="text-sm font-bold text-[#2D6BE4]">매칭률 {mockMatch.matchRate}%</span>
              </div>
              <p className="text-xs text-[#9CAFC6] mb-3">
                {mockMatch.department} · {mockMatch.year}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {mockMatch.tags.map(tag => (
                  <span key={tag} className="text-xs font-semibold bg-[#EEF2FA] text-primary px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowBio(!showBio)}
                className="text-xs text-[#9CAFC6] font-semibold"
              >
                자기소개 읽어보기 ↓
              </button>
              {showBio && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  안녕하세요! 규칙적인 생활을 좋아하고 공부는 주로 도서관에서 해요. 주 3회 운동하고 청결함을 중요하게 생각해요 😊
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-center gap-6 py-6">
          <button
            onClick={() => setDismissed(true)}
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400"
          >
            <XIcon size={24} />
          </button>
          <button
            onClick={() => setLiked(!liked)}
            className={`w-16 h-16 rounded-full shadow-md flex items-center justify-center transition-colors ${liked ? 'bg-[#E85D8A]' : 'bg-primary'}`}
          >
            <HeartIcon size={26} filled color="white" />
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-primary"
          >
            <ChatIcon size={22} />
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

function ProfilePhotoPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 200 }}>
      <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#C5D1E8" fontWeight="500">
          PROFILE PHOTO
        </text>
        {/* 격자 패턴 */}
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 10 }).map((_, c) => (
            (r + c) % 2 === 0 ? (
              <rect key={`${r}-${c}`} x={c * 14} y={r * 15} width={14} height={15} fill="#E8EEF9" opacity="0.5" />
            ) : null
          ))
        )}
      </svg>
    </div>
  )
}
