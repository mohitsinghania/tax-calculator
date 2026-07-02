export interface IncomeFormState {
  grossIncome: number;
  employerNps: number;
  deduction80C: number;
  deduction80D: number;
  hraExemption: number;
  homeLoanInterest: number;
}

export const emptyFields: IncomeFormState = {
  grossIncome: 0,
  employerNps: 0,
  deduction80C: 0,
  deduction80D: 0,
  hraExemption: 0,
  homeLoanInterest: 0,
};
