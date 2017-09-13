import { RestClient, Query } from '@app/utils';
import { DailyCharge } from '@app/report/models/daily-payment';
import { autoinject } from 'aurelia-dependency-injection';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";


@autoinject
export class DailyChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<DailyCharge> {
    return this.http.query<DailyCharge>(`/report/daily-charge/page`, criteria);
  }

}