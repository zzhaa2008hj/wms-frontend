import { RestClient } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { PositionTransferRate, PositionTransferRateItem } from "@app/cargo-position/models/transfer-rate";

export interface StatisticsCriteria {
  customerName?: string;
  batchNumber?: string;
}

@autoinject
export class PositionTransferRateService {
  constructor(private http: RestClient) {
  }

  getRatesByItemId(id: string): Promise<PositionTransferRate[]> {
    return this.http.get(`/position-transfer/rate/${id}/rates`).then(res => res.content);
  }
}

@autoinject
export class PositionTransferRateItemService {
  constructor(private http: RestClient) {

  }

  getItemsByRateId(id: string): Promise<PositionTransferRateItem[]> {
    return this.http.get(`/position-transfer/rate-item/${id}/rateItems`).then(res => res.content);
  }
}