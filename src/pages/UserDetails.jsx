import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ui/ProgressBar'
import { ChevronDownIcon } from '../components/icons'

const DEPARTMENTS = [
  '컴퓨터과학부', '전자전기컴퓨터공학부', '기계정보공학과', '토목공학과',
  '건축학부', '환경공학부', '화학공학과', '신소재공학과',
  '수학과', '물리학과', '화학과', '통계학과',
  '경영학부', '경제학부', '행정학과', '법학부',
  '국어국문학과', '영어영문학과', '역사학과', '철학과',
  '사회복지학과', '사회학과', '도시행정학과',
]

export default function UserDetails() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('남')
  const [studentId, setStudentId] = useState('')
  const [department, setDepartment] = useState('컴퓨터과학부')
  const [deptOpen, setDeptOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-bg">
      <ProgressBar current={1} total={6} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm font-semibold text-primary mb-1">기본 정보</p>
        <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug">본인 정보를 알려주세요</h2>
        <p className="text-sm text-[#9CAFC6] mt-2 mb-8">매칭에 필요한 최소한의 정보만 받아요.</p>

        {/* 실명 */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#0F1F4B] mb-2">실명</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="박강현"
            className="w-full px-4 py-3.5 bg-white rounded-2xl text-[15px] font-medium text-gray-800 placeholder:text-gray-300 border-2 border-transparent focus:border-primary outline-none"
          />
        </div>

        {/* 나이 + 성별 */}
        <div className="mb-5">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#0F1F4B] mb-2">나이</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-3.5 bg-white rounded-2xl text-[15px] font-medium text-gray-800 placeholder:text-gray-300 border-2 border-transparent focus:border-primary outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#0F1F4B] mb-2">성별</label>
              <div className="flex gap-2">
                {['남', '여'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3.5 rounded-2xl text-[15px] font-bold transition-colors ${
                      gender === g
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 border-2 border-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 학번 */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#0F1F4B] mb-2">학번</label>
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="2022920023"
            maxLength={10}
            className="w-full px-4 py-3.5 bg-white rounded-2xl text-[15px] font-medium text-gray-800 placeholder:text-gray-300 border-2 border-transparent focus:border-primary outline-none"
          />
          <p className="text-xs text-[#9CAFC6] mt-1.5 ml-1">10자리 숫자로 입력</p>
        </div>

        {/* 학과 드롭다운 */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#0F1F4B] mb-2">학과</label>
          <div className="relative">
            <button
              onClick={() => setDeptOpen(!deptOpen)}
              className="w-full px-4 py-3.5 bg-white rounded-2xl text-[15px] font-medium text-gray-800 flex items-center justify-between border-2 border-transparent"
            >
              <span>{department}</span>
              <ChevronDownIcon size={18} color="#9CAFC6" />
            </button>
            {deptOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg z-10 max-h-52 overflow-y-auto border border-gray-100">
                {DEPARTMENTS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDepartment(d); setDeptOpen(false) }}
                    className={`w-full text-left px-4 py-3 text-sm ${d === department ? 'text-primary font-bold' : 'text-gray-700'} hover:bg-bg`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 px-5 pb-10 pt-3 bg-bg">
        <button
          onClick={() => navigate('/')}
          className="w-20 py-4 rounded-full bg-[#E2E8F4] text-gray-500 font-semibold text-sm"
        >
          이전
        </button>
        <button
          onClick={() => navigate('/survey/1')}
          className="flex-1 py-4 rounded-full bg-primary text-white font-bold text-sm"
        >
          다음
        </button>
      </div>
    </div>
  )
}
