import { autoinject } from "aurelia-dependency-injection";
import { extractResult, Query, RestClient } from "../../utils";
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

  async listNotice(params?: { status: boolean }): Promise<Notice[]> {
    let url = `/base/notice/list`;
    let res = await this.http.createRequest(url).withParams(params).asGet().send();
    return res.content;
  }

  async saveNotice(notice: Notice): Promise<void> {
    let url = `/base/notice`;
    let res = await this.http.createRequest(url).withContent(notice).asPost().send();
    return extractResult(res.content);
  }

  async updateState(id: string): Promise<void> {
    let url = `/base/notice/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async updateNotice(notice: any): Promise<void> {
    let url = `/base/notice`;
    let res = await this.http.createRequest(url).withContent(notice).asPut().send();
    return extractResult(res.content);
  }

  async deleteNotice(id: string) {
    let url = `/base/notice/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }


}