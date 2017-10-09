import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoownershipTransfer, TransferCargoItemVo, CargoownershipTransferVo, CargoownershipTransferItem, CargoOwnershipTransferRate } from '@app/cargo-ownership/models/cargo-ownership';

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
    return   this.http.query<CargoownershipTransfer>(`/ownership-transfer/info/page`, criteria);
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

  /**
   * 根据id 获取 货权转移信息
   */
  async queryById(id : string) : Promise<CargoownershipTransfer>{
    let res =await  this.http.get(`/ownership-transfer/info/${id}/info`);
    return res.content
  }

  /**
   * 商务审核:1
   * 费收审核:2
   * 副总审核:3
   */
  async doAudit(id : string ,status: number , type : string ): Promise<void>{
    let res =await  this.http.put(`/ownership-transfer/info/${id}/audit/${status}/${type}`,"");
    return res.content;
  }


  /**
   * 查询货物明细
   * @param id
   */
  async getCargoItemsById(id: string): Promise<CargoownershipTransferItem[]> {
    let res = await this.http.get(`/ownership-transfer/info/${id}/cargo-item`);
    return res.content;
  }



  /**
   * 根据货物明细ID 获取费率和费率
   * @param cargoItemId
   */
  async getCargoRatesByCargoItemId(cargoItemId: string): Promise<CargoOwnershipTransferRate[]> {
    let res = await this.http.get(`/ownership-transfer/info/cargo-item/${cargoItemId}/cargo-rates`);
    return res.content;
  }

  /**
   * 更改状态
   * 开始 作业
   *作业完成
   * 设置完工
   */
  async changeStage(id : string ,stage : number): Promise<void>{
    let res = await this.http.put(`/ownership-transfer/info/${id}/change-stage/${stage}`,"");
    return res.content ;
  }
  /**
   * 修改历史
   * @param id
   * @param historyId
   */
  getChangeHistory(id: string, historyId: string): Promise<CargoownershipTransfer> {
    return this.http.get(`/ownership-transfer/info/${id}/changeHistory/${historyId}`).then(res => res.content);
  }
  /**
   * 生成入库单
   * @param id
   */
  createInstockOrder(id: string): Promise<void> {
    return this.http.post(`/ownership-transfer/info/${id}/instockOrder`, null).then(handleResult);
  }

  /**
   * 根据批次号查询转入信息
   */
  getTsfInHistory(btn: string): Query<CargoownershipTransfer> {
    return this.http.query<CargoownershipTransfer>(`/ownership-transfer/info/tsfInHistory`, { "batchNum": btn });
  }

  /**
   * 根据批次号查询转出信息
   */
  getTsfOutHistory(btn: string): Query<CargoownershipTransfer> {
    return this.http.query<CargoownershipTransfer>(`/ownership-transfer/info/tsfOutHistory`, { "batchNum": btn });
  }
}