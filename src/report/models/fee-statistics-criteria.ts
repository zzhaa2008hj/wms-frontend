/**
 * Created by Hui on 2017/8/15.
 */
export interface FeeStatisticsCriteria {
  type?: number;
  customerName?: string;
  cargoCategoryName?: string;

  dateType: number;
  billingType: number;
}

