import { Contract } from '@app/base/models/contract';
import { autoinject } from "aurelia-dependency-injection";
import { fixDate, handleResult, Query, RestClient } from "@app/utils";
import { ContractVo } from "@app/base/models/contractVo";
import { WorkInfo } from "@app/base/models/work-info";
import { Rate, RateStep } from "@app/base/models/rate";
import { Organization } from "@app/base/models/organization";
import { ChangeHistory } from '@app/common/models/change-history';
/**
 * 机构查询条件
 */
export interface ContractCriteria {
  searchName?: string;
  contractType?: string;
}

@autoinject
export class ContractService {
  constructor(private http: RestClient) {
  }

  queryContracts(criteria?: ContractCriteria): Query<Contract> {
    return this.http.query<Contract>(`base/contract/page`, criteria)
      .map(c => fixDate(c, 'signDate', 'startTime', 'endTime'));
  }

  /**
   * 获取修改记录
   *
   * @param {string} id
   * @param {string} historyId
   * @returns {Promise<ChangeHistory<ContractVo>>}
   * @memberof ContractService
   */
  async getChangeHistory(id: string, historyId: string): Promise<ChangeHistory<ContractVo>> {
    let res = await this.http.get(`base/contract/${id}/changeHistory/${historyId}`);
    return res.content;
  }

  /**
   * 查询库区信息
   * @returns {Promise<WorkInfo[]>}
   */
  async getWarehouses(): Promise<WorkInfo[]> {
    let res = await this.http.get(`base/warehouse/list`);
    return res.content;
  }

  async getCustomers(customerType: number): Promise<Organization[]> {
    let res = await this.http.get(`base/customer/list?customerType=${customerType}`);
    return res.content;
  }

  /**
   * 获取基础费率和阶梯费率
   * @returns {Promise<RateAndRateStep[]>}
   */
  async getBaseRate(): Promise<Rate[]> {
    let res = await this.http.get(`base/rate/list`);
    return res.content;
  }

  /**
   * 获取阶梯费率
   * @returns {Promise<RateStep[]>}
   */
  async getBaseRateStep(): Promise<RateStep[]> {
    let res = await this.http.get(`base/rateStep/list`);
    return res.content;
  }

  /**
   * 获取单个合同信息
   * @param id
   * @returns {Promise<ContractVo>}
   */
  async getContract(id: string): Promise<ContractVo> {
    return this.http.get(`base/contract/${id}`)
      .then(res => {
        let contractVo = res.content;
        fixDate(contractVo.contract, 'signDate', 'startTime', 'endTime');
        return contractVo;
      });
  }

  /**
   * 获取单个合同的基本信息
   *
   * @param {string} id
   * @returns {Promise<Contract>}
   * @memberof ContractService
   */
  async getContractBaseInfo(id: string): Promise<Contract> {
    return this.http.get(`base/contract/${id}/baseInfo`).then(res => {
      let contract = res.content;
      fixDate(contract, 'signDate', 'startTime', 'endTime');
      return contract;
    });
  }

  /**
   * 新增保存
   * @param contractVo
   * @returns {Promise<void>}
   */
  saveContract(contractVo: ContractVo): Promise<void> {
    return this.http.post(`base/contract`, contractVo).then(handleResult);
  }

  /**
   * 编辑保存
   * @param contractVo
   * @returns {Promise<void>}
   */
  updateContract(contractVo: ContractVo): Promise<void> {
    return this.http.put(`base/contract/${contractVo.contract.id}`, contractVo).then(handleResult);
  }

  /**
   * 删除合同
   * @param id
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void> {
    return this.http.delete(`base/contract/${id}`).then(handleResult);
  }

  audit(id: string, status: number): Promise<void> {
    return this.http.put(`base/contract/verifyContract/${id}?status=${status}`, '').then(handleResult);
  }

  changeStatus(id: string, status: number): Promise<void> {
    return this.http
      .createRequest(`base/contract/changeStatus/${id}`).withParams({status: status}).asPut().send()
      .then(handleResult);
  }
}