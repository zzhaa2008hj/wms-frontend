import { RestClient, Query, handleResult, fixDate } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";

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
}