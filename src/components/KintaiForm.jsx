import { useState } from 'react'
import './KintaiForm.css'

const CATEGORIES = [
  { id: 1, label: '有給休暇' },
  { id: 2, label: '欠勤' },
  { id: 3, label: '遅刻' },
  { id: 4, label: '早退' },
  { id: 5, label: '振替出勤' },
  { id: 6, label: '振替休暇' },
  { id: 7, label: '打刻忘れ' },
  { id: 8, label: '私用外出' },
  { id: 9, label: '打刻修正' },
  { id: 10, label: '勤務時間変更' },
  { id: 11, label: 'その他' },
]

function DateFields({ prefix, value, onChange }) {
  return (
    <span className="date-fields">
      <input
        type="number"
        className="field-year"
        placeholder="年"
        value={value.year}
        onChange={e => onChange({ ...value, year: e.target.value })}
        min="2000"
        max="2099"
      />
      <span>年</span>
      <input
        type="number"
        className="field-month"
        placeholder="月"
        value={value.month}
        onChange={e => onChange({ ...value, month: e.target.value })}
        min="1"
        max="12"
      />
      <span>月</span>
      <input
        type="number"
        className="field-day"
        placeholder="日"
        value={value.day}
        onChange={e => onChange({ ...value, day: e.target.value })}
        min="1"
        max="31"
      />
      <span>日</span>
    </span>
  )
}

function TimeFields({ value, onChange }) {
  return (
    <span className="time-fields">
      <input
        type="number"
        className="field-hour"
        placeholder="時"
        value={value.hour}
        onChange={e => onChange({ ...value, hour: e.target.value })}
        min="0"
        max="23"
      />
      <span>時</span>
      <input
        type="number"
        className="field-minute"
        placeholder="分"
        value={value.minute}
        onChange={e => onChange({ ...value, minute: e.target.value })}
        min="0"
        max="59"
      />
      <span>分</span>
    </span>
  )
}

const emptyDate = () => ({ year: '', month: '', day: '' })
const emptyTime = () => ({ hour: '', minute: '' })

export default function KintaiForm() {
  const today = new Date()
  const [form, setForm] = useState({
    applicationDate: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    },
    department: '岡山早島センター',
    managerName: '',
    staffName: '',
    employeeNo: '',
    selectedCategory: null,
    otherText: '',
    periodFrom: emptyDate(),
    periodTo: emptyDate(),
    periodDays: '',
    timeFrom: emptyTime(),
    timeTo: emptyTime(),
    periodHours: '',
    substituteWorkDate: emptyDate(),
    substituteLeaveDate: emptyDate(),
    reason: '',
    managerInCharge: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePrint = () => window.print()

  const handleReset = () => {
    if (window.confirm('入力内容をリセットしますか？')) {
      const today = new Date()
      setForm({
        applicationDate: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
        },
        department: '岡山早島センター',
        managerName: '',
        staffName: '',
        employeeNo: '',
        selectedCategory: null,
        otherText: '',
        periodFrom: emptyDate(),
        periodTo: emptyDate(),
        periodDays: '',
        timeFrom: emptyTime(),
        timeTo: emptyTime(),
        periodHours: '',
        substituteWorkDate: emptyDate(),
        substituteLeaveDate: emptyDate(),
        reason: '',
        managerInCharge: '',
      })
    }
  }

  const showSubstitute = form.selectedCategory === 5 || form.selectedCategory === 6

  return (
    <div className="kintai-wrapper">
      <div className="kintai-form">
        {/* Title */}
        <h1 className="form-title">勤　怠　届</h1>

        {/* Header row */}
        <div className="header-row">
          <div className="addressee">
            所管長&nbsp;&nbsp;宛
          </div>
          <div className="application-date">
            <span>申請日</span>
            <DateFields
              value={form.applicationDate}
              onChange={v => update('applicationDate', v)}
            />
          </div>
        </div>

        {/* Employee type badge */}
        <div className="employee-type-badge">パート従業員</div>

        {/* Main table */}
        <table className="form-table">
          <tbody>
            {/* Department row */}
            <tr>
              <td className="label-cell" rowSpan="2">所&emsp;管</td>
              <td className="value-cell" colSpan="2">
                <input
                  type="text"
                  className="text-input"
                  value={form.department}
                  onChange={e => update('department', e.target.value)}
                />
              </td>
              <td className="label-cell-sm">所管長</td>
              <td className="value-cell-sm">
                <input
                  type="text"
                  className="text-input"
                  value={form.managerName}
                  onChange={e => update('managerName', e.target.value)}
                />
              </td>
              <td className="label-cell-sm">担&emsp;当</td>
              <td className="value-cell-sm">
                <input
                  type="text"
                  className="text-input"
                  value={form.staffName}
                  onChange={e => update('staffName', e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td className="value-cell" colSpan="2"></td>
              <td className="value-cell-sm" colSpan="4"></td>
            </tr>

            {/* Name row */}
            <tr>
              <td className="label-cell" rowSpan="2">氏&emsp;名</td>
              <td className="value-cell" colSpan="6">
                <div className="name-row">
                  <span className="no-label">No.</span>
                  <input
                    type="text"
                    className="text-input no-input"
                    value={form.employeeNo}
                    onChange={e => update('employeeNo', e.target.value)}
                    placeholder="社員番号"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="value-cell name-value" colSpan="6">
                <input
                  type="text"
                  className="text-input"
                  value={form.managerName === '' && form.staffName === '' ? '' : ''}
                  placeholder="　　　　　　　　　　㊞"
                  readOnly
                  style={{ cursor: 'default', color: '#666' }}
                />
                <div className="seal-placeholder">㊞</div>
              </td>
            </tr>

            {/* Category row */}
            <tr>
              <td className="label-cell category-label">区&emsp;分</td>
              <td className="value-cell category-value" colSpan="6">
                <div className="category-grid">
                  {CATEGORIES.map(cat => (
                    <label key={cat.id} className="category-item">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={form.selectedCategory === cat.id}
                        onChange={() => update('selectedCategory', cat.id)}
                      />
                      <span className="cat-number">{cat.id}.</span>
                      <span className="cat-label">{cat.label}</span>
                      {cat.id === 11 && (
                        <span className="other-text">
                          （
                          <input
                            type="text"
                            className="other-input"
                            value={form.otherText}
                            onChange={e => update('otherText', e.target.value)}
                            disabled={form.selectedCategory !== 11}
                          />
                          ）
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Period row */}
            <tr>
              <td className="label-cell period-label">
                <div>期　間</div>
                <div>日　時</div>
              </td>
              <td className="value-cell period-value" colSpan="6">
                <div className="period-row">
                  <DateFields value={form.periodFrom} onChange={v => update('periodFrom', v)} />
                  <span className="tilde">～</span>
                  <DateFields value={form.periodTo} onChange={v => update('periodTo', v)} />
                  <span>（</span>
                  <input
                    type="number"
                    className="field-count"
                    value={form.periodDays}
                    onChange={e => update('periodDays', e.target.value)}
                    min="0"
                    placeholder="0"
                  />
                  <span>日間）</span>
                </div>
                <div className="period-row time-row">
                  <TimeFields value={form.timeFrom} onChange={v => update('timeFrom', v)} />
                  <span className="tilde">～</span>
                  <TimeFields value={form.timeTo} onChange={v => update('timeTo', v)} />
                  <span>（</span>
                  <input
                    type="number"
                    className="field-count"
                    value={form.periodHours}
                    onChange={e => update('periodHours', e.target.value)}
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />
                  <span>時間）</span>
                </div>
                {showSubstitute && (
                  <div className="period-row substitute-row">
                    <span>振替出勤日（</span>
                    <DateFields value={form.substituteWorkDate} onChange={v => update('substituteWorkDate', v)} />
                    <span>）</span>
                    <span className="substitute-gap">振替休暇日（</span>
                    <DateFields value={form.substituteLeaveDate} onChange={v => update('substituteLeaveDate', v)} />
                    <span>）</span>
                  </div>
                )}
                {!showSubstitute && (
                  <div className="period-row substitute-row substitute-hidden">
                    <span>振替出勤日（</span>
                    <DateFields value={form.substituteWorkDate} onChange={v => update('substituteWorkDate', v)} />
                    <span>）</span>
                    <span className="substitute-gap">振替休暇日（</span>
                    <DateFields value={form.substituteLeaveDate} onChange={v => update('substituteLeaveDate', v)} />
                    <span>）</span>
                  </div>
                )}
              </td>
            </tr>

            {/* Reason row */}
            <tr>
              <td className="label-cell">事&emsp;由</td>
              <td className="value-cell reason-cell" colSpan="5">
                <textarea
                  className="reason-textarea"
                  value={form.reason}
                  onChange={e => update('reason', e.target.value)}
                  placeholder="事由を入力してください"
                />
              </td>
              <td className="manager-cell">
                <div className="manager-label">管理担当</div>
                <input
                  type="text"
                  className="text-input manager-input"
                  value={form.managerInCharge}
                  onChange={e => update('managerInCharge', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Version */}
        <div className="version">Ver.201810-1</div>

        {/* Action buttons */}
        <div className="action-buttons no-print">
          <button className="btn btn-print" onClick={handlePrint}>
            印刷
          </button>
          <button className="btn btn-reset" onClick={handleReset}>
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}
