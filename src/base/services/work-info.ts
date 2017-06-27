import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, RestClient } from '../../utils';
import { WorkInfo } from "../models/work-info";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class WorkInfoService {
  constructor(private http: RestClient) {
  }

  async listWorkInfo(params?: { status: boolean }): Promise<any> {
    let url = `/base/workInfo/list`;
    let res = await this.http.createRequest(url).withParams(params).asGet().send();
    return res.content;
  }

  saveWorkInfo(workInfo: WorkInfo) {
    return this.http.post(`/base/workInfo`, workInfo).then(handleResult);
  }

  updateState(id: string) {
    return this.http.put(`/base/workInfo/${id}/state`, null).then(handleResult);
  }

  updateWorkInfo(workInfo: WorkInfo) {
    return this.http.put(`/base/workInfo/${workInfo.id}`, workInfo).then(handleResult);
  }

  deleteWorkInfo(id: any) {
    return this.http.delete(`/base/workInfo/${id}`).then(handleResult);
  }
}