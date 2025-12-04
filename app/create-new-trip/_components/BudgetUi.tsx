import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Defined props type for better TypeScript support
interface BudgetUiProps {
    onSelectedOption: (value: string) => void;
}

function BudgetUi({ onSelectedOption }: BudgetUiProps) {
    const [amount, setAmount] = useState('');

    const handleConfirm = () => {
        if (!amount) return;
        // Pass the formatted currency string back to ChatBox
        onSelectedOption(`$${amount}`);
    }

    return (
        <div className="p-4 border rounded-2xl bg-white w-full max-w-xs mt-2 shadow-sm">
            <div className="mb-3">
                <h2 className="font-bold text-lg">Your Budget</h2>
                <p className="text-gray-500 text-sm">Enter the total amount you want to spend.</p>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-400">$</span>
                <Input
                    type="number"
                    placeholder="Ex. 2000"
                    className="text-lg h-12"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirm();
                    }}
                />
            </div>

            <Button
                className="w-full mt-4"
                onClick={handleConfirm}
                disabled={!amount} // Disable if empty
            >
                Confirm Budget
            </Button>
        </div>
    )
}

export default BudgetUi