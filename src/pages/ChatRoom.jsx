import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DotsIcon, SendIcon, PlusIcon, HeartIcon } from '../components/icons'
import { mockMessages, mockMatch } from '../data/mockData'

export default function ChatRoom() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text: input.trim(), time }])
    setInput('')
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3 border-b border-gray-100 bg-white">
        <button onClick={() => navigate('/matching')} className="text-gray-700 p-1">
          <ArrowLeftIcon size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EEF2FA]" />
          <span className="text-[16px] font-bold text-[#0F1F4B]">{mockMatch.name}</span>
        </div>
        <button className="text-gray-400 p-1"><DotsIcon size={20} /></button>
      </div>

      {/* 매칭 배너 */}
      <div className="flex items-center justify-center gap-1.5 py-2 bg-[#FFF5F7] border-b border-[#FFE0E8]">
        <HeartIcon size={13} filled color="#E85D8A" />
        <span className="text-xs text-[#E85D8A] font-semibold">
          5월 13일에 서로 매칭됐어요 · {mockMatch.matchRate}% 일치
        </span>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F7F9FC]">
        {/* 날짜 구분선 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">2026.05.14 화</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => {
            const isMe = msg.from === 'me'
            const showTime = i === messages.length - 1 || messages[i + 1]?.time !== msg.time || messages[i + 1]?.from !== msg.from
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMe && <div className="w-8 h-8 rounded-full bg-[#D0DCF0] flex-shrink-0" />}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {showTime && (
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100 pb-8">
        <button className="text-gray-400 flex-shrink-0">
          <PlusIcon size={22} />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-[#F0F4FA] rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
        />
        <button
          onClick={sendMessage}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            input.trim() ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <SendIcon size={16} color="white" />
        </button>
      </div>
    </div>
  )
}
