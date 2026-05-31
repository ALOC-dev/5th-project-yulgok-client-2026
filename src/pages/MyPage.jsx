import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { DotsIcon, ChevronRightIcon, BuildingIllustration } from '../components/icons'
import { mockUser } from '../data/mockData'

const MENU_ITEMS = [
  { label: '프로필 편집', badge: null },
  { label: '설문 다시하기', badge: '3일 전' },
  { label: '알림 설정', badge: 'ON' },
  { label: '차단 / 신고 관리', badge: null },
  { divider: true },
  { label: '이용권한', badge: null },
  { label: '개인정보 처리방침', badge: null },
  { label: '문의하기', badge: null },
]

export default function MyPage() {
  const navigate = useNavigate()

  return (
    <MainLayout>
      <div className="bg-bg min-h-full pb-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <h1 className="text-[22px] font-extrabold text-[#0F1F4B]">마이 페이지</h1>
          <button className="text-gray-400"><DotsIcon size={20} /></button>
        </div>

        {/* 프로필 카드 */}
        <div className="mx-4 mb-5">
          <div className="relative bg-primary rounded-3xl px-5 pt-5 pb-6 overflow-hidden">
            {/* 배경 건물 일러스트 */}
            <div className="absolute right-0 bottom-0 w-48 opacity-20">
              <BuildingIllustration className="text-white" />
            </div>

            <div className="relative z-10 flex items-center gap-4 mb-5">
              {/* 아바타 */}
              <div className="w-16 h-16 rounded-2xl bg-[#D0DCF0] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8AACD0" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-[18px] font-extrabold text-white">{mockUser.name}</p>
                <p className="text-sm text-[#A8C0E8] mt-0.5">{mockUser.department} · {mockUser.year}</p>
              </div>
            </div>

            {/* 통계 */}
            <div className="relative z-10 flex gap-0 bg-white/10 rounded-2xl px-2 py-3">
              {[
                { label: '대화중', value: mockUser.stats.chats },
                { label: '내가 좋아요', value: mockUser.stats.liked },
                { label: '나를 좋아요', value: mockUser.stats.likedBy },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex-1 flex flex-col items-center ${i > 0 ? 'border-l border-white/20' : ''}`}>
                  <span className="text-[22px] font-extrabold text-white">{stat.value}</span>
                  <span className="text-[10px] text-[#A8C0E8] mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="mx-4 bg-white rounded-3xl overflow-hidden">
          {MENU_ITEMS.map((item, i) => {
            if (item.divider) return <div key={i} className="h-px bg-gray-100 mx-4" />
            return (
              <button
                key={item.label}
                onClick={() => item.label === '설문 다시하기' ? navigate('/survey/1') : null}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 active:bg-gray-100"
              >
                <span className="text-[14px] font-semibold text-[#0F1F4B]">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className={`text-xs font-semibold ${
                      item.badge === 'ON' ? 'text-[#2DAE8F]' : 'text-gray-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRightIcon size={16} color="#C5D1E8" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
