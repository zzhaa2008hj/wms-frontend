export interface DailyCharge {
  date: Date;
  customerName: string;
  workName: string;
  cargoCategoryName: string;
  quantity: number;
  number: number;
  price: number;
  unit: string;
  warehouse: string;
  sumAmount: number;
}
