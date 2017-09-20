import { autoinject } from 'aurelia-dependency-injection';
import { RestClient } from '@app/utils';
import { BusinessOrder } from '@app/common/models/business-order';
import { FeeOrder } from '@app/common/models/fee-order';
import { WarehouseOrder } from '@app/common/models/warehouse-order';
import { Warehouse } from '@app/base/models/warehouse';
import { WarehouseNum } from "@app/report/models/daily-inventory";

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

  async getWareNum(item :string , date : string) : Promise<WarehouseNum>{
    let res = await this.http.get(`/index/warehouse-chart?item=${item}&date=${date}`);
    return res.content ;
  }
}