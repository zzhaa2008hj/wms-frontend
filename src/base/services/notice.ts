import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient, fixDate } from '@app/utils';
import { Notice } from "@app/base/models/notice";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class NoticeService {
  constructor(private http: RestClient) {
  }

  queryNotices(param: { keywords?: string, visible?: string }): Query<any> {
    return this.http.query<Notice>(`/base/notice/page`, param).map(log => fixDate(log, 'createTime'));
  }

  saveNotice(notice: Notice): Promise<void> {
    return this.http.post(`/base/notice`, notice).then(handleResult);
  }

  updateVisible(id: string): Promise<void> {
    return this.http.put(`/base/notice/${id}`, null).then(handleResult);
  }

  async getNotices(): Promise<Notice[]> {
    let res = await this.http.get(`base/notice/list`);
    return res.content;
  }
}