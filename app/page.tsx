'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Meal } from '@/lib/supabase'

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [todayCalories, setTodayCalories] = useState(0)
  const [todayProtein, setTodayProtein] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodayMeals()
  }, [])

  async function loadTodayMeals() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      setMeals(data || [])

      // 今日の合計を計算
      const totalCal = (data || []).reduce((sum, meal) => sum + meal.calories, 0)
      const totalPro = (data || []).reduce((sum, meal) => sum + meal.protein, 0)

      setTodayCalories(Math.round(totalCal))
      setTodayProtein(Math.round(totalPro))
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">読み込み中...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">💪 Muscle Tracker</h1>
          <p className="text-gray-600">筋トレ向け食事管理アプリ</p>
        </div>

        {/* 今日の摂取量カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">今日の摂取量</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">カロリー</p>
              <p className="text-3xl font-bold text-blue-600">{todayCalories}</p>
              <p className="text-sm text-gray-500">kcal</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">タンパク質</p>
              <p className="text-3xl font-bold text-green-600">{todayProtein}</p>
              <p className="text-sm text-gray-500">g</p>
            </div>
          </div>
        </div>

        {/* 食事記録ボタン */}
        <Link href="/record">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg mb-6 text-lg transition-colors">
            📸 食事を記録する
          </button>
        </Link>

        {/* 今日の食事一覧 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">今日の食事</h2>
          {meals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ食事が記録されていません</p>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(meal.created_at).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{meal.meal_type || '食事'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{Math.round(meal.calories)} kcal</p>
                      <p className="text-sm text-green-600">P: {Math.round(meal.protein)}g</p>
                    </div>
                  </div>
                  {meal.image_url && (
                    <img
                      src={meal.image_url}
                      alt="食事"
                      className="w-full h-40 object-cover rounded-lg mt-2"
                    />
                  )}
                  {meal.evaluation && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                      💬 {meal.evaluation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
