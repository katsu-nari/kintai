const BREAK_OPTIONS = [
  { label: '45分', value: 45 },
  { label: '1時間', value: 60 },
  { label: '1時間15分', value: 75 },
]

export default function BreakTimeSelect({ userName, onSelect, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
      <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-2xl w-full max-w-lg p-8">
        <h2 className="text-white text-3xl font-bold text-center mb-2">休憩時間を選択</h2>
        {userName && (
          <p className="text-slate-300 text-xl text-center mb-8">{userName} さん</p>
        )}

        <div className="flex flex-col gap-4">
          {BREAK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onPointerDown={(e) => {
                e.preventDefault()
                onSelect(opt.value)
              }}
              className="w-full py-6 rounded-2xl bg-blue-700 border-2 border-blue-500
                         text-white text-3xl font-bold
                         active:bg-blue-500 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onPointerDown={(e) => {
            e.preventDefault()
            onCancel()
          }}
          className="w-full mt-6 py-4 rounded-2xl bg-slate-700 border border-slate-500
                     text-slate-300 text-xl font-medium
                     active:bg-slate-500 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
