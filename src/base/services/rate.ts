import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, Query, RestClient } from "../../utils";
import { Rate } from "../models/Rate";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class RateService {
  constructor(private http: RestClient) {
  }

  queryRates(param?: { name: string }): Query<any> {
    return this.http.query(`/base/rate/page`, param);
  }

  async saveRate(rate: Rate): Promise<void> {
    return await this.http.post(`/base/rate`, rate).then(handleResult);
  }


  async updateState(id: string): Promise<void> {
    return await this.http.put(`/base/rate/${id}`, null).then(handleResult);
  }

  async getRate(id: string): Promise<any> {
    return await this.http.get(`/base/rate/${id}`);
  }

  async updateRate(rate: Rate): Promise<void> {
    return await this.http.put(`/base/rate/${rate.id}`, rate).then(handleResult);
  }

  async deleteRate(id: string): Promise<void> {
    return await this.http.delete(`/base/rate/${id}`).then(handleResult);
  }
}

@autoinject
export class RateStepService {
  constructor(private http: RestClient) {
  }

  queryRateSteps(rateId: string): Query<any> {
    return this.http.query(`/base/rateStep/${rateId}/page`);
  }

  async saveRateStep(rateStep: Rate): Promise<void> {
    return await this.http.post(`/base/rateStep`, rateStep).then(handleResult);
  }

  async updateState(id: string): Promise<void> {
    return await this.http.put(`/base/rateStep/${id}`, null).then(handleResult);
  }

  async deleteRateStep(id: string) {
    return await this.http.delete(`/base/rateStep/${id}`).then(handleResult);
  }
}