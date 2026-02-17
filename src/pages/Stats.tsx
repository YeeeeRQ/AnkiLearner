import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import dayjs from 'dayjs'

export default function Stats() {
  const stats = useLiveQuery(async () => {
    const cards = await db.cards.toArray()
    const logs = await db.logs.toArray()

    const byState = {
      new: 0,
      learning: 0,
      review: 0,
      relearning: 0,
    }

    cards.forEach(c => {
      if (byState[c.state] !== undefined) {
        byState[c.state]++
      }
    })

    const todayStart = dayjs().startOf('day').valueOf()
    const reviewsToday = logs.filter(l => l.timestamp >= todayStart).length
    
    // Average Ease
    const totalEase = cards.reduce((acc, c) => acc + c.ease, 0)
    const avgEase = cards.length > 0 ? (totalEase / cards.length).toFixed(2) : '0.00'

    return {
      byState,
      reviewsToday,
      totalCards: cards.length,
      avgEase,
    }
  }, [])

  if (!stats) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">统计概览</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="今日复习" value={stats.reviewsToday} />
        <StatCard title="总卡片数" value={stats.totalCards} />
        <StatCard title="平均Ease" value={stats.avgEase} />
        <StatCard title="待学习(New)" value={stats.byState.new} />
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">卡片状态分布</h3>
        <div className="space-y-4">
          <ProgressBar label="New (新卡片)" value={stats.byState.new} total={stats.totalCards} color="bg-blue-500" />
          <ProgressBar label="Learning (学习中)" value={stats.byState.learning} total={stats.totalCards} color="bg-orange-500" />
          <ProgressBar label="Review (复习)" value={stats.byState.review} total={stats.totalCards} color="bg-green-500" />
          <ProgressBar label="Relearning (重学)" value={stats.byState.relearning} total={stats.totalCards} color="bg-red-500" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col items-center justify-center gap-2">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{title}</span>
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-white dark:to-neutral-300">
        {value}
      </span>
    </div>
  )
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="font-medium text-neutral-800 dark:text-neutral-200">{value} ({percent}%)</span>
      </div>
      <div className="h-2.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
