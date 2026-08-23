import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-paper">
      <div className="flex-1">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
