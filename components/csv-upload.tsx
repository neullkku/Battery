"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X } from "lucide-react"

interface CsvUploadProps {
  onDataUpload: (data: any[]) => void
}

export default function CsvUpload({ onDataUpload }: CsvUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("CSV 파일을 업로드해주세요")
      return
    }

    setUploadedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = text.split("\n").filter((row) => row.trim())
      const headers = rows[0].split(",").map((h) => h.trim())

      const data = rows.slice(1).map((row) => {
        const values = row.split(",")
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || ""
        })
        return obj
      })

      onDataUpload(data)
    }
    reader.readAsText(file)
  }

  const removeFile = () => {
    setUploadedFile(null)
    onDataUpload([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-6 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">CSV 파일 업로드</p>
            <p className="text-xs text-slate-600">드래그 앤 드롭 또는 클릭하여 파일 선택</p>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleChange} className="hidden" />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                  <p className="text-xs text-green-700">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-green-700 hover:text-green-900 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
