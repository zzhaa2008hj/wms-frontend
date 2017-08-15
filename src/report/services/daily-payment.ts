import { RestClient, Query } from '@app/utils';
import { DailyPayment } from '@app/report/models/daily-payment';
import { autoinject } from 'aurelia-dependency-injection';
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";


@autoinject
export class DailyPaymentService {
  constructor(private http: RestClient) {
  }

  page(criteria?: ChargePaymentCriteria): Query<DailyPayment> {
    return this.http.query<DailyPayment>(`/report/daily-payment/page`, criteria);
  }

}