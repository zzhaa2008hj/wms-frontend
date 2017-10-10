import { RestClient, Query, handleResult, fixDate } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { PositionTransferInfo, PositionTransferItem } from "@app/cargo-position/models/transfer-info";
import { AttachmentMap } from "@app/common/models/attachment";

export interface StatisticsCriteria {
  customerName?: string;
  batchNumber?: string;
}

@autoinject
export class PositionTransferInfoService {
  constructor(private http: RestClient) {
  }

  page(criteria?: StatisticsCriteria): Query<PositionTransferInfo> {
    return this.http.query<PositionTransferInfo>(`/position-transfer/info/page`, criteria)
      .map(res => fixDate(res, "createTime"));
  }

  savePositionTransferInfo(positionTransferInfo: PositionTransferInfo): Promise<void> {
    return this.http.post(`/position-transfer/info`, positionTransferInfo).then(handleResult);
  }

  updatePositionTransferInfo(positionTransferInfo: PositionTransferInfo): Promise<void> {
    return this.http.put(`/position-transfer/info/${positionTransferInfo.id}`, positionTransferInfo).then(handleResult);
  }

  async getChangeHistory(id: string) {
    let res = await this.http.get(`/position-transfer/info/${id}/changeHistory`);
    return res.content;
  }

  updateBusinessVerify(id: string, status: number): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/verify`, status).then(handleResult);
  }

  updateConfirm(id: string, attachments: AttachmentMap[]): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/sign`, attachments).then(handleResult);
  }

  getById(id: string): Promise<PositionTransferInfo> {
    return this.http.get(`/position-transfer/info/${id}/getById`).then(res => res.content);
  }

  getInfoById(id: string): Promise<PositionTransferInfo> {
    return this.http.get(`/position-transfer/info/${id}`).then(res => res.content);
  }

  updateWarehouseVerify(id: string, status: number): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/warehouseVerify`, status).then(handleResult);
  }

  updateStartWork(id: string): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/startWork`, '').then(handleResult);
  }

  updateEndWork(id: string): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/endWork`, '').then(handleResult);
  }

  updateBusinessConfirm(id: string, status: number): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/confirm`, status).then(handleResult);
  }

  getByTransferItemId(transferItemId: string): Promise<PositionTransferInfo> {
    return this.http.get(`/position-transfer/info/${transferItemId}/byTransferItemId`).then(res => res.content);
  }

  updateGenerateWorkOrder(transferId: string): Promise<void> {
    return this.http.put(`/position-transfer/info/${transferId}/generateWorkOrder`, '').then(handleResult);
  }

  /**
   * 根据批次号 获取货位转移成功的数据
   * @param batchNumber 
   */
  getTsfSuccessList(batchNumber: string): Promise<PositionTransferInfo[]> {
    return this.http.get(`/position-transfer/info/tsfSuccessList?batchNumber=${batchNumber}`).then(res => res.content);
  }

  /**
   * 通过id获取单条货位转移的货物信息(只包含货物信息)
   * @param id 
   */
  getPositionTransferCargoItem(id: string): Promise<PositionTransferItem[]> {
    return this.http.get(`/position-transfer/info/${id}/getPositionTransferCargoItem`).then(res => res.content);
  }
}

@autoinject
export class PositionTransferItemService {
  constructor(private http: RestClient) {

  }

  getItems(id: string): Promise<PositionTransferItem[]> {
    return this.http.get(`/position-transfer/item/${id}/items`).then(res => res.content);
  }
}