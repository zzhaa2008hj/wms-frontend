import { RestClient, Query } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { MonthlyCharge } from "@app/report/models/monthly-charge";
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";

@autoinject
export class MonthlyChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<MonthlyCharge> {
    return this.http.query<MonthlyCharge>(`/report/monthly-charge/page`, criteria);
  }

  async getList(criteria: FeeStatisticsCriteria): Promise<MonthlyCharge[]> {
    let res = await this.http.createRequest(`/report/monthly-charge/list`).withParams(criteria).asGet().send();
    return res.content;
  }
}