import { RestClient, Query } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { MonthlyPayment } from "@app/report/models/monthly-payment";
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";


@autoinject
export class MonthlyPaymentService {
  constructor(private http: RestClient) {
  }

  page(criteria?: ChargePaymentCriteria): Query<MonthlyPayment> {
    return this.http.query<MonthlyPayment>(`/report/monthly-payment/page`, criteria);
  }

}