import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient } from "@app/utils";
import { WorkInfo } from "@app/base/models/work-info";
import { CargoRate } from '@app/base/models/cargo-info';

/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class WorkInfoService {
  constructor(private http: RestClient) {
  }

  async listWorkInfo(status?: boolean): Promise<WorkInfo[]> {
    let url = `/base/workInfo/list`;
    let res = await this.http.createRequest(url).withParams({ status: status }).asGet().send();
    return res.content;
  }

  listWorkInfoesByCargo(businessId: string, type: number): Promise<CargoRate[]> {
    return this.http.get(`/base/workInfo/businessId/${businessId}?type=${type}`)
      .then(res => res.content);
  }

  saveWorkInfo(workInfo: WorkInfo): Promise<void> {
    return this.http.post(`/base/workInfo`, workInfo).then(handleResult);
  }

  updateState(id: string): Promise<void> {
    return this.http.put(`/base/workInfo/${id}/state`, null).then(handleResult);
  }

  updateWorkInfo(workInfo: WorkInfo): Promise<void> {
    return this.http.put(`/base/workInfo/${workInfo.id}`, workInfo).then(handleResult);
  }

  deleteWorkInfo(id: any): Promise<void> {
    return this.http.delete(`/base/workInfo/${id}`).then(handleResult);
  }

  getWorkInfo(id: string): Promise<WorkInfo> {
    return this.http.get(`/base/workInfo/${id}`).then(res => res.content);
  }
}