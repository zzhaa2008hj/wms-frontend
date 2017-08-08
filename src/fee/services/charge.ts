import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient, Query } from '@app/utils';
import { ChargeInfo, ChargeItem } from '@app/fee/models/charge';
import { Invoice } from "@app/fee/models/invoice";
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeInfoService {
  constructor(private http: RestClient) {
  }

  customerConfirm(chargeInfoId: string): Promise<void> {
    return this.http.post(`/fee/charge-info/${chargeInfoId}/customerConfirm`, null).then(handleResult);
  }

  async getById(id: string): Promise<ChargeInfo> {
    let res = await this.http.get(`/fee/charge-info/${id}`);
    return res.content;
  }

  issueChargeInvoice(id: string, invoice: Invoice): Promise<void> {
    return this.http.put(`/fee/charge-info//chargeInvoice/${id}`, invoice).then(handleResult);
  }

  auditSecondFee(id: string, status: number): Promise<void> {
    return this.http.put(`/fee/charge-info/${id}/${status}/audit`, null).then(handleResult);
  }

  auditCancel(id: string): Promise<void> {
    return this.http.put(`/fee/charge-info/chargeAuditCancel/${id}`, null).then(handleResult);
  }

  /**
   * 查询结算需求 - 分页
   */
  pageChargeInfo(chargeInfoCriteria?: ChargeInfoCriteria): Query<ChargeInfo> {
    return this.http.query<ChargeInfo>(`/fee/charge-info/page`, chargeInfoCriteria).map(info => {
      info.chargeStartDate = new Date(info.chargeStartDate);
      info.chargeEndDate = new Date(info.chargeEndDate);
      return info;
    });
  }
  /**
   * 根据客户货物批次号
   */
  async getBatchNumbers(customerId: string): Promise<string[]> {
    let res = await this.http.get(`/fee/charge-info/${customerId}/batch-number`);
    return res.content;
  }

  /**
   * 获取相关结算申请明细
   */
  async getItems(batchNumber: string, chargeCategory: number): Promise<ChargeItem[]> {
    let res = await this.http.get(`/fee/charge-info/item?batchNumber=${batchNumber}&chargeCategory=${chargeCategory}`);
    return res.content;
  }

  /**
   * 保存需求
   */
  async saveChargeInfo(chargeInfo: ChargeInfo): Promise<void> {
    await this.http.post(`/fee/charge-info`, chargeInfo).then(handleResult);
  }
}
export interface ChargeInfoCriteria {
    keywords?: string;
    beginDate?: string;
    endDate?: string;
}