import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "../../utils";
import { Rate, RateStep } from "../models/Rate";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class RateService {
  constructor(private http: RestClient) {
  }

  queryRates(param?: { name: string }): Query<Rate> {
    return this.http.query(`/base/rate/page`, param);
  }

  saveRate(rate: Rate) {
    this.http.post(`/base/rate`, rate).then(handleResult);
  }


  updateState(id: string) {
    this.http.put(`/base/rate/${id}`, null).then(handleResult);
  }

  async getRate(id: string): Promise<any> {
    return await this.http.get(`/base/rate/${id}`);
  }

  updateRate(rate: Rate) {
    this.http.put(`/base/rate/${rate.id}`, rate).then(handleResult);
  }

  deleteRate(id: string) {
    this.http.delete(`/base/rate/${id}`).then(handleResult);
  }
}

@autoinject
export class RateStepService {
  constructor(private http: RestClient) {
  }

  queryRateSteps(rateId: string): Query<RateStep> {
    return this.http.query(`/base/rateStep/${rateId}/page`);
  }

  saveRateStep(rateStep: RateStep) {
    return this.http.post(`/base/rateStep`, rateStep).then(handleResult);
  }

  updateState(id: string) {
    return this.http.put(`/base/rateStep/${id}`, null).then(handleResult);
  }

  deleteRateStep(id: string) {
    return this.http.delete(`/base/rateStep/${id}`).then(handleResult);
  }
}