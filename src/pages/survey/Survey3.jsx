import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SurveyLayout from '../../components/layout/SurveyLayout'
import ToggleGroup from '../../components/ui/ToggleGroup'

const MEAL_OPTIONS = [
  { value: 'often', label: '자주' },
  { value: 'sometimes', label: '가끔' },
  { value: 'never', label: '안 함' },
]
const SMOKING_OPTIONS = [
  { value: 'smoker', label: '흡연자' },
  { value: 'nonsmoker', label: '비흡연자' },
]
const TEMP_OPTIONS = [
  { value: 'cool', label: '서늘하게' },
  { value: 'moderate', label: '적당히' },
  { value: 'warm', label: '따뜻하게' },
]
const MEDIA_OPTIONS = [
  { value: 'earphone', label: '이어폰만' },
  { value: 'speaker', label: '스피커' },
  { value: 'both', label: '둘 다' },
]
const CALL_OPTIONS = [
  { value: 'outside', label: '나가서 통화' },
  { value: 'earphone', label: '이어폰 사용' },
  { value: 'free', label: '자유롭게' },
]

export default function Survey3() {
  const navigate = useNavigate()
  const [meal, setMeal] = useState('sometimes')
  const [smoking, setSmoking] = useState('nonsmoker')
  const [temp, setTemp] = useState('moderate')
  const [media, setMedia] = useState('earphone')
  const [call, setCall] = useState('earphone')

  return (
    <SurveyLayout
      current={4}
      total={6}
      onPrev={() => navigate('/survey/2')}
      onNext={() => navigate('/survey/4')}
    >
      <p className="text-sm font-semibold text-primary mb-1 mt-2">생활</p>
      <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug mb-8">방 안 생활 습관</h2>

      <ToggleGroup
        question="방안 취식"
        options={MEAL_OPTIONS}
        value={meal}
        onChange={setMeal}
        cols={3}
      />
      <ToggleGroup
        question="흡연 여부"
        options={SMOKING_OPTIONS}
        value={smoking}
        onChange={setSmoking}
        cols={2}
      />
      <ToggleGroup
        question="실내 온도 선호"
        options={TEMP_OPTIONS}
        value={temp}
        onChange={setTemp}
        cols={3}
      />
      <ToggleGroup
        question="음악·영상 감상 방식"
        options={MEDIA_OPTIONS}
        value={media}
        onChange={setMedia}
        cols={3}
      />
      <ToggleGroup
        question="방에서 통화 여부"
        options={CALL_OPTIONS}
        value={call}
        onChange={setCall}
        cols={2}
      />
    </SurveyLayout>
  )
}
