import { RestClient, Query, fixDate } from '@app/utils';
import { MonthlyInventory, MonthlyInventoryVo, MonthsInventoryVo } from '@app/report/models/monthly-inventory';
import { autoinject } from 'aurelia-dependency-injection';

export interface Criteria {
  type?: number;
  batchNumber?: string;
  customerName?: string;
  cargoCategoryName?: string;
  cargoName?: string;
  searchDate?: string;
}

@autoinject
export class MonthlyInventoryService {
  constructor(private http: RestClient) {
  }

  page(criteria?: Criteria): Query<MonthlyInventory> {
    return this.http.query<MonthlyInventory>(`/report/monthly-inventory/page`, criteria)
      .map(res => fixDate(res, 'createTime'));
  }

  list(criteria?: Criteria): Promise<MonthlyInventoryVo[]> {
    return this.http.createRequest('/report/monthly-inventory/list')
      .withParams(criteria).asGet().send().then(res => res.content);
  }

  getTotalByMonth(month: string): Promise<MonthlyInventory> {
    return this.http.get(`/report/monthly-inventory/${month}`).then(res => res.content);
  }

  getTotalByMonths(month: string): Promise<MonthsInventoryVo> {
    return this.http.get(`/report/monthly-inventory/${month}/total`).then(res => res.content);
  }
}