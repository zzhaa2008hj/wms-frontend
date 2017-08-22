export interface StatisticsCharge {
  customerName: string;
  cargoCategoryName: string;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;

  //周
  date: Date;

  //月
  type: number;
  month: string;
  monthCharge: number;
  monthArrears: number;
  grandTotalCharge: number;
  grandTotalArrears: number;
  grandTotalAmount: number;
}
