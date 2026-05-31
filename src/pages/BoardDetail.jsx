import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, BellIcon, DotsIcon, HeartIcon, BookmarkIcon, SendIcon } from '../components/icons'
import { mockPosts, mockComments } from '../data/mockData'

export default function BoardDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const post = mockPosts.find(p => p.id === Number(id)) || mockPosts[1]
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(mockComments)

  const sendComment = () => {
    if (!comment.trim()) return
    setComments(prev => [...prev, {
      id: Date.now(),
      author: '익명',
      time: '방금',
      text: comment.trim(),
      likes: 0,
      replies: [],
    }])
    setComment('')
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate('/board')} className="text-gray-700 p-1"><ArrowLeftIcon size={22} /></button>
        <div className="flex items-center gap-4 text-gray-400">
          <button><BellIcon size={20} /></button>
          <button><DotsIcon size={20} /></button>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white px-5 pt-5 pb-6">
          <h1 className="text-[20px] font-extrabold text-[#0F1F4B] leading-snug mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <span className="font-semibold text-gray-600">익명3422</span>
            <span>·</span>
            <span>자유관 5층</span>
            <span>·</span>
            <span>{post.time}</span>
            <span>·</span>
            <span>조회 218</span>
          </div>
          <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
            {'\n\n'}10분쯤 천천히 뛰는 페이스면 좋아요. 끝나고 카페에서 같이 아침 먹어도 좋고요 :){'\n\n'}
            관심 있으신 분은 댓글이나 디엠 주세요!
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['#러닝', '#모집'].map(tag => (
              <span key={tag} className="text-sm text-primary font-semibold bg-[#EEF2FA] px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* 반응 버튼 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 text-sm text-gray-500"
            >
              <HeartIcon size={18} filled={liked} color={liked ? '#E85D8A' : '#9CAFC6'} />
              <span className={liked ? 'text-[#E85D8A]' : ''}>{liked ? post.likes + 1 : post.likes}</span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto"
            >
              <BookmarkIcon size={18} filled={saved} color={saved ? '#1D3D7A' : '#9CAFC6'} />
              <span>저장</span>
            </button>
          </div>
        </div>

        {/* 댓글 */}
        <div className="px-4 py-4">
          <p className="text-sm font-bold text-[#0F1F4B] mb-4">댓글 {comments.length + comments.reduce((a, c) => a + c.replies.length, 0)}</p>
          {comments.map(c => (
            <div key={c.id} className="mb-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0DCF0] flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#0F1F4B]">{c.author}</span>
                    {c.floor && <span className="text-xs text-gray-400">{c.floor}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{c.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <button>♡ {c.likes}</button>
                    <button>답글</button>
                  </div>
                </div>
              </div>
              {c.replies.map(r => (
                <div key={r.id} className="flex items-start gap-3 mt-3 ml-8 pl-3 border-l-2 border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-[#E8EEF9] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-primary">{r.author}</span>
                      <span className="text-xs text-gray-400 ml-auto">{r.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <button>♡ {r.likes}</button>
                      <button>답글</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100 pb-8">
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendComment()}
          placeholder="댓글을 남겨주세요"
          className="flex-1 bg-[#F0F4FA] rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
        />
        <button
          onClick={sendComment}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${comment.trim() ? 'bg-primary' : 'bg-gray-200'}`}
        >
          <SendIcon size={16} color="white" />
        </button>
      </div>
    </div>
  )
}
