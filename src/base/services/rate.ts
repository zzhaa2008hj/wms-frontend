import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { Rate, RateStep } from "@app/base/models/rate";
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

  saveRate(rate: Rate): Promise<void> {
    return this.http.post(`/base/rate`, rate).then(handleResult);
  }


  updateState(id: string): Promise<void> {
    return this.http.put(`/base/rate/${id}`, null).then(handleResult);
  }

  async getRate(id: string): Promise<Rate> {
    let res = await this.http.get(`/base/rate/${id}`);
    return res.content;
  }

  updateRate(rate: Rate): Promise<void> {
    return this.http.put(`/base/rate/${rate.id}`, rate).then(handleResult);
  }

  deleteRate(id: string): Promise<void> {
    return this.http.delete(`/base/rate/${id}`).then(handleResult);
  }
}

@autoinject
export class RateStepService {
  constructor(private http: RestClient) {
  }

  async listRateStepByRateId(rateId: string): Promise<RateStep[]> {
    let res = await this.http.get(`/base/rateStep/${rateId}`);
    return res.content;
  }
}