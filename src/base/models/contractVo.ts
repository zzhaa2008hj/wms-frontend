import { Contract } from "./contract";
export interface ContractVo {

  /**
   * 合同信息
   */
  contract: Contract;

  /**
   *  库区id
   */
  warehouseId: string ;

  /**
   *  基础费率id
   */
  baseRateId: string ;

  /**
   * 基础阶梯费率id
   */
  baseRateStepId: string ;


  time : Date ;
}