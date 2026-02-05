// lib/gemini.ts 
import { GoogleGenerativeAI } from '@google/generative-ai' 
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!) 
 
export async function analyzeMealImage(imageBase64: string, mimeType: string) { 
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) 
  const prompt = 'この食事の画像を分析してJSON形式で返してください' 
  const result = await model.generateContent([prompt]) 
  return JSON.parse(result.response.text()) 
} 
 
export async function evaluateMeal(c: number, p: number, w: number, g: string) { 
  return '食事を記録しました!' 
}
