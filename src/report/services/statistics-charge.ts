import { RestClient, Query, fixDate } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { StatisticsCharge } from "@app/report/models/statistics-charge";

@autoinject
export class StatisticsChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<StatisticsCharge> {
    return this.http.query<StatisticsCharge>(`/report/statistics-charge/page`, criteria)
      .map(res => fixDate(res, 'date'));
  }

}