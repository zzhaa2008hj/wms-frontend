import { HttpClient } from 'aurelia-http-client';
import { inject } from 'aurelia-dependency-injection';
import { RestClient, fixDate, Query, handleResult } from '@app/utils';
import { Attachment } from '@app/common/models/attachment';

export interface AttachmentCriteria {
  businessNumber?: string;
  baseId?: string;
  businessType?: number;
}

export class AttachmentService {
  constructor( @inject private http: RestClient, @inject('config') private config: any) {
  }

  async getDirKey(dir: string): Promise<any> {
    let res = await this.http.get(`/base/attachment/${dir}`);
    return res.content;
  }

  view(path: string) {
    let baseUrl = this.config.upload.viewUrl;
    return baseUrl + '/' + path;
  }

  queryAttachments(criteria?: AttachmentCriteria): Query<Attachment> {
    return this.http.query<Attachment>(`/base/attachment/page`, criteria)
      .map(record => fixDate(record, 'uploadTime'));
  }

  async deleteAttachments(data: { baseId: string, url: string, uuidName: string }): Promise<void> {
    let url = '/base/attachment/business/' + data.baseId + '/' + data.uuidName.split('.')[0];
    await this.http.delete(url).then(handleResult);
    let uploadHttp = new HttpClient();
    let uploadUrl = this.config.upload.baseUrl;
    await uploadHttp.delete(uploadUrl + '/' + data.url);
  }
}