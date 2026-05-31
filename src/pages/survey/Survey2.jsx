import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SurveyLayout from '../../components/layout/SurveyLayout'
import SliderInput from '../../components/ui/SliderInput'
import ToggleGroup from '../../components/ui/ToggleGroup'

const SHOWER_OPTIONS = [
  { value: 'twice', label: '하루 두 번 이상' },
  { value: 'once', label: '하루 한 번' },
  { value: 'everyother', label: '이틀에 한 번' },
  { value: 'weekly', label: '주 몇 회' },
]

export default function Survey2() {
  const navigate = useNavigate()
  const [tidyLevel, setTidyLevel] = useState(3)
  const [shower, setShower] = useState('once')

  return (
    <SurveyLayout
      current={3}
      total={6}
      onPrev={() => navigate('/survey/1')}
      onNext={() => navigate('/survey/3')}
    >
      <p className="text-sm font-semibold text-primary mb-1 mt-2">청결·위생</p>
      <h2 className="text-[22px] font-extrabold text-[#0F1F4B] leading-snug mb-8">청결과 위생 습관</h2>

      <SliderInput
        question="정리정돈 수준"
        value={tidyLevel}
        onChange={setTidyLevel}
        leftLabel="매우 깔끔"
        rightLabel="자유로움"
      />
      <ToggleGroup
        question="샤워 빈도"
        options={SHOWER_OPTIONS}
        value={shower}
        onChange={setShower}
        cols={2}
      />
    </SurveyLayout>
  )
}
