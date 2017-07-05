import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient, extractResult } from '@app/utils';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoInfo, CargoItem, CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { Contract } from '@app/base/models/contract';
import { Organization } from '@app/base/models/organization';
import { ChangeHistory } from '@app/common/models/change-history';
/**
 * 机构查询条件
 */
export interface CargoInfoCriteria {
  searchName?: string;
  instockBeginDate?: Date;
  instockEndDate?: Date;
}

@autoinject
export class CargoInfoService {
  constructor(private http: RestClient) {
  }

  queryCargoInfo(criteria?: CargoInfoCriteria): Query<CargoInfo[]> {
    return this.http.query(`base/cargoInfo/page`, criteria);
  }

  /**
   * 获取货物种类信息
   */
  async getCargoCategories(): Promise<CargoCategory[]> {
    let res = await this.http.get(`base/cargoCategory/list?status=true`);
    return res.content;
  }

  /**
   * 获取合同信息
   * @param contractType
   */
  async getContracts(contractType: number): Promise<Contract[]> {
    let res = await this.http.get(`base/contract/list?contractType=${contractType}`);
    return res.content;
  }

  /**
   * 获取该合同下的所有货物费率信息
   * @param contractId
   * @param wareHouseType
   */
  async getContractCargoRates(contractId: string, wareHouseType: string): Promise<CargoRate[]> {
    let res = await this.http.
      get(`base/contract/contractRateList?contractId=${contractId}&wareHouseType=${wareHouseType}`);
    return res.content;
  }

  /**
   * 获取该合同下的所有货物阶梯费率信息
   * @param contractId
   */
  async getContractCargoRateSteps(contractId: string): Promise<CargoRateStep[]> {
    let res = await this.http.get(`base/contract/contractRateStepList?contractId=${contractId}`);
    return res.content;
  }

  /**
   * 获取客户信息
   * @param customerType
   */
  async getCustomers(customerType: number): Promise<Organization[]> {
    let res = await this.http.get(`base/customer/list?customerType=${customerType}`);
    return res.content;
  }

  /**
   *  获取批次号
   */
  async getBatchNumber(): Promise<any> {
    let res = await this.http.get(`/base/code/generate?type=0`);
    return extractResult(res.content);
    //return this.http.get(`/base/code/generate?type=0`).then(handleResult);
  }

  /**
   * 新增保存
   * @param contractVo
   */
  saveCargoInfo(cargoInfo: CargoInfo): Promise<void> {
    return this.http.post(`base/cargoInfo`, cargoInfo).then(handleResult);
  }

  /**
   * 查询单个客户货物信息
   * @param cargoInfoId
   */
  async getCargoInfo(id: string): Promise<CargoInfo> {
    let res = await this.http.get(`base/cargoInfo/${id}`);
    return res.content;
  }

  /**
   * 查询货物明细
   * @param id 
   */
  async getCargoItems(id: string): Promise<CargoItem[]> {
    let res = await this.http.get(`base/cargoInfo/cargoItem/${id}`);
    return res.content;
  }

  /**
   * 编辑保存
   * @param contractVo
   */
  updateCargoInfo(cargoInfo: CargoInfo, cargoInfoId: string): Promise<void> {
    return this.http.put(`base/cargoInfo/${cargoInfoId}`, cargoInfo).then(handleResult);
  }

  /**
   * 删除入库指令
   * @param id 
   */
  delete(id: string): Promise<void> {
    return this.http.delete(`base/cargoInfo/${id}`).then(handleResult);
  }

  async getChangeHistory(businessId, historyId): Promise<ChangeHistory<CargoInfo>> {
    let res = await this.http.get(`/base/cargoInfo/${businessId}/changeHistory/${historyId}`);
    return res.content;
  }
}