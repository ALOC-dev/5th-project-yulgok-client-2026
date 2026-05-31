import { useNavigate } from 'react-router-dom'
import { AppLogo, BuildingIllustration } from '../components/icons'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-bg px-6 overflow-hidden">
      {/* 앱 헤더 */}
      <div className="flex items-center gap-3 pt-16 pb-6">
        <AppLogo size={42} />
        <span className="text-[17px] font-bold text-primary">이룸메이트</span>
      </div>

      {/* 메인 카피 */}
      <div className="mt-4">
        <h1 className="text-[34px] font-extrabold text-[#0F1F4B] leading-[1.25] tracking-tight">
          나와 결이 맞는<br />
          룸메이트를 찾는<br />
          가장 쉬운 방법.
        </h1>
        <p className="mt-5 text-[14px] text-[#9CAFC6] leading-relaxed">
          서울시립대 기숙사생만을 위한<br />
          안전한 룸메이트 매칭 서비스
        </p>
      </div>

      {/* 건물 일러스트 */}
      <div className="flex-1 flex items-end justify-center pb-6 -mx-6 overflow-hidden">
        <BuildingIllustration className="w-full text-primary opacity-15 translate-y-4" />
      </div>

      {/* 카카오 로그인 버튼 */}
      <div className="pb-12">
        <button
          onClick={() => navigate('/user-details')}
          className="w-full py-[18px] rounded-full bg-kakao flex items-center justify-center gap-3 font-bold text-[16px] text-[#1A1A1A] shadow-sm active:scale-[0.98] transition-transform"
        >
          <KakaoBubble />
          카카오 로그인
        </button>
      </div>
    </div>
  )
}

function KakaoBubble() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1A1A1A">
      <path d="M12 3C7.029 3 3 6.358 3 10.5c0 2.694 1.67 5.057 4.184 6.438L6.25 20.25l4.066-2.43C10.756 17.94 11.373 18 12 18c4.971 0 9-3.358 9-7.5S16.971 3 12 3z" />
    </svg>
  )
}
