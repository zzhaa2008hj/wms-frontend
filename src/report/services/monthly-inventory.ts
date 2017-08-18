import { RestClient, Query, fixDate } from '@app/utils';
import { MonthlyInventory } from '@app/report/models/monthly-inventory';
import { autoinject } from 'aurelia-dependency-injection';

export interface Criteria {
  type?: number;
  batchNumber?: string;
  customerName?: string;
  cargoCategoryName?: string;
  cargoName?: string;
  beginDate?: string;
  endDate?: string;
}

@autoinject
export class MonthlyInventoryService {
  constructor(private http: RestClient) {
  }

  page(criteria?: Criteria): Query<MonthlyInventory> {
    return this.http.query<MonthlyInventory>(`/report/monthly-inventory/page`, criteria)
      .map(res => fixDate(res, 'createTime'));
  }
}