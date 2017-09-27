import { RestClient, Query, handleResult } from '@app/utils';
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
    return this.http.query<PositionTransferInfo>(`/position-transfer/info/page`, criteria);
  }

  savePositionTransferInfo(positionTransferInfo: PositionTransferInfo): Promise<void> {
    return this.http.post(`/position-transfer/info`, positionTransferInfo).then(handleResult);
  }

  updateBusinessVerify(id: string, status: number): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/verify`, status).then(handleResult);
  }

  updateConfirm(id: string, attachments: AttachmentMap[]): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/confirm`, attachments).then(handleResult);
  }

  getById(id: string): Promise<PositionTransferInfo> {
    return this.http.get(`/position-transfer/info/${id}`).then(res => res.content);
  }

  updateWarehouseVerify(id: string, status: number): Promise<void> {
    return this.http.put(`/position-transfer/info/${id}/warehouseVerify`, status).then(handleResult);
  }
}

@autoinject
export class PositionTransferItemService {
  constructor(private http: RestClient) {

  }

  getItems(id: string): Promise<PositionTransferItem[]> {
    return this.http.get(`/position-transfer/info/${id}/items`).then(res => res.content);
  }
}