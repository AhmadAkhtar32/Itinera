import React, { useState } from 'react'

function SelectDays({ onSelectedOption }: any) {
  const [days, setDays] = useState(3)

  return (
    <div className="flex flex-col items-center mt-2 p-4 border rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">How many days do you want to travel?</h2>
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-2 text-xl border rounded-full hover:bg-gray-200"
          onClick={() => setDays(prev => (prev > 1 ? prev - 1 : 1))}
        >➖</button>
        <span className="text-2xl font-bold">{days} Days</span>
        <button
          className="px-4 py-2 text-xl border rounded-full hover:bg-gray-200"
          onClick={() => setDays(prev => prev + 1)}
        >➕</button>
      </div>
      <button
        className="mt-3 bg-primary text-white px-4 py-2 rounded-lg"
        onClick={() => onSelectedOption(`${days} Days`)}
      >
        Confirm
      </button>
    </div>
  )
}

export default SelectDays

