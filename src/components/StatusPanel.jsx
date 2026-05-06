import { useState, useEffect } from 'react'
import { getRecentAttendance, formatTime } from '../lib/attendance'

export default function StatusPanel({ refreshTrigger }) {
  const [now, setNow] = useState(new Date())
  const [history, setHistory] = useState([])

  // 時刻を毎秒更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 打刻履歴を取得
  useEffect(() => {
    async function load() {
      const { records } = await getRecentAttendance(5)
      setHistory(records)
    }
    load()
  }, [refreshTrigger])

  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="flex flex-col h-full gap-3">
      {/* 現在時刻 */}
      <div className="panel flex flex-col items-center justify-center py-4 px-3 flex-shrink-0">
        <p className="text-slate-400 text-xs mb-1">{dateStr}</p>
        <p className="text-white text-4xl font-mono font-bold tabular-nums tracking-wider">
          {timeStr}
        </p>
      </div>

      {/* 打刻履歴 */}
      <div className="panel flex-1 flex flex-col overflow-hidden">
        <p className="text-slate-400 text-sm font-medium px-4 pt-3 pb-2 border-b border-slate-700 flex-shrink-0">
          直近の打刻
        </p>
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-slate-500 text-center mt-6 text-sm">履歴なし</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {history.map((rec) => (
                <li key={rec.id} className="px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {rec.users?.name ?? '不明'}
                    </span>
                    {rec.clock_out ? (
                      <span className="text-xs font-bold text-red-400 flex-shrink-0">退勤</span>
                    ) : (
                      <span className="text-xs font-bold text-green-400 flex-shrink-0">出勤</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-0.5 text-xs text-slate-400">
                    {rec.clock_in && (
                      <span>IN {formatTime(rec.clock_in)}</span>
                    )}
                    {rec.clock_out && (
                      <span>OUT {formatTime(rec.clock_out)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 管理画面リンク */}
      <a
        href="/admin"
        className="panel text-center py-2 text-slate-400 text-xs hover:text-white transition-colors flex-shrink-0"
        onClick={(e) => {
          e.preventDefault()
          window.location.href = '/admin'
        }}
      >
        管理画面
      </a>
    </div>
  )
}
