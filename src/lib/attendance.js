import { supabase } from './supabase'

/**
 * 社員コードでユーザーを取得する
 */
export async function getUserByCode(employeeCode) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, employee_code')
    .eq('employee_code', employeeCode)
    .maybeSingle()

  if (error) return { user: null, error }
  return { user: data, error: null }
}

/**
 * 当日の勤怠レコードを取得する
 */
export async function getTodayAttendance(userId) {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('work_date', today)
    .maybeSingle()

  if (error) return { record: null, error }
  return { record: data, error: null }
}

/**
 * 出勤打刻
 */
export async function clockIn(userId) {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const clockInTime = now.toISOString()

  const { data, error } = await supabase
    .from('attendance')
    .insert({ user_id: userId, work_date: today, clock_in: clockInTime })
    .select()
    .single()

  if (error) return { record: null, error }
  return { record: data, error: null }
}

/**
 * 退勤打刻
 */
export async function clockOut(attendanceId, breakMinutes) {
  const clockOutTime = new Date().toISOString()

  const { data, error } = await supabase
    .from('attendance')
    .update({ clock_out: clockOutTime, break_minutes: breakMinutes })
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) return { record: null, error }
  return { record: data, error: null }
}

/**
 * 直近の打刻履歴（全ユーザー）を取得する
 */
export async function getRecentAttendance(limit = 5) {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, clock_in, clock_out, work_date, users(name)')
    .order('clock_in', { ascending: false })
    .limit(limit)

  if (error) return { records: [], error }
  return { records: data ?? [], error: null }
}

/**
 * 管理画面用：指定期間の勤怠一覧
 */
export async function getAttendanceRange(from, to) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, users(name, employee_code)')
    .gte('work_date', from)
    .lte('work_date', to)
    .order('work_date', { ascending: false })
    .order('clock_in', { ascending: false })

  if (error) return { records: [], error }
  return { records: data ?? [], error: null }
}

/**
 * 管理画面用：勤怠レコードを更新する
 */
export async function updateAttendance(id, fields) {
  const { data, error } = await supabase
    .from('attendance')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return { record: null, error }
  return { record: data, error: null }
}

/**
 * 実働時間を分単位で計算する（休憩除く）
 */
export function calcWorkMinutes(clockIn, clockOut, breakMinutes) {
  if (!clockIn || !clockOut) return null
  const inMs = new Date(clockIn).getTime()
  const outMs = new Date(clockOut).getTime()
  const totalMinutes = Math.floor((outMs - inMs) / 60000)
  return Math.max(0, totalMinutes - (breakMinutes ?? 0))
}

/**
 * 分を「HH:MM」形式に変換する
 */
export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) return '--:--'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * ISO文字列を「HH:MM」形式に変換する（JST）
 */
export function formatTime(isoString) {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
