import { useState, useCallback, useRef } from 'react'
import NumPad from './components/NumPad'
import StatusPanel from './components/StatusPanel'
import BreakTimeSelect from './components/BreakTimeSelect'
import ConfirmDialog from './components/ConfirmDialog'
import AdminPage from './pages/AdminPage'
import {
  getUserByCode,
  getTodayAttendance,
  clockIn,
  clockOut,
} from './lib/attendance'
import { playSuccess, playError } from './lib/sound'

const MODE = {
  IDLE: 'idle',
  BREAK_SELECT: 'break_select',
  CONFIRM: 'confirm',
}

const FLASH = {
  NONE: 'none',
  SUCCESS: 'success',
  ERROR: 'error',
}

function isAdminPath() {
  return window.location.pathname.startsWith('/admin')
}

export default function App() {
  const [page, setPage] = useState(isAdminPath() ? 'admin' : 'kintai')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState(MODE.IDLE)
  const [currentUser, setCurrentUser] = useState(null)
  const [todayRecord, setTodayRecord] = useState(null)
  const [selectedBreak, setSelectedBreak] = useState(null)
  const [flash, setFlash] = useState({ type: FLASH.NONE, message: '' })
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const lockRef = useRef(false)

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode)
  }, [])

  function showFlash(type, message, ms = 2500) {
    setFlash({ type, message })
    setTimeout(() => {
      setFlash({ type: FLASH.NONE, message: '' })
      resetAll()
    }, ms)
  }

  function resetAll() {
    setCode('')
    setMode(MODE.IDLE)
    setCurrentUser(null)
    setTodayRecord(null)
    setSelectedBreak(null)
    lockRef.current = false
  }

  async function lookupUser(empCode) {
    if (!empCode) { setCurrentUser(null); return }
    const { user } = await getUserByCode(empCode)
    setCurrentUser(user ?? null)
  }

  function handleCodeChangeWithLookup(newCode) {
    handleCodeChange(newCode)
    lookupUser(newCode)
  }

  async function handleClockIn() {
    if (lockRef.current || loading) return
    if (!code) { playError(); return }

    setLoading(true)
    lockRef.current = true

    const { user, error: userErr } = await getUserByCode(code)
    if (!user || userErr) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, '社員コードが登録されていません', 2000)
      return
    }

    const { record } = await getTodayAttendance(user.id)
    if (record) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, `${user.name} さんは本日すでに出勤済みです`, 2500)
      return
    }

    const { error: ciErr } = await clockIn(user.id)
    if (ciErr) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, '出勤記録に失敗しました', 2500)
      return
    }

    playSuccess()
    setRefreshTrigger((n) => n + 1)
    setLoading(false)
    showFlash(FLASH.SUCCESS, `${user.name} さん　出勤しました`, 2000)
  }

  async function handleClockOutStart() {
    if (lockRef.current || loading) return
    if (!code) { playError(); return }

    setLoading(true)

    const { user, error: userErr } = await getUserByCode(code)
    if (!user || userErr) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, '社員コードが登録されていません', 2000)
      return
    }

    const { record } = await getTodayAttendance(user.id)
    if (!record) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, `${user.name} さんの出勤記録がありません`, 2500)
      return
    }

    if (record.clock_out) {
      playError()
      setLoading(false)
      showFlash(FLASH.ERROR, `${user.name} さんは本日すでに退勤済みです`, 2500)
      return
    }

    setCurrentUser(user)
    setTodayRecord(record)
    setLoading(false)
    setMode(MODE.BREAK_SELECT)
  }

  function handleBreakSelect(minutes) {
    setSelectedBreak(minutes)
    setMode(MODE.CONFIRM)
  }

  async function handleClockOutConfirm() {
    if (lockRef.current) return
    lockRef.current = true

    const { error } = await clockOut(todayRecord.id, selectedBreak)
    if (error) {
      playError()
      lockRef.current = false
      setMode(MODE.BREAK_SELECT)
      return
    }

    playSuccess()
    setRefreshTrigger((n) => n + 1)
    setMode(MODE.IDLE)
    showFlash(FLASH.SUCCESS, `${currentUser.name} さん　退勤しました`, 2000)
  }

  if (page === 'admin') {
    return (
      <AdminPage
        onBack={() => {
          window.history.pushState({}, '', '/')
          setPage('kintai')
        }}
      />
    )
  }

  return (
    <div className="relative w-full h-full flex p-3 gap-3 bg-slate-900">

      {/* 左パネル：テンキー */}
      <div className="w-[30%] flex-shrink-0">
        <NumPad code={code} onChange={handleCodeChangeWithLookup} />
      </div>

      {/* 中央パネル：出退勤ボタン */}
      <div className="flex-1 flex flex-col gap-3">
        {/* ユーザー名 / フラッシュメッセージ */}
        <div className="panel flex items-center justify-center py-3 px-4 flex-shrink-0 min-h-[80px]">
          {flash.type !== FLASH.NONE ? (
            <p
              className={`text-2xl font-bold text-center leading-snug ${
                flash.type === FLASH.SUCCESS ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {flash.message}
            </p>
          ) : currentUser ? (
            <div className="text-center">
              <p className="text-slate-400 text-sm">確認中</p>
              <p className="text-white text-2xl font-bold">{currentUser.name}</p>
            </div>
          ) : code.length > 0 ? (
            <p className="text-slate-500 text-lg">社員を確認中...</p>
          ) : (
            <p className="text-slate-500 text-lg">社員コードを入力してください</p>
          )}
        </div>

        {/* 出勤ボタン */}
        <button
          onPointerDown={(e) => { e.preventDefault(); handleClockIn() }}
          disabled={loading}
          className={`btn-clock-in flex-1 flex flex-col items-center justify-center gap-3 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-5xl">🟢</span>
          <span className="text-5xl font-black tracking-[0.2em]">出　勤</span>
        </button>

        {/* 退勤ボタン */}
        <button
          onPointerDown={(e) => { e.preventDefault(); handleClockOutStart() }}
          disabled={loading}
          className={`btn-clock-out flex-1 flex flex-col items-center justify-center gap-3 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-5xl">🔴</span>
          <span className="text-5xl font-black tracking-[0.2em]">退　勤</span>
        </button>
      </div>

      {/* 右パネル：履歴・時刻 */}
      <div className="w-[26%] flex-shrink-0">
        <StatusPanel refreshTrigger={refreshTrigger} />
      </div>

      {/* モーダル：休憩時間選択 */}
      {mode === MODE.BREAK_SELECT && (
        <BreakTimeSelect
          userName={currentUser?.name}
          onSelect={handleBreakSelect}
          onCancel={() => {
            setMode(MODE.IDLE)
            setCode('')
            setCurrentUser(null)
            lockRef.current = false
          }}
        />
      )}

      {/* モーダル：退勤確認 */}
      {mode === MODE.CONFIRM && (
        <ConfirmDialog
          userName={currentUser?.name}
          breakMinutes={selectedBreak}
          onConfirm={handleClockOutConfirm}
          onCancel={() => setMode(MODE.BREAK_SELECT)}
        />
      )}
    </div>
  )
}
