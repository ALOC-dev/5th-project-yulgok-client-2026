import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import UserDetails from './pages/UserDetails'
import Survey1 from './pages/survey/Survey1'
import Survey2 from './pages/survey/Survey2'
import Survey3 from './pages/survey/Survey3'
import Survey4 from './pages/survey/Survey4'
import Certification from './pages/Certification'
import Matching from './pages/Matching'
import ChatRoom from './pages/ChatRoom'
import Board from './pages/Board'
import BoardNew from './pages/BoardNew'
import BoardDetail from './pages/BoardDetail'
import MyPage from './pages/MyPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-[430px] mx-auto min-h-screen bg-bg font-sans overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="/survey/1" element={<Survey1 />} />
          <Route path="/survey/2" element={<Survey2 />} />
          <Route path="/survey/3" element={<Survey3 />} />
          <Route path="/survey/4" element={<Survey4 />} />
          <Route path="/certification" element={<Certification />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/new" element={<BoardNew />} />
          <Route path="/board/:id" element={<BoardDetail />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
