import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { SearchIcon, BellIcon, PlusIcon, HeartIcon, ChatIcon } from '../components/icons'
import { mockPosts } from '../data/mockData'

const TABS = ['전체', '일반', '장터']

const CATEGORY_COLORS = {
  공지: 'bg-[#FFF0E6] text-[#E8832D]',
  일반: 'bg-[#EEF2FA] text-primary',
  장터: 'bg-[#EDFAF5] text-[#2DAE8F]',
}

export default function Board() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('전체')

  const filtered = mockPosts.filter(p => activeTab === '전체' || p.category === activeTab)

  return (
    <MainLayout>
      <div className="bg-bg min-h-full pb-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <h1 className="text-[22px] font-extrabold text-[#0F1F4B]">게시판</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <button><SearchIcon size={22} /></button>
            <button><BellIcon size={22} /></button>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 px-5 mb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-[#0F1F4B] text-white'
                  : 'bg-white text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 게시글 목록 */}
        <div className="px-4 flex flex-col gap-3">
          {filtered.map(post => (
            <button
              key={post.id}
              onClick={() => navigate(`/board/${post.id}`)}
              className="bg-white rounded-2xl p-4 text-left w-full shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {post.pinned && <span className="text-base">🔥</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
                      {post.category}
                    </span>
                    {post.price && (
                      <span className="text-sm font-bold text-[#0F1F4B]">
                        ₩{post.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-[#0F1F4B] truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
                </div>
                {post.hasImage && (
                  <div className="w-16 h-16 rounded-xl bg-[#EEF2FA] flex-shrink-0 overflow-hidden">
                    <ImagePlaceholder />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.time}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <HeartIcon size={12} color="#CBD5E1" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatIcon size={12} color="#CBD5E1" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* FAB */}
        <button
          onClick={() => navigate('/board/new')}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center"
        >
          <PlusIcon size={24} color="white" />
        </button>
      </div>
    </MainLayout>
  )
}

function ImagePlaceholder() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) =>
          (r + c) % 2 === 0 ? (
            <rect key={`${r}-${c}`} x={c * 16} y={r * 16} width={16} height={16} fill="#D8E4F4" />
          ) : null
        )
      )}
    </svg>
  )
}
