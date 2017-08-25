import { RestClient, Query } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';
import { MonthlyPayment } from "@app/report/models/monthly-payment";
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";


@autoinject
export class MonthlyPaymentService {
  constructor(private http: RestClient) {
  }

  page(criteria?: FeeStatisticsCriteria): Query<MonthlyPayment> {
    return this.http.query<MonthlyPayment>(`/report/monthly-payment/page`, criteria);
  }

}