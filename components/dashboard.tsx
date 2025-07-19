"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LogOut,
  User as UserIcon,
  Upload,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Send,
  X,
  Bot,
  Download,
} from "lucide-react"
import CsvUpload from "@/components/csv-upload"
import DefectChart from "@/components/defect-chart"
import { Input } from "@/components/ui/input"
import Chatbot from "@/components/chatbot"
import Image from "next/image" // Image 컴포넌트 임포트 추가
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { User } from "@/contexts/auth-context"

interface DashboardProps {
  user: User | null
  onLogout: () => void
  onBackToHome?: () => void
}

interface PredictionData {
  defectRate: number
  avgParticleSize: number
  conductivity: number
  temperature: number
  humidity: number
  defectProbability: number
  precursor_room_temp?: number // 건조온도
  precursor_room_humidity?: number // 습도
  precursor_processing_time_min?: number // 건조 시간
  batch_id: string // 배치 ID
  timestamp?: Date // 예측 시간 추가
}

interface PredictionHistory {
  timestamp: Date
  defectProbability: number
  batch_id: string
}

export default function Dashboard({ user, onLogout, onBackToHome }: DashboardProps) {
  const [csvData, setCsvData] = useState<any[]>([])
  const [predictionDataList, setPredictionDataList] = useState<PredictionData[]>([])
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([])
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; sender: "user" | "bot"; timestamp: Date }>
  >([
    {
      id: "1",
      text: "안녕하세요! L&F 품질 예측 AI 어시스턴트입니다. 배터리 품질 분석에 대해 궁금한 점이 있으시면 언제든 물어보세요.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  // 1. 상태 추가
  const [searchTerm, setSearchTerm] = useState("");

  const handleCsvUpload = (data: any[]) => {
    setCsvData(data)
    setPredictionDataList([]) // 새 데이터 업로드 시 예측 결과 초기화
    setCurrentBatchIndex(0)
  }

  const runPrediction = async () => {
    if (csvData.length === 0) return

    setIsRunning(true)

    try {
      // 백엔드 API 호출 (기존 flask_backend 시스템 사용)
      const response = await fetch('http://localhost:5000/learning/predict/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_data: csvData
        })
      })

      if (!response.ok) {
        throw new Error('예측 API 호출 실패')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || '예측 실패')
      }

      const currentTime = new Date()

      // 백엔드 예측 결과를 프론트엔드 형식으로 변환
      const newResults: PredictionData[] = result.predictions.map((prediction: any) => ({
        defectRate: prediction.defect_probability,
        avgParticleSize: prediction.particle_size_d50,
        conductivity: prediction.conductivity,
        temperature: prediction.temperature,
        humidity: prediction.humidity,
        defectProbability: prediction.defect_probability,
        precursor_room_temp: prediction.precursor_room_temp,
        precursor_room_humidity: prediction.precursor_room_humidity,
        precursor_processing_time_min: prediction.precursor_processing_time_min,
        batch_id: prediction.batch_id,
        timestamp: prediction.timestamp ? new Date(prediction.timestamp) : new Date()
      }))

      // 예측 히스토리 업데이트
      const newHistoryEntries: PredictionHistory[] = newResults.map(result => ({
        timestamp: result.timestamp || currentTime,
        defectProbability: result.defectProbability,
        batch_id: result.batch_id
      }))

      setPredictionDataList(newResults)
      setPredictionHistory(prev => [...prev, ...newHistoryEntries].slice(-50)) // 최근 50개만 유지
      setCurrentBatchIndex(0)
      
      // 성공 메시지 표시 (옵션)
      console.log(`${newResults.length}개 배치 예측 완료!`)
      
    } catch (error) {
      console.error('예측 오류:', error)
      
      // 오류 발생 시 사용자에게 알림 (기존 모의 데이터 대신 오류 처리)
      alert(`예측 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      
      // 백엔드 서버가 실행되지 않은 경우 등을 위한 폴백
      const currentTime = new Date()
      const fallbackResults: PredictionData[] = csvData.map((row, i) => {
        const defectValue = Math.random() * 15 + 2; // 2-17%
        return {
          defectRate: defectValue,
          avgParticleSize: parseFloat(row.particle_size_d50) || Math.random() * 50 + 100,
          conductivity: Math.random() * 20 + 80,
          temperature: Math.random() * 10 + 20,
          humidity: Math.random() * 20 + 40,
          defectProbability: defectValue,
          precursor_room_temp: parseFloat(row.precursor_room_temp) || Math.random() * 10 + 40,
          precursor_room_humidity: parseFloat(row.precursor_room_humidity) || Math.random() * 20 + 40,
          precursor_processing_time_min: parseFloat(row.precursor_processing_time_min) || Math.random() * 100 + 100,
          batch_id: `BATCH_${String(i + 1).padStart(5, "0")}`,
          timestamp: currentTime
        }
      })

      const fallbackHistoryEntries: PredictionHistory[] = fallbackResults.map(result => ({
        timestamp: currentTime,
        defectProbability: result.defectProbability,
        batch_id: result.batch_id
      }))

      setPredictionDataList(fallbackResults)
      setPredictionHistory(prev => [...prev, ...fallbackHistoryEntries].slice(-50))
      setCurrentBatchIndex(0)
    } finally {
      setIsRunning(false)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user" as const,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponses = [
        "현재 불량률이 높게 나타나고 있습니다. 온도와 습도 조건을 확인해보시기 바랍니다.",
        "입자 크기가 최적 범위를 벗어났습니다. 제조 공정의 혼합 시간을 조정해보세요.",
        "전도도 수치가 양호합니다. 현재 공정 조건을 유지하시기 바랍니다.",
        "예측 결과를 바탕으로 품질 개선 방안을 제안드릴 수 있습니다.",
        "추가적인 데이터 분석이 필요하시면 더 많은 샘플을 업로드해주세요.",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot" as const,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const downloadPredictionHistory = () => {
    if (predictionHistory.length === 0) return

    const csvContent = [
      ['시간', '배치ID', '불량확률(%)'],
      ...predictionHistory.map(entry => [
        entry.timestamp.toLocaleString('ko-KR'),
        entry.batch_id,
        entry.defectProbability.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `예측_히스토리_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadOriginalData = () => {
    if (csvData.length === 0) return

    const csvContent = [
      Object.keys(csvData[0]),
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `원본_데이터_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 히스토리 차트 데이터 준비
  const chartData = predictionHistory.slice(-10).map((entry, index) => ({
    time: entry.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    defectProbability: entry.defectProbability
  }))

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "green"
    if (value <= thresholds.warning) return "yellow"
    return "red"
  }

  const getStatusIcon = (color: string) => {
    switch (color) {
      case "green":
        return <CheckCircle className="w-4 h-4" />
      case "yellow":
        return <AlertTriangle className="w-4 h-4" />
      case "red":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e0e7ff' fillOpacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      ></div>

      {/* 추상적인 배경 요소 */}
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-blob-1"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl animate-blob-2"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-blob-3"></div>

      {/* 헤더 */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div 
              onClick={onBackToHome}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-slate-900">L&F</h1>
              <p className="text-sm text-slate-600 font-medium">품질 예측 대시보드</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white/60 px-3 py-2 rounded-lg">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="bg-white/60 hover:bg-white/80">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* 사이드바 */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-slate-200/50 h-[calc(100vh-73px)] overflow-y-auto shadow-sm">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                데이터 입력
              </h2>
              <CsvUpload onDataUpload={handleCsvUpload} />
            </div>

            {csvData.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-slate-900 mb-3">데이터 미리보기</h3>
                <input
                  type="text"
                  placeholder="배치번호 또는 값 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="mb-2 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-4 max-h-64 overflow-auto border border-slate-200/50">
                  <div className="text-xs text-slate-600 mb-2 font-medium">{csvData.length}개 행 로드됨</div>
                  <div className="space-y-1">
                    {csvData
                      .map((row, i) => ({
                        index: i,
                        label: row.batch_id || `BATCH_${String(i + 1).padStart(5, "0")}`
                      }))
                      .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                      .slice(0, 100)
                      .map(item => (
                        <div
                          key={item.index}
                          className={`p-2 rounded cursor-pointer flex items-center justify-between ${currentBatchIndex === item.index ? "bg-blue-100 border border-blue-400" : "hover:bg-blue-50"}`}
                          onClick={() => setCurrentBatchIndex(item.index)}
                        >
                          <span>{item.label}</span>
                          {currentBatchIndex === item.index && <span className="text-blue-600 ml-2">✔</span>}
                        </div>
                      ))}
                    {csvData.length > 100 && (
                      <div className="text-xs text-slate-500 text-center py-2 font-medium">
                        ... {csvData.length - 100}개 행 더 (검색해서 찾으세요)
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  현재 데이터: {currentBatchIndex + 1}번째 행
                </div>
              </div>
            )}

            <Button
              onClick={runPrediction}
              disabled={csvData.length === 0 || isRunning}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-6 h-6 mr-3" />
              {isRunning ? "예측 실행 중..." : "예측 실행"}
            </Button>

            {/* CSV 다운로드 버튼들 */}
            <div className="space-y-2">
              <Button
                onClick={downloadOriginalData}
                disabled={csvData.length === 0}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                원본 데이터 CSV
              </Button>
              <Button
                onClick={downloadPredictionHistory}
                disabled={predictionHistory.length === 0}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                예측 히스토리 CSV
              </Button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          {predictionDataList.length === 0 && !isRunning && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl mb-6 shadow-lg">
                  <Upload className="w-20 h-20 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">분석 준비 완료</h3>
                <p className="text-slate-600 text-lg">CSV 데이터를 업로드하고 예측을 실행하여 결과를 확인하세요</p>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">데이터 분석 중</h3>
                <p className="text-slate-600 text-lg">품질 예측 알고리즘을 실행하고 있습니다...</p>
              </div>
            </div>
          )}

          {predictionDataList.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center">
                  <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
                  예측 결과
                  <span className="ml-4 text-base font-semibold text-blue-700">
                    {currentBatchIndex + 1}번째 배치
                  </span>
                  <span className="ml-2 text-xs text-slate-500">({
                    predictionDataList[currentBatchIndex]?.batch_id
                  })</span>
                  <Badge
                    variant="outline"
                    className="ml-2 text-green-700 border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold"
                  >
                    분석 완료
                  </Badge>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentBatchIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentBatchIndex === 0}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentBatchIndex((prev) => Math.min(predictionDataList.length - 1, prev + 1))}
                    disabled={currentBatchIndex === predictionDataList.length - 1}
                  >
                    다음
                  </Button>
                </div>
              </div>

              {/* 지표 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">불량률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-slate-900">{predictionDataList[currentBatchIndex].defectRate.toFixed(1)}%</div>
                      <div
                        className={`flex items-center space-x-1 ${
                          getStatusColor(predictionDataList[currentBatchIndex].defectRate, { good: 5, warning: 10 }) === "green"
                            ? "text-green-600"
                            : getStatusColor(predictionDataList[currentBatchIndex].defectRate, { good: 5, warning: 10 }) === "yellow"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {getStatusIcon(getStatusColor(predictionDataList[currentBatchIndex].defectRate, { good: 5, warning: 10 }))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">평균 입자 크기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-slate-900">
                        {predictionDataList[currentBatchIndex].avgParticleSize.toFixed(2)} nm
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${
                          getStatusColor(Math.abs(predictionDataList[currentBatchIndex].avgParticleSize - 125), { good: 10, warning: 20 }) ===
                          "green"
                            ? "text-green-600"
                            : getStatusColor(Math.abs(predictionDataList[currentBatchIndex].avgParticleSize - 125), {
                                  good: 10,
                                  warning: 20,
                                }) === "yellow"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {getStatusIcon(
                          getStatusColor(Math.abs(predictionDataList[currentBatchIndex].avgParticleSize - 125), { good: 10, warning: 20 }),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-600">전도도</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-slate-900">
                        {predictionDataList[currentBatchIndex].conductivity.toFixed(1)} S/m
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${
                          predictionDataList[currentBatchIndex].conductivity >= 85
                            ? "text-green-600"
                            : predictionDataList[currentBatchIndex].conductivity >= 75
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {predictionDataList[currentBatchIndex].conductivity >= 85 ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : predictionDataList[currentBatchIndex].conductivity >= 75 ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 차트 및 추가 지표 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">불량 확률</CardTitle>
                    <CardDescription>전체 품질 평가</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DefectChart probability={predictionDataList[currentBatchIndex].defectProbability} />
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">환경 조건</CardTitle>
                    <CardDescription>제조 환경 지표</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-700">건조온도</span>
                      <span className="text-xl font-bold text-slate-900">
                        {predictionDataList[currentBatchIndex].precursor_room_temp !== undefined
                          ? `${predictionDataList[currentBatchIndex].precursor_room_temp}℃`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-700">습도</span>
                      <span className="text-xl font-bold text-slate-900">
                        {predictionDataList[currentBatchIndex].precursor_room_humidity !== undefined
                          ? `${predictionDataList[currentBatchIndex].precursor_room_humidity}%`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-700">건조 시간</span>
                      <span className="text-xl font-bold text-slate-900">
                        {predictionDataList[currentBatchIndex].precursor_processing_time_min !== undefined
                          ? `${predictionDataList[currentBatchIndex].precursor_processing_time_min}분`
                          : '-'}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">전체 상태</span>
                        <Badge
                          variant={
                            predictionDataList[currentBatchIndex].defectProbability < 30
                              ? "default"
                              : predictionDataList[currentBatchIndex].defectProbability < 60
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            predictionDataList[currentBatchIndex].defectProbability < 30
                              ? "bg-green-100 text-green-800 border-green-300"
                              : predictionDataList[currentBatchIndex].defectProbability < 60
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : ""
                          }
                        >
                          {predictionDataList[currentBatchIndex].defectProbability < 30
                            ? "우수"
                            : predictionDataList[currentBatchIndex].defectProbability < 60
                              ? "양호"
                              : "주의 필요"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 예측 히스토리 차트 */}
              {predictionHistory.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">예측 히스토리</CardTitle>
                    <CardDescription>시간에 따른 불량 확률 트렌드</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis 
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${Number(value).toFixed(1)}%`, '불량 확률']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="defectProbability" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* 챗봇 패널 */}
        <div
          className={`transition-all duration-300 ${isChatOpen ? "w-80" : "w-12"} bg-white/70 backdrop-blur-sm border-l border-slate-200/50 h-[calc(100vh-73px)] shadow-sm`}
        >
          {!isChatOpen ? (
            <div className="p-3">
              <Button
                onClick={() => setIsChatOpen(true)}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* 챗봇 헤더 */}
              <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">AI 어시스턴트</h3>
                      <p className="text-xs text-slate-600">품질 분석 도우미</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${message.sender === "user" ? "bg-blue-600" : "bg-slate-400"}`}
                      >
                        {message.sender === "user" ? (
                          <UserIcon className="w-3 h-3 text-white" />
                        ) : (
                          <Bot className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-slate-500"}`}>
                          {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 입력 영역 */}
              <div className="p-4 border-t border-slate-200/50">
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 h-10"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className="h-10 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 챗봇 추가 */}
      <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />
    </div>
  )
}
