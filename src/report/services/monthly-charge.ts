import { RestClient, Query } from '@app/utils';
import { MonthlyCharge } from '@app/report/models/monthly-charge';
import { autoinject } from 'aurelia-dependency-injection';
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";


@autoinject
export class MonthlyChargeService {
  constructor(private http: RestClient) {
  }

  page(criteria?: ChargePaymentCriteria): Query<MonthlyCharge> {
    return this.http.query<MonthlyCharge>(`/report/monthly-charge/page`, criteria);
  }

}