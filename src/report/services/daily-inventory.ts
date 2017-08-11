import { RestClient, Query, fixDate } from '@app/utils';
import { DailyInventory, DailyInventoryVo } from '@app/report/models/daily-inventory';
import { autoinject } from 'aurelia-dependency-injection';

export interface Criteria {
  batchNumber?: string;
  customerName?: string;
  makeDate?: string;
}

@autoinject
export class DailyInventoryService {
  constructor(private http: RestClient) {
  }

  page(criteria?: Criteria): Query<DailyInventory> {
    return this.http.query<DailyInventory>(`/report/daily-inventory/page`, criteria)
      .map(res => fixDate(res, 'dataTime'));
  }

  async pageAll(criteria?: Criteria): Promise<DailyInventoryVo> {
    let res = await this.http.createRequest(`/report/daily-inventory/pageAll`).withParams(criteria).asGet().send();
    return res.content;
  }
}