import { autoinject } from "aurelia-dependency-injection";
import { Invoice } from "@app/fee/models/invoice";
import { RestClient, handleResult } from '@app/utils';

@autoinject
export class InvoiceService {
  constructor(private http: RestClient) {
  }

  /**
   * 查询发票
   */
  async getInvoices(infoId: string, type: number): Promise<Invoice[]> {
    let res = await this.http.get(`/fee/invoice/${infoId}/${type}`);
    return res.content;
  }
  /**
   * 新增
   */
  saveInvoice(invoice: Invoice): Promise<void> {
    return this.http.post(`/fee/invoice`, invoice).then(handleResult);
  }
  /**
   * 删除
   */
  deleteInvoice(id: string): Promise<void> {
    return this.http.delete(`/fee/invoice/${id}`).then(handleResult);
  }
}