import { useState, useEffect } from 'react'
import {
  getAttendanceRange,
  updateAttendance,
  calcWorkMinutes,
  formatMinutes,
  formatTime,
} from '../lib/attendance'

const today = new Date().toISOString().slice(0, 10)
const firstOfMonth = today.slice(0, 8) + '01'

export default function AdminPage({ onBack }) {
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editFields, setEditFields] = useState({})
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const { records: recs } = await getAttendanceRange(from, to)
    setRecords(recs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(rec) {
    setEditId(rec.id)
    setEditFields({
      clock_in: rec.clock_in ? toLocalInput(rec.clock_in) : '',
      clock_out: rec.clock_out ? toLocalInput(rec.clock_out) : '',
      break_minutes: rec.break_minutes ?? '',
    })
  }

  async function saveEdit(id) {
    const fields = {}
    if (editFields.clock_in) fields.clock_in = new Date(editFields.clock_in).toISOString()
    if (editFields.clock_out) fields.clock_out = new Date(editFields.clock_out).toISOString()
    if (editFields.break_minutes !== '') fields.break_minutes = Number(editFields.break_minutes)

    const { error } = await updateAttendance(id, fields)
    if (error) { setMsg('更新に失敗しました'); return }
    setMsg('更新しました')
    setEditId(null)
    load()
    setTimeout(() => setMsg(''), 2000)
  }

  function exportCsv() {
    const header = ['日付', '社員コード', '氏名', '出勤', '退勤', '休憩(分)', '実働時間']
    const rows = records.map((r) => [
      r.work_date,
      r.users?.employee_code ?? '',
      r.users?.name ?? '',
      formatTime(r.clock_in),
      formatTime(r.clock_out),
      r.break_minutes ?? '',
      formatMinutes(calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes)),
    ])
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `勤怠_${from}_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 月別・日別集計
  const grouped = groupBy(records, (r) => r.work_date)
  const dailySummary = Object.entries(grouped).map(([date, recs]) => ({
    date,
    count: recs.length,
    totalWork: recs.reduce(
      (sum, r) => sum + (calcWorkMinutes(r.clock_in, r.clock_out, r.break_minutes) ?? 0),
      0,
    ),
  }))

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ヘッダー */}
      <header className="bg-slate-800 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors"
        >
          ← 打刻画面
        </button>
        <h1 className="text-xl font-bold">勤怠管理 - 管理画面</h1>
        {msg && (
          <span className="ml-auto text-green-300 text-sm font-medium">{msg}</span>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 検索フィルター */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">開始日</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">終了日</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '読込中...' : '検索'}
          </button>
          <button
            onClick={exportCsv}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            CSVダウンロード
          </button>
          <div className="ml-auto text-sm text-gray-500">
            {records.length} 件
          </div>
        </div>

        {/* 日別集計 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">日別集計</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['日付', '出勤人数', '合計実働時間'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-gray-600 font-medium border-b border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailySummary.map((d) => (
                  <tr key={d.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{d.date}</td>
                    <td className="px-4 py-2">{d.count} 人</td>
                    <td className="px-4 py-2 font-mono">{formatMinutes(d.totalWork)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 個人別明細 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">打刻一覧</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['日付', '社員コード', '氏名', '出勤', '退勤', '休憩', '実働', '操作'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-gray-600 font-medium border-b border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono">{rec.work_date}</td>
                    <td className="px-4 py-2 font-mono text-gray-500">{rec.users?.employee_code}</td>
                    <td className="px-4 py-2 font-medium">{rec.users?.name}</td>

                    {editId === rec.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="datetime-local"
                            value={editFields.clock_in}
                            onChange={(e) => setEditFields({ ...editFields, clock_in: e.target.value })}
                            className="border rounded px-2 py-1 text-xs w-40"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="datetime-local"
                            value={editFields.clock_out}
                            onChange={(e) => setEditFields({ ...editFields, clock_out: e.target.value })}
                            className="border rounded px-2 py-1 text-xs w-40"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editFields.break_minutes}
                            onChange={(e) => setEditFields({ ...editFields, break_minutes: e.target.value })}
                            className="border rounded px-2 py-1 text-xs w-16"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2 font-mono text-gray-400">--:--</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(rec.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-300"
                            >
                              取消
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-mono text-green-700">{formatTime(rec.clock_in)}</td>
                        <td className="px-4 py-2 font-mono text-red-700">{formatTime(rec.clock_out)}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {rec.break_minutes != null ? `${rec.break_minutes}分` : '-'}
                        </td>
                        <td className="px-4 py-2 font-mono font-medium">
                          {formatMinutes(calcWorkMinutes(rec.clock_in, rec.clock_out, rec.break_minutes))}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => startEdit(rec)}
                            className="px-3 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-400"
                          >
                            修正
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {records.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item)
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

function toLocalInput(isoString) {
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
