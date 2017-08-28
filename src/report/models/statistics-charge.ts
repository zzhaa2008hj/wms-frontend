export interface StatisticsCharge {
  type: number;
  customerName: string;
  cargoCategoryName: string;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;

  //周
  date: Date;

  //年月
  year: string;
  month: string;
  monthCharge: number;
  monthArrears: number;
  grandTotalCharge: number;
  grandTotalArrears: number;
  grandTotalAmount: number;
  billingType: number;

  dateStr: string;
  billingTypeStr: string;
}
