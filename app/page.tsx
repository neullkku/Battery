"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import HomePage from "@/app/mainpage"
import Dashboard from "@/components/dashboard"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { isLoggedIn, isLoading, user, logout } = useAuth()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인 폼을 보여주는 경우
  if (showLoginForm) {
    return <LoginForm onBackToHome={() => setShowLoginForm(false)} />
  }

  // 대시보드를 보여주는 경우
  if (showDashboard) {
    return <Dashboard 
      user={user} 
      onLogout={() => {
        logout()
        setShowDashboard(false)
      }}
      onBackToHome={() => setShowDashboard(false)}
    />
  }

  // 메인페이지를 보여주되, 로그인 상태에 따라 다른 내용 표시
  return <HomePage 
    onLoginClick={() => setShowLoginForm(true)}
    onDashboardClick={() => setShowDashboard(true)}
  />
}
