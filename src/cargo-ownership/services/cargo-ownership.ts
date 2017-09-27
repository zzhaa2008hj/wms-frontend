import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoownershipTransfer } from "@app/cargo-ownership/models/cargo-ownership";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';

export interface CargoownershipTransferCriteria {
  originalCustomerName?: string;
  newCustomerName?: string;
  beginDate?: string;
  endDate?: string;
}

@autoinject
export class CargoownershipTransferService {
  constructor(private http: RestClient) {
  }
  /**
   * 分页查询
   */
  getPageList(criteria: CargoownershipTransferCriteria): Query<CargoownershipTransfer> {
    return this.http.query<CargoownershipTransfer>(`/ownership-transfer/info/page`, criteria);
  }

  /**
   * 获取货物信息 用于提取客户、批次
   * @param id 
   */
  getCustomers(): Promise<CargoInfo[]> {
    return this.http.get(`/ownership-transfer/info/customers`).then(res => res.content);
  }

  /**
   * 根据批次查询货物
   */
  getCargoItems(batchNumber: string): Promise<CargoItem[]> {
    return this.http.get(`/ownership-transfer/info/${batchNumber}/cargo-items`).then(res => res.content);
  }

  /**
   * 生成货权转移
   */
  createCargoownershipTransfer(): Promise<void> {
    return this.http.post(`/ownership-transfer/info/`, null).then(handleResult);
  }

}