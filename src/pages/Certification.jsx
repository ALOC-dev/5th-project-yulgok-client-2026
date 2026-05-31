import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ui/ProgressBar'
import { PlusIcon, CameraIcon } from '../components/icons'

export default function Certification() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)

  const handleFile = e => {
    const file = e.target.files[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      <ProgressBar current={6} total={6} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug mt-2">기숙사 인증</h2>
        <p className="text-sm text-[#9CAFC6] mt-2 mb-8">인증을 마치면 매칭이 시작돼요</p>

        {/* 안내 카드 */}
        <div className="bg-white rounded-3xl p-5 mb-4 flex flex-col items-center text-center">
          <div className="w-20 h-16 bg-[#EEF2FA] rounded-xl flex items-center justify-center mb-4">
            <IdCardIcon />
          </div>
          <p className="text-[15px] font-bold text-[#0F1F4B] mb-2">기숙사 합격 화면 캡처</p>
          <p className="text-xs text-[#9CAFC6] leading-relaxed">
            대학행정 페이지에서 본인의 이름이 포함된 화면을 캡처해주세요.
          </p>
        </div>

        {/* 파일 업로드 */}
        <label className="block">
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-[#D0DCF0] mb-4 min-h-[100px]">
            {photo ? (
              <img src={photo} alt="인증 사진" className="w-full h-36 object-cover rounded-2xl" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#EEF2FA] flex items-center justify-center">
                  <PlusIcon size={22} color="#9CAFC6" />
                </div>
                <p className="text-sm text-[#9CAFC6] font-medium">앨범에서 선택</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        {/* 안내 메시지 */}
        <div className="bg-[#F0F4FB] rounded-2xl p-4 flex gap-3">
          <span className="text-primary font-bold text-sm mt-0.5 flex-shrink-0">ℹ</span>
          <p className="text-xs text-[#6B7FA3] leading-relaxed">
            사진은 검토 후 72시간 이내 영구 삭제됩니다. 호실 정보는 매칭 시 같은 동 회원에게만 노출돼요.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 px-5 pb-10 pt-3 bg-bg">
        <button
          onClick={() => navigate('/survey/5')}
          className="w-20 py-4 rounded-full bg-[#E2E8F4] text-gray-500 font-semibold text-sm"
        >
          이전
        </button>
        <button
          onClick={() => navigate('/matching')}
          className="flex-1 py-4 rounded-full bg-primary text-white font-bold text-sm"
        >
          인증 요청 보내기
        </button>
      </div>
    </div>
  )
}

function IdCardIcon() {
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect x="1" y="1" width="46" height="34" rx="5" stroke="#C5D1E8" strokeWidth="2" />
      <rect x="6" y="8" width="12" height="14" rx="3" fill="#D0DCF0" />
      <rect x="24" y="10" width="16" height="2.5" rx="1.25" fill="#D0DCF0" />
      <rect x="24" y="16" width="12" height="2" rx="1" fill="#E2EAF4" />
      <rect x="24" y="21" width="8" height="2" rx="1" fill="#E2EAF4" />
      <text x="34" y="31" fontSize="7" fill="#C5D1E8" fontFamily="monospace">- 2026</text>
    </svg>
  )
}
