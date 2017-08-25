import { RestClient, Query } from '@app/utils';
import { DailyPayment } from '@app/report/models/daily-payment';
import { autoinject } from 'aurelia-dependency-injection';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";


@autoinject
export class DailyPaymentService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<DailyPayment> {
    return this.http.query<DailyPayment>(`/report/daily-payment/page`, criteria);
  }

}