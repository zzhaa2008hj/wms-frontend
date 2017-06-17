import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, extractResult, Query, RestClient } from "../../utils";
import { Contract } from "../contract/index";
import { ContractVo } from "../models/contractVo";
import { WorkInfo } from "../models/workInfo";

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
    let res = await this.http.createRequest("base/warehouse").asGet().send();
    return res.content;
  }

  /**
   * 获取单个合同信息
   * @param id
   * @returns {Promise<ContractVo>}
   */
  async getContract(id: string): Promise<ContractVo> {
    let res = await  this.http.get(`base/customer/${id}`);
    return res.content;
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
    let res = await this.http.put(`base/customer`, contractVo);
    return extractResult(res.content);
  }

  // async changeStatus(id: string, status: string) {
  //   let url = `base/customer/updateStatus/${id}`;
  //   let res = await this.http.createRequest(url).withParams({ status }).asPut().send();
  //   return extractResult(res.content);
  // }

}                                                             