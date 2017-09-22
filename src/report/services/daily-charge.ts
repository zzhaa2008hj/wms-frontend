import { RestClient, Query, fixDate } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { DailyCharge } from '@app/report/models/daily-charge';

@autoinject
export class DailyChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<DailyCharge> {
    return this.http.query<DailyCharge>(`/report/daily-charge/page`, criteria)
      .map(dailyCharge => fixDate(dailyCharge, 'date'));
  }

}