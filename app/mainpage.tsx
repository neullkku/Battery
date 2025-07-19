"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Shield, Target, TrendingUp, CheckCircle, Users, Award, Clock, LogOut, LogIn } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import Chatbot from "@/components/chatbot"
import { useState } from "react"

interface HomePageProps {
  onLoginClick?: () => void
  onDashboardClick?: () => void
}

export default function HomePage({ onLoginClick, onDashboardClick }: HomePageProps) {
  const { user, logout, isLoggedIn } = useAuth()
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">L&F</h1>
                <p className="text-sm text-gray-600">Battery Cathode Defect Prediction</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                기능
              </Link>
              <Link href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">
                장점
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                소개
              </Link>
              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <>
                    <span className="text-sm text-gray-600">안녕하세요, {user?.name}님</span>
                    <Button onClick={logout} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <Button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* 배경 영상 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/powder.mp4" type="video/mp4" />
          동영상을 재생할 수 없습니다.
        </video>
        
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        <div className="container mx-auto text-center relative z-20">
          <Badge className="mb-6 bg-white/90 text-blue-800 hover:bg-white/90 backdrop-blur-sm">
            <Award className="w-4 h-4 mr-2" />
            차세대 AI 품질 관리 시스템
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            2차전지 양극재
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              불량 예측 AI
            </span>
          </h1>
          <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            머신러닝과 딥러닝 기술을 활용하여 2차전지 양극재의 품질을 실시간으로 모니터링하고 
            불량을 사전에 예측하는 지능형 시스템입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Button size="lg" onClick={onDashboardClick} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 shadow-xl backdrop-blur-sm">
                  대시보드 바로가기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 shadow-xl backdrop-blur-sm">
                  시스템 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.2%</div>
              <div className="text-gray-600">예측 정확도</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">불량률 감소</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">실시간 모니터링</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">30%</div>
              <div className="text-gray-600">비용 절감</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">핵심 기능</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              첨단 AI 기술로 양극재 품질 관리의 새로운 표준을 제시합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>실시간 품질 분석</CardTitle>
                <CardDescription>
                  생산 라인에서 실시간으로 양극재 품질을 분석하고 이상 징후를 즉시 감지합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>예측 모델링</CardTitle>
                <CardDescription>
                  머신러닝 알고리즘을 통해 불량 발생을 사전에 예측하여 선제적 대응이 가능합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>자동 품질 관리</CardTitle>
                <CardDescription>AI가 자동으로 품질 기준을 모니터링하고 불량품을 식별하여 분류합니다.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>데이터 분석 대시보드</CardTitle>
                <CardDescription>
                  직관적인 대시보드를 통해 생산 현황과 품질 트렌드를 한눈에 파악할 수 있습니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>알림 시스템</CardTitle>
                <CardDescription>이상 상황 발생 시 즉시 알림을 전송하여 신속한 대응이 가능합니다.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>다중 사용자 지원</CardTitle>
                <CardDescription>
                  역할별 접근 권한 관리와 협업 기능을 통해 효율적인 팀워크를 지원합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">도입 효과</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              L&F AI 시스템 도입으로 얻을 수 있는 구체적인 이점들입니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">품질 향상</h3>
                    <p className="text-gray-600">불량품 사전 감지로 최종 제품의 품질을 크게 향상시킵니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">비용 절감</h3>
                    <p className="text-gray-600">불량품 재작업 비용과 원자재 낭비를 최소화합니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">생산성 증대</h3>
                    <p className="text-gray-600">자동화된 품질 관리로 생산 효율성을 극대화합니다.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 기반 의사결정</h3>
                    <p className="text-gray-600">정확한 데이터 분석을 통한 과학적 의사결정을 지원합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">ROI 분석</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">불량률 감소</span>
                  <span className="font-semibold text-green-600">-85%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">검사 시간 단축</span>
                  <span className="font-semibold text-blue-600">-70%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">인력 비용 절감</span>
                  <span className="font-semibold text-purple-600">-40%</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-semibold">총 비용 절감</span>
                  <span className="font-bold text-xl text-green-600">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">지금 바로 시작하세요</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            L&F AI 시스템으로 양극재 품질 관리의 혁신을 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Button size="lg" onClick={onDashboardClick} className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                  대시보드 이동
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={onLoginClick} className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                  무료 체험 시작
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 bg-transparent"
                >
                  상담 문의
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-lg font-bold">L&F</span>
              </div>
              <p className="text-gray-400">2차전지 양극재 품질 관리의 새로운 표준</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">제품</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    AI 예측 시스템
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    품질 관리 대시보드
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    실시간 모니터링
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    문서
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    기술 지원
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    교육
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    소개
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    연락처
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 L&F. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 챗봇 추가 */}
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
    </div>
  )
}
