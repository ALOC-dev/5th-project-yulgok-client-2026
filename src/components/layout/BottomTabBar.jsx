import { useNavigate, useLocation } from 'react-router-dom'
import { HeartIcon, ChatIcon, BoardIcon, PersonIcon } from '../icons'

const TABS = [
  { label: '매칭', path: '/matching', Icon: HeartIcon },
  { label: '채팅', path: '/chat', Icon: ChatIcon },
  { label: '게시판', path: '/board', Icon: BoardIcon },
  { label: '마이', path: '/mypage', Icon: PersonIcon },
]

export default function BottomTabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex bg-white border-t border-gray-100 px-2 pb-6 pt-2 safe-area-bottom">
      {TABS.map(({ label, path, Icon }) => {
        const active = pathname === path || (path !== '/matching' && pathname.startsWith(path))
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1 ${active ? 'text-primary' : 'text-gray-400'}`}
          >
            <Icon size={22} color="currentColor" />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
