export interface DailyCharge {
  date: Date;
  customerName: string;
  cargoCategoryName: string;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;
}
