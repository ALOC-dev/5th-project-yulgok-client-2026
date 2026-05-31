import BottomTabBar from './BottomTabBar'

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-bg">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <BottomTabBar />
    </div>
  )
}
