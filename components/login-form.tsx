"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LoginFormProps {
  onBackToHome?: () => void
}

export default function LoginForm({ onBackToHome }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      let result
      if (showCreateAccount) {
        if (!name.trim()) {
          setMessage({ type: "error", text: "이름을 입력해주세요." })
          return
        }
        result = await register(email, password, name)
      } else {
        result = await login(email, password)
      }

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        
        if (showCreateAccount) {
          // 회원가입 성공 시 이메일 저장하고 폼 초기화
          const registeredEmail = email
          setPassword("")
          setName("")
          
          // 카운트다운 시작
          setCountdown(3)
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval)
                setShowCreateAccount(false)
                setMessage(null)
                setCountdown(null)
                // 로그인 창으로 전환 시 이메일 자동 입력
                setEmail(registeredEmail)
                return null
              }
              return prev - 1
            })
          }, 1000)
        } else {
          // 로그인 성공 시 메인페이지로 돌아가기
          setTimeout(() => {
            onBackToHome?.()
          }, 1000)
        }
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "예상치 못한 오류가 발생했습니다." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      ></div>

      {/* 글로우 효과 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* 뒤로가기 버튼 */}
      {onBackToHome && (
        <div className="absolute top-6 left-6 z-20">
          <Button
            onClick={onBackToHome}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인으로
          </Button>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">L&F</h1>
            <p className="text-blue-200 text-lg font-medium">2차전지 양극재 품질 예측 AI 시스템</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-white">
                {showCreateAccount ? "계정 생성" : "로그인"}
              </CardTitle>
              <CardDescription className="text-center text-blue-200">
                {showCreateAccount
                  ? "대시보드에 접근하기 위해 계정을 생성하세요"
                  : "대시보드에 접근하기 위해 로그인하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-4 ${message.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}>
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <AlertDescription className={message.type === "error" ? "text-red-200" : "text-green-200"}>
                    {message.text}
                    {countdown !== null && message.type === "success" && (
                      <div className="mt-2 text-sm">
                        {countdown}초 후 로그인 창으로 이동합니다...
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {showCreateAccount && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">
                      이름
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20 disabled:opacity-50"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="engineer@lnf.co.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium">
                    비밀번호
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20 disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isSubmitting ? "처리 중..." : (showCreateAccount ? "계정 생성" : "로그인")}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAccount(!showCreateAccount)
                    setMessage(null)
                    setCountdown(null)
                  }}
                  className="text-sm text-blue-300 hover:text-blue-100 hover:underline transition-colors"
                >
                  {showCreateAccount ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 계정 생성"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
