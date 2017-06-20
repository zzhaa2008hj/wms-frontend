import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, extractResult, fixDate, Query, RestClient } from "../../utils";
import { Contract } from "../contract/index";
import { ContractVo } from "../models/contractVo";
import { WorkInfo } from "../models/work-info";
import { Rate } from "../models/rate";
import {RateStep} from "src/base/models/rateStep";
import {Organization} from "../models/organization";
/**
 * 机构查询条件
 */
export interface ContractCriteria {
  name?: string;
  contractType?: string;
}

@autoinject
export class ContractService {
  constructor(private http: RestClient) {
  }

  queryContracts(criteria?: ContractCriteria): Query<Contract> {
    return this.http.query(`base/contract/page`, criteria).map(dateConverter('signDate', 'startTime', 'endTime'));
  }

  /**
   * 查询库区信息
   * @returns {Promise<WorkInfo>}
   */
  async getWarehouses(): Promise<WorkInfo> {
    let res = await this.http.get(`base/warehouse`);
    return res.content;
  }

  async getCustomers(): Promise<Organization>{
    let res = await this.http.get(`base/customer/list`);
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
   * 新增保存
   * @param contractVo
   * @returns {Promise<any>}
   */
  async saveContract(contractVo: ContractVo): Promise<any> {
    let res = await this.http.post(`base/contract`, contractVo);
    return extractResult(res.content);
  }

  /**
   * 编辑保存
   * @param contractVo
   * @returns {Promise<any>}
   */
  async updateContract(contractVo: ContractVo): Promise<any> {
    let res = await this.http.put(`base/contract`, contractVo);
    return extractResult(res.content);
  }

  /**
   * 删除合同
   * @param id
   * @returns {Promise<any>}
   */
  async delete(id: string) {
    let res = await  this.http.delete(`base/contract/${id}`);
    return extractResult(res.content);
  }

  async audit(id: string): Promise<any> {
    let res = await  this.http.put(`base/contract/verifyContract/${id}`, '');
    return extractResult(res.content);
  }
}