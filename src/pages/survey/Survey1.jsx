import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SurveyLayout from '../../components/layout/SurveyLayout'
import SliderInput from '../../components/ui/SliderInput'
import ToggleGroup from '../../components/ui/ToggleGroup'

const SNORING_OPTIONS = [
  { value: 'none', label: '없어요' },
  { value: 'sometimes', label: '가끔' },
  { value: 'often', label: '자주' },
]
const SLEEPTALK_OPTIONS = [
  { value: 'none', label: '없어요' },
  { value: 'sometimes', label: '가끔' },
  { value: 'often', label: '자주' },
]

export default function Survey1() {
  const navigate = useNavigate()
  const [bedtime, setBedtime] = useState(3)
  const [snoring, setSnoring] = useState('none')
  const [sleepTalk, setSleepTalk] = useState('none')

  return (
    <SurveyLayout
      current={2}
      total={6}
      onPrev={() => navigate('/user-details')}
      onNext={() => navigate('/survey/2')}
    >
      <p className="text-sm font-semibold text-primary mb-1 mt-2">수면</p>
      <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug mb-8">잠과 활동 리듬</h2>

      <SliderInput
        question="취침 시간대"
        value={bedtime}
        onChange={setBedtime}
        leftLabel="이른 편"
        rightLabel="늦은 편"
      />
      <ToggleGroup
        question="코골이"
        options={SNORING_OPTIONS}
        value={snoring}
        onChange={setSnoring}
        cols={3}
      />
      <ToggleGroup
        question="잠꼬대"
        options={SLEEPTALK_OPTIONS}
        value={sleepTalk}
        onChange={setSleepTalk}
        cols={3}
      />
    </SurveyLayout>
  )
}
