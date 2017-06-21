import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, Query, RestClient } from "../../utils";
import { Notice } from "../models/notice";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class NoticeService {
  constructor(private http: RestClient) {
  }

  queryNotices(param: { keywords: string }): Query<any> {
    return this.http.query(`/base/notice/page`, param);
  }

  async saveNotice(notice: Notice): Promise<void> {
    await this.http.post(`/base/notice`, notice).then(handleResult);
  }

  async updateVisible(id: string): Promise<void> {
    await this.http.put(`/base/notice/${id}`, null).then(handleResult);
  }

}