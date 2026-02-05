import { GoogleGenerativeAI } from '@google/generative-ai'

// 環境変数の名前を Vercel の設定と合わせる
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function analyzeMealImage(imageBase64: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `
    この食事の画像を分析し、以下のJSON形式で返してください。
    {
      "name": "料理名",
      "calories": 数値,
      "protein": 数値,
      "fat": 数値,
      "carbs": 数値
    }
    余計な説明は省き、JSONのみを返してください。
  `

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    }
  ])
  
  // AIの回答からJSON部分だけを取り出す
  const text = result.response.text().replace(/```json|```/g, '')
  return JSON.parse(text)
}

export async function evaluateMeal(c: number, p: number, w: number, g: string) {
  return '食事を記録しました！'
}