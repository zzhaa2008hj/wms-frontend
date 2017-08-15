export interface MonthlyCharge {
  type: number;
  month: string;
  customerName: string;
  cargoCategoryName: string;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;
  monthCharge: number;
  monthArrears: number;
  grandTotalCharge: number;
  grandTotalArrears: number;
  grandTotalAmount: number;
}
