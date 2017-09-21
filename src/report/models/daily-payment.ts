export interface DailyPayment {
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
//首页 显示 charts 图
export interface PaymentAmt{
  amount : any ;
  date : any ;
}
//首页 显示 charts 图
export interface ChargeAmt{
  amount : any ;
  date : any ;
}
