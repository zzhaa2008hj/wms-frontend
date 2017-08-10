import { RestClient } from '@app/utils';
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class CodeService {
  constructor(private http: RestClient) {
  }

  async generateCode(type: string, batchNumber?: string): Promise<any> {
    let res = await this.http.get(`/base/code/generate?type=${type}&batchNumber=${batchNumber}`);
    return res.content;
  }

  async generateCodeByDate(type: string, date: number, batchNumber: string): Promise<any> {
    let res = await this.http.get(`/base/code/generateCodeByDate?type=${type}&batchNumber=${batchNumber}&date=${date}`);
    return res.content;
  }
}