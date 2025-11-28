import React, { useState } from 'react'

// Defined the type properly instead of 'any'
function SelectDays({ onSelectedOption }: { onSelectedOption: (v: string) => void }) {
  const [days, setDays] = useState(3)

  return (
    <div className="flex flex-col items-center mt-2 p-4 border rounded-2xl bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Trip Duration</h2>

      <div className="flex items-center gap-5 my-3">
        {/* Decrement */}
        <button
          className="w-10 h-10 flex items-center justify-center text-xl border rounded-full hover:bg-gray-100 transition-all"
          onClick={() => setDays(prev => (prev > 1 ? prev - 1 : 1))}
        >
          ➖
        </button>
        <span className="text-2xl font-bold min-w-80px text-center">{days} Days</span>

        {/* Increment */}
        <button
          className="w-10 h-10 flex items-center justify-center text-xl border rounded-full hover:bg-gray-100 transition-all"
          onClick={() => setDays(prev => prev + 1)}
        >
          ➕
        </button>
      </div>

      <button
        className="mt-2 w-full bg-primary text-white px-4 py-2 rounded-lg hover:brightness-90 transition-all"
        onClick={() => onSelectedOption(`${days} Days`)}
      >
        Confirm Duration
      </button>
    </div>
  )
}

export default SelectDays