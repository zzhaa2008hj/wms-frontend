import { RestClient, Query, fixDate } from '@app/utils';
import { DailyCharge } from '@app/report/models/daily-charge';
import { autoinject } from 'aurelia-dependency-injection';
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";

@autoinject
export class DailyChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: ChargePaymentCriteria): Query<DailyCharge> {
    return this.http.query<DailyCharge>(`/report/daily-charge/page`, criteria)
      .map(res => fixDate(res, 'date'));
  }

}