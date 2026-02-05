// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeMealImage(imageBase64: string, mimeType: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
この食事の画像を分析して、以下の情報をJSON形式で返してください：

{
  "foods": ["食品名1", "食品名2"],
  "calories": 推定カロリー数値,
  "protein": タンパク質グラム数,
  "carbs": 炭水化物グラム数,
  "fat": 脂質グラム数
}

数値のみを返し、単位は含めないでください。JSONのみを返してください。
`

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('JSONを抽出できませんでした')
    }

    return JSON.parse(jsonMatch[0])

  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('食事の分析に失敗しました')
  }
}

export async function evaluateMeal(
  calories: number,
  protein: number,
  userWeight: number,
  goal: 'bulk' | 'cut' | 'maintain'
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const targetProtein = userWeight * 2

    const prompt = `
体重${userWeight}kgの人が、カロリー${calories}kcal、タンパク質${protein}gの食事を摂りました。
目標タンパク質は${targetProtein}g/日です。
150文字以内で評価とアドバイスをください。親しみやすく、絵文字を使ってください。
`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()

  } catch (error) {
    return '食事を記録しました！継続して頑張りましょう💪'
  }
}