import { autoinject } from 'aurelia-dependency-injection';
import { RestClient } from '@app/utils';
import { BusinessOrder } from '@app/common/models/business-order';
import { FeeOrder } from '@app/common/models/fee-order';
import { WarehouseOrder } from '@app/common/models/warehouse-order';
import { Warehouse } from '@app/base/models/warehouse';
import { WarehouseNum } from "@app/report/models/daily-inventory";
import { ChargeAmt, PaymentAmt } from "@app/report/models/daily-payment";

@autoinject
export class IndexService {
  constructor(private http: RestClient) {
  }

  async getBusinessOrderNumber(): Promise<BusinessOrder> {
    let res = await this.http.get(`/index/business-number`);
    return res.content;
  }

  async getFeeOrderNumber(): Promise<FeeOrder> {
    let res = await this.http.get(`/index/fee-number`);
    return res.content;
  }

  async getWarehouseOrderNumber(): Promise<WarehouseOrder> {
    let res = await this.http.get(`/index/warehouse-number`);
    return res.content;
  }

  async getTopWarehouses(): Promise<Array<Warehouse>> {
    let res = await this.http.get(`/index/warehouse-list`);
    return res.content;
  }

  /**
   * 获取 仓库信息的数据
   * @param {string} item
   * @param {string} date
   * @returns {Promise<WarehouseNum>}
   */
  async getWareNum(item :string , date : string) : Promise<WarehouseNum>{
    let res = await this.http.get(`/index/warehouse-chart?item=${item}&date=${date}`);
    return res.content ;
  }

  /**
   * 获取 收费数据
   */
  async getCagAmt(date : string) : Promise<ChargeAmt>{
    let res = await this.http.get(`/index/charge-chart?date=${date}`);
    return res.content ;
  }
  /**
   * 获取 付费数据
   */
  async getPayAmt(date : string) : Promise<PaymentAmt>{
    let res = await this.http.get(`/index/pay-chart?date=${date}`);
    return res.content ;
  }
}