"use client"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isLoggedIn = !!user

  // 세션 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        // 기존 localStorage 데이터 정리
        localStorage.removeItem("battery-dashboard-auth-user")
        
        const savedUser = sessionStorage.getItem("battery-dashboard-auth-user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  // 사용자 정보를 세션 스토리지에 저장
  const saveUserToStorage = (userData: User) => {
    try {
      sessionStorage.setItem("battery-dashboard-auth-user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("사용자 정보 저장 실패:", error)
    }
  }

  // 회원가입 기능
  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:5000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      })

      const data = await response.json()
      return {
        success: data.success,
        message: data.message
      }
    } catch (error) {
      console.error("회원가입 실패:", error)
      return { success: false, message: "서버 연결 오류가 발생했습니다." }
    }
  }

  // 로그인 기능
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()
      
      if (data.success && data.data) {
        // 로그인 성공 시 사용자 정보 저장
        const userData: User = {
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          createdAt: data.data.createdAt
        }
        saveUserToStorage(userData)
      }

      return {
        success: data.success,
        message: data.message
      }
    } catch (error) {
      console.error("로그인 실패:", error)
      return { success: false, message: "서버 연결 오류가 발생했습니다." }
    }
  }

  // 로그아웃 기능
  const logout = () => {
    try {
      sessionStorage.removeItem("battery-dashboard-auth-user")
      setUser(null)
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 