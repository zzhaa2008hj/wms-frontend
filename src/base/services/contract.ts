import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, extractResult, Query, RestClient } from "../../utils";
import { Contract } from "../contract/index";

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
   */
  async getWarehouses() {
    let res = await this.http.createRequest("base/warehouse").asGet().send();
    return res.content;
  }

  // async getOrganization(id: string) {
  //   let url = `base/customer/${id}`;
  //   let res = await this.http.createRequest(url).asGet().send();
  //   return res.content;
  // }
  //
  async saveContract(contract: Contract) {
    let url = "base/contract";
    let res = await this.http.createRequest(url).withContent(contract).asPost().send();
    return extractResult(res.content);
  }

  //
  // async updateOrganization(id: string, organization: any) {
  //   let url = `base/customer/${id}`;
  //   let res = await this.http.createRequest(url).withContent(organization).asPut().send();
  //   return extractResult(res.content);
  // }
  //
  // async changeStatus(id: string, status: string) {
  //   let url = `base/customer/updateStatus/${id}`;
  //   let res = await this.http.createRequest(url).withParams({ status }).asPut().send();
  //   return extractResult(res.content);
  // }

}                                                             