import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoownershipTransfer, TransferCargoItemVo, CargoownershipTransferVo } from '@app/cargo-ownership/models/cargo-ownership';
import { CargoInfo} from '@app/base/models/cargo-info';

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
  getCargoItems(batchNumber: string): Promise<TransferCargoItemVo[]> {
    return this.http.get(`/ownership-transfer/info/${batchNumber}/cargo-items`).then(res => res.content);
  }

  /**
   * 生成货权转移
   */
  createCargoownershipTransfer(cargoownershipTransfer: CargoownershipTransfer): Promise<void> {
    return this.http.post(`/ownership-transfer/info/`, cargoownershipTransfer).then(handleResult);
  }

  /**
   * 查详情
   */
  getDetail(id: string): Promise<CargoownershipTransferVo> {
    return this.http.get(`/ownership-transfer/info/${id}/detail`).then(res => res.content);
  }
  /**
   * 查修改详情
   */
  getEditDetail(id: string): Promise<CargoownershipTransfer> {
    return this.http.get(`/ownership-transfer/info/${id}/edit-detail`).then(res => res.content);
  }
  /**
   * 修改
   */
  edit(id: string, cargoownershipTransfer: CargoownershipTransfer): Promise<void> {
    return this.http.put(`/ownership-transfer/info/${id}`, cargoownershipTransfer).then(handleResult);
  }

  getChangeHistory(id: string, historyId: string): Promise<CargoownershipTransfer> {
    return this.http.get(`/ownership-transfer/info/${id}/changeHistory/${historyId}`).then(res => res.content);
  }
}