export interface MonthlyPayment {
  type: number;
  customerName: string;
  month: string;
  sumAmount: number;
  monthPaid: number;
  monthUnpaid: number;
  grandTotalPaid: string;
  grandTotalUnpaid: string;
  grandTotalAmount: number;
}
