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
}

@autoinject
export class RateDataService {
  constructor(private http: RestClient) {
  }

  queryRateData(param?: { name: string }): Query<any> {
    return this.http.query(`/base/rateData/page`, param);
  }

  async saveRateData(rateData: Rate): Promise<void> {
    let url = `/base/rateData`;
    let res = await this.http.createRequest(url).withContent(rateData).asPost().send();
    return extractResult(res.content);
  }


  async updateState(id: string): Promise<void> {
    let url = `/base/rateData/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async getRateData(id: string): Promise<Rate> {
    let url = `/base/rateData/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async updateRateData(rateData: Rate): Promise<void> {
    let url = `/base/rateData`;
    let res = await this.http.createRequest(url).withContent(rateData).asPut().send();
    return extractResult(res.content);
  }
}