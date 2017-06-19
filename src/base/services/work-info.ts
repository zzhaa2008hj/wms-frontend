import { autoinject } from "aurelia-dependency-injection";
import { extractResult, RestClient } from "../../utils";
import { WorkInfo } from "../models/work-info";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class WorkInfoService {
  constructor(private http: RestClient) {
  }

  async listWorkInfo(params?: { status: boolean }): Promise<WorkInfo[]> {
    let url = `/base/workInfo/list`;
    let res = await this.http.createRequest(url).withParams(params).asGet().send();
    return res.content;
  }

  async saveWorkInfo(workInfo: WorkInfo): Promise<void> {
    let url = `/base/workInfo`;
    let res = await this.http.createRequest(url).withContent(workInfo).asPost().send();
    return extractResult(res.content);
  }

  async updateState(id: string): Promise<void> {
    let url = `/base/workInfo/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async updateWorkInfo(workInfo: any): Promise<void> {
    let url = `/base/workInfo`;
    let res = await this.http.createRequest(url).withContent(workInfo).asPut().send();
    return extractResult(res.content);
  }

  async deleteWorkInfo(id: any) {
    let url = `/base/workInfo/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }
}