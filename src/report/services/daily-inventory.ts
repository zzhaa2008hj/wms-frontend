import { RestClient, Query, fixDate } from '@app/utils';
import { DailyInventory } from '@app/report/models/daily-inventory';
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
      .map(res => fixDate(res, 'createTime'));
  }
}