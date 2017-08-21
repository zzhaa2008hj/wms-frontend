import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditList, ChargeAuditItem } from "@app/fee/models/charge-audit";
import { RestClient, handleResult, Query } from '@app/utils';
import { ChargeInfo } from '@app/fee/models/charge';
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeAuditListService {
  constructor(private http: RestClient) {
  }

  async getListByChargeInfoId(chargeInfoId: string): Promise<ChargeAuditList[]> {
    let res = await this.http.get(`/fee/charge-audit-list/${chargeInfoId}/chargeInfoId`);
    return res.content;
  }

  /**
   * 查询对账清单 - 分页
   */
  pageChargeAuditList(chargeAuditCriteria?: ChargeAuditCriteria): Query<ChargeAuditList> {
    return this.http.query<ChargeAuditList>(`/fee/charge-audit-list/page`, chargeAuditCriteria)
    .map(info => {
      if (info.paymentDate) {
        info.paymentDate = new Date(info.paymentDate);
      }
      return info;
    });
  }

  /**
   * 根据 对账清单ID 获取 对账清单明细
   */
  async getChargeAuditListAndItems(chargeAuditListId: string): Promise<ChargeAuditList> {
    let res = await this.http.get(`/fee/charge-audit-list/${chargeAuditListId}`);
    return res.content;
  }

  /**
   * 手动生成对账清单
   */
  async saveChargeInfoAndAuditList(chargeInfo: ChargeInfo): Promise<void> {
    await this.http.post(`/fee/charge-audit-list`, chargeInfo).then(handleResult);
  }

  /**
   * 修改手动生成对账清单
   */
  async updateChargeInfoAndAuditList(chargeInfoId: String, chargeInfo: ChargeInfo): Promise<void> {
    await this.http.put(`/fee/charge-audit-list/${chargeInfoId}`, chargeInfo).then(handleResult);
  }

  /**
   * 获取手动生成对账信息
   */
  async getChargeAudit(chargeInfoId: String): Promise<ChargeInfo> {
    let res = await this.http.get(`/fee/charge-audit-list/${chargeInfoId}/chargeAudit`);
    return res.content;
  }
}

@autoinject
export class ChargeAuditItemService {
  constructor(private http: RestClient) {
  }

  async getListByChargeAuditId(chargeAuditId: string): Promise<ChargeAuditItem[]> {
    let res = await this.http.get(`/fee/charge-audit-item/${chargeAuditId}/chargeAuditId`);
    return res.content;
  }
}

export interface ChargeAuditCriteria {
  batchNumber?: string;
  billLadingNumber?: string;
}