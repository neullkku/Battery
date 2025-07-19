"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! L&F 품질 예측 AI 어시스턴트입니다. 배터리 품질 분석에 대해 궁금한 점이 있으시면 언제든 물어보세요.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsTyping(true)

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const botResponses = [
        "현재 불량률이 높게 나타나고 있습니다. 온도와 습도 조건을 확인해보시기 바랍니다.",
        "입자 크기가 최적 범위를 벗어났습니다. 제조 공정의 혼합 시간을 조정해보세요.",
        "전도도 수치가 양호합니다. 현재 공정 조건을 유지하시기 바랍니다.",
        "예측 결과를 바탕으로 품질 개선 방안을 제안드릴 수 있습니다.",
        "추가적인 데이터 분석이 필요하시면 더 많은 샘플을 업로드해주세요.",
        "배터리 양극재의 품질은 입자 크기, 전도도, 제조 환경이 주요 요인입니다.",
        "현재 데이터를 기반으로 최적화 방안을 제시해드릴 수 있습니다.",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 bg-white/95 backdrop-blur-md border-slate-200/50 shadow-2xl">
        <CardHeader className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">AI 어시스턴트</CardTitle>
                <p className="text-xs text-slate-600">품질 분석 도우미</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="w-6 h-6 p-0 text-slate-500 hover:text-slate-700"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="w-6 h-6 p-0 text-slate-500 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-80">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-blue-600" : "bg-slate-400"}`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-slate-500"}`}>
                      {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-400">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 h-9 text-sm"
                onKeyPress={handleKeyPress}
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="h-9 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
