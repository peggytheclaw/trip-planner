import { Expense, Settlement, Traveler } from '../types';

interface Balance {
  travelerId: string;
  name: string;
  balance: number; // positive = is owed, negative = owes
}

export function calculateBalances(expenses: Expense[], travelers: Traveler[]): Balance[] {
  const balanceMap = new Map<string, number>();
  for (const t of travelers) balanceMap.set(t.id, 0);

  for (const expense of expenses) {
    // Payer gets credit for what others owe
    const payerBalance = balanceMap.get(expense.paidBy) ?? 0;
    balanceMap.set(expense.paidBy, payerBalance + expense.amount);

    // Each split person owes their share
    for (const split of expense.splits) {
      const splitBalance = balanceMap.get(split.travelerId) ?? 0;
      balanceMap.set(split.travelerId, splitBalance - split.amount);
    }
  }

  return travelers.map(t => ({
    travelerId: t.id,
    name: t.name,
    balance: balanceMap.get(t.id) ?? 0,
  }));
}

// Minimize transactions algorithm using greedy approach
// Based on the canonical "Debt Simplification" algorithm
export function calculateSettlements(
  expenses: Expense[],
  travelers: Traveler[]
): Settlement[] {
  const balances = calculateBalances(expenses, travelers);

  // Separate into creditors (positive) and debtors (negative)
  let creditors = balances.filter(b => b.balance > 0.001).map(b => ({ ...b }));
  let debtors = balances.filter(b => b.balance < -0.001).map(b => ({ ...b }));

  const settlements: Settlement[] = [];
  let counter = 0;

  while (creditors.length > 0 && debtors.length > 0) {
    // Sort descending/ascending for greedy optimal
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    const creditor = creditors[0];
    const debtor = debtors[0];

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0) {
      settlements.push({
        id: `settlement-${++counter}`,
        from: debtor.travelerId,
        to: creditor.travelerId,
        amount: rounded,
        settled: false,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.001) creditors.shift();
    if (Math.abs(debtor.balance) < 0.001) debtors.shift();
  }

  return settlements;
}

export function getTotalByTraveler(
  expenses: Expense[],
  travelerId: string
): { paid: number; owes: number; net: number } {
  let paid = 0;
  let owes = 0;

  for (const expense of expenses) {
    if (expense.paidBy === travelerId) paid += expense.amount;
    const split = expense.splits.find(s => s.travelerId === travelerId);
    if (split) owes += split.amount;
  }

  return { paid, owes, net: paid - owes };
}

export function getTotalByCategory(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
  }
  return totals;
}
