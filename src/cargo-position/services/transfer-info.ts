import { RestClient, Query } from '@app/utils';
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
    return this.http.query<PositionTransferInfo>(`/position-transfer/info/page`, criteria);
  }

}