import { Contract } from "./contract";
import { Rate } from "./rate";
import {RateStep} from "../models/rateStep";
export interface ContractVo {

  /**
   * 合同信息
   */
  contract: Contract;

  /**
   *  库区id
   */
  warehouseId: string ;

  rateVos: Rate[];

  rateStepVos : RateStep[];

  time: Date ;
}