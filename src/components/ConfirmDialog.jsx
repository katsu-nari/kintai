export default function ConfirmDialog({ userName, breakMinutes, onConfirm, onCancel }) {
  const breakLabel =
    breakMinutes === 45 ? '45分' :
    breakMinutes === 60 ? '1時間' :
    breakMinutes === 75 ? '1時間15分' : `${breakMinutes}分`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
      <div className="bg-slate-800 rounded-3xl border border-slate-600 shadow-2xl w-full max-w-lg p-8 text-center">
        <div className="text-6xl mb-4">🏁</div>
        <h2 className="text-white text-3xl font-bold mb-3">退勤しますか？</h2>
        {userName && (
          <p className="text-yellow-300 text-2xl font-bold mb-2">{userName} さん</p>
        )}
        <p className="text-slate-300 text-lg mb-8">休憩時間：{breakLabel}</p>

        <div className="flex gap-4">
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              onCancel()
            }}
            className="flex-1 py-5 rounded-2xl bg-slate-700 border border-slate-500
                       text-slate-200 text-2xl font-bold
                       active:bg-slate-500 transition-colors"
          >
            戻る
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="flex-1 py-5 rounded-2xl bg-red-600 border-2 border-red-500
                       text-white text-2xl font-bold
                       active:bg-red-400 transition-colors"
          >
            退勤する
          </button>
        </div>
      </div>
    </div>
  )
}
