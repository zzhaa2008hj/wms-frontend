import { autoinject } from "aurelia-dependency-injection";
import { Verification } from "@app/fee/models/verification";
import { RestClient, handleResult } from '@app/utils';

@autoinject
export class VerificationService {
  constructor(private http: RestClient) {
  }

  /**
   * 查询
   */
  async getVerifications(invoiceId: string): Promise<Verification[]> {
    return this.http.get(`/fee/verification/${invoiceId}`)
    .then(res => res.content.map(r => {
      r.createTime = new Date(r.createTime);
      return r;
    }));
  }
  /**
   * 新增
   */
  saveVerification(verification: Verification): Promise<void> {
    return this.http.post(`/fee/verification`, verification).then(handleResult);
  }
  /**
   * 删除
   */
  deleteVerification(id: string): Promise<void> {
    return this.http.delete(`/fee/verification/${id}`).then(handleResult);
  }
}