import { autoinject } from "aurelia-dependency-injection";
import { extractResult, Query, RestClient } from "../../utils";
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
    let url = `/base/rate`;
    let res = await this.http.createRequest(url).withContent(rate).asPost().send();
    return extractResult(res.content);
  }


  async updateState(id: string): Promise<void> {
    let url = `/base/rate/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async getRate(id: string): Promise<Rate> {
    let url = `/base/rate/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async updateRate(rate: Rate): Promise<void> {
    let url = `/base/rate`;
    let res = await this.http.createRequest(url).withContent(rate).asPut().send();
    return extractResult(res.content);
  }

  async deleteRate(id: string) {
    let url = `/base/rate/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }
}

@autoinject
export class RateStepService {
  constructor(private http: RestClient) {
  }

  queryRateSteps(param?: { name: string }): Query<any> {
    return this.http.query(`/base/rateStep/page`, param);
  }

  async saveRateStep(rateStep: Rate): Promise<void> {
    let url = `/base/rateStep`;
    let res = await this.http.createRequest(url).withContent(rateStep).asPost().send();
    return extractResult(res.content);
  }

  async updateState(id: string): Promise<void> {
    let url = `/base/rateStep/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async getRateStep(id: string): Promise<Rate> {
    let url = `/base/rateStep/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async updateRateStep(rateStep: Rate): Promise<void> {
    let url = `/base/rateStep`;
    let res = await this.http.createRequest(url).withContent(rateStep).asPut().send();
    return extractResult(res.content);
  }
}