import { playTap } from '../lib/sound'

const MAX_CODE_LENGTH = 8

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['C', '0', '⌫'],
]

export default function NumPad({ code, onChange }) {
  function handleKey(key) {
    playTap()

    if (key === 'C') {
      onChange('')
      return
    }
    if (key === '⌫') {
      onChange(code.slice(0, -1))
      return
    }
    if (code.length >= MAX_CODE_LENGTH) return
    onChange(code + key)
  }

  const displayCode = code || ''
  const masked = displayCode.length > 4
    ? '●'.repeat(displayCode.length - 4) + displayCode.slice(-4)
    : displayCode

  return (
    <div className="flex flex-col h-full gap-3">
      {/* コード表示エリア */}
      <div className="panel flex flex-col items-center justify-center px-4 py-3 flex-shrink-0">
        <p className="text-slate-400 text-sm font-medium mb-1">社員コード</p>
        <div className="w-full bg-slate-900 rounded-xl px-4 py-3 text-center min-h-[72px] flex items-center justify-center">
          {displayCode.length === 0 ? (
            <span className="text-slate-500 text-3xl font-mono tracking-widest">_ _ _ _</span>
          ) : (
            <span className="text-white text-4xl font-mono tracking-widest">{masked}</span>
          )}
        </div>
        {/* 入力文字数インジケーター */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: MAX_CODE_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-1 rounded-full transition-colors duration-100 ${
                i < displayCode.length ? 'bg-blue-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* テンキー */}
      <div className="flex-1 grid grid-rows-4 gap-2">
        {KEYS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-2 flex-1">
            {row.map((key) => (
              <button
                key={key}
                onPointerDown={(e) => {
                  e.preventDefault()
                  handleKey(key)
                }}
                className={`btn-numpad ${
                  key === 'C'
                    ? 'bg-amber-700 border-amber-600 active:bg-amber-500'
                    : key === '⌫'
                    ? 'bg-slate-500 border-slate-400 active:bg-slate-300'
                    : ''
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
