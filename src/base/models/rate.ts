/**
 * Created by Hui on 2017/6/15.
 */
import {RateStep} from "src/base/models/rateStep";


export interface Rate {
  id?: string;
  status: boolean;
  orgId: string;
  remark: string;

  // Rate
  chargeType: number;
  chargeCategory: number;
  workId: string;
  workName: string;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  pricingMode: number;
  unit: string;
  price: number;
  warehouseType: number;
  warehouseCategory: number;
  customerCategory: number;

  // RateStep
  rateId: string;
  stepNum: number;
  stepStart: number;
  stepEnd: number;
  stepPrice: number;
  stepUnit: string; //元/天、元/吨

  rateStep: RateStep[];
}