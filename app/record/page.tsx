'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

export default function RecordPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    meal_type: string
    calories: number
    protein: number
    evaluation: string
  } | null>(null)

  // 画像が選択された時の処理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      // プレビュー表示用
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null) // 前回の結果をクリア
    }
  }

  // Geminiで画像を解析する処理
  const analyzeImage = async () => {
    if (!image || !preview) return

    try {
      setAnalyzing(true)
      
      // Base64の準備（プレビューURLからヘッダーを除去）
      const base64Data = preview.split(',')[1]

      // Gemini APIの初期化
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `
        この食事の画像を解析してください。
        以下の情報をJSON形式のみで返してください。余計な文字列（Markdownのコードブロックなど）は含めないでください。
        
        {
          "meal_type": "朝食" | "昼食" | "夕食" | "間食" のいずれか,
          "calories": 推定カロリーの数値（整数）,
          "protein": 推定タンパク質量の数値（グラム単位の整数）,
          "evaluation": "この食事の評価と、筋トレをしている人に向けた短いアドバイス（日本語で100文字以内）"
        }
      `

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: image.type
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      // JSONの整形（Markdown記法が含まれる場合に対応）
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const data = JSON.parse(jsonStr)

      setResult(data)

    } catch (error) {
      console.error('Error analyzing image:', error)
      alert('画像の解析に失敗しました。もう一度試すか、別の画像を使ってください。')
    } finally {
      setAnalyzing(false)
    }
  }

  // Supabaseに保存する処理
  const saveRecord = async () => {
    if (!image || !result) return

    try {
      setLoading(true)

      // 1. 画像をSupabase Storageにアップロード
      const fileName = `${Date.now()}-${image.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, image)

      if (uploadError) throw uploadError

      // 画像の公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName)

      // 2. データベースに記録を保存
      const { error: dbError } = await supabase
        .from('meals')
        .insert({
          meal_type: result.meal_type,
          calories: result.calories,
          protein: result.protein,
          evaluation: result.evaluation,
          image_url: publicUrl
        })

      if (dbError) throw dbError

      alert('記録しました！')
      router.push('/') // トップページに戻る

    } catch (error) {
      console.error('Error saving record:', error)
      alert('保存に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">食事を記録</h1>

        {/* 画像アップロードエリア */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="hidden"
            id="image-upload"
          />
          
          {!preview ? (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="text-6xl mb-2">📸</div>
              <span className="text-gray-500">写真を撮る / 選択する</span>
            </label>
          ) : (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              <button
                onClick={() => {
                  setPreview(null)
                  setImage(null)
                  setResult(null)
                }}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 解析ボタン */}
        {preview && !result && (
          <button
            onClick={analyzeImage}
            disabled={analyzing}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 mb-4"
          >
            {analyzing ? 'AIが解析中...' : '🤖 AIで栄養素を解析する'}
          </button>
        )}

        {/* 解析結果の表示と保存フォーム */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg mb-3 text-blue-800">解析結果</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カロリー</label>
                  <div className="flex items-end">
                    <input
                      type="number"
                      value={result.calories}
                      onChange={(e) => setResult({...result, calories: Number(e.target.value)})}
                      className="w-full p-2 border rounded text-lg font-bold text-blue-600"
                    />
                    <span className="ml-1 text-gray-500 mb-2">kcal</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タンパク質</label>
                  <div className="flex items-end">
                    <input
                      type="number"
                      value={result.protein}
                      onChange={(e) => setResult({...result, protein: Number(e.target.value)})}
                      className="w-full p-2 border rounded text-lg font-bold text-green-600"
                    />
                    <span className="ml-1 text-gray-500 mb-2">g</span>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">食事タイプ</label>
                <select
                  value={result.meal_type}
                  onChange={(e) => setResult({...result, meal_type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="朝食">朝食</option>
                  <option value="昼食">昼食</option>
                  <option value="夕食">夕食</option>
                  <option value="間食">間食</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AIコメント</label>
                <textarea
                  value={result.evaluation}
                  onChange={(e) => setResult({...result, evaluation: e.target.value})}
                  className="w-full p-2 border rounded h-20 text-sm"
                />
              </div>
            </div>

            <button
              onClick={saveRecord}
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? '保存中...' : '✅ この内容で記録する'}
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">
            キャンセルして戻る
          </button>
        </div>
      </div>
    </main>
  )
}