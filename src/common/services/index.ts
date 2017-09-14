import { autoinject } from 'aurelia-dependency-injection';
import { RestClient } from '@app/utils';
import { BusinessOrder } from '@app/common/models/business-order';
import { FeeOrder } from '@app/common/models/fee-order';
import { WarehouseOrder } from '@app/common/models/warehouse-order';
import { Warehouse } from '@app/base/models/warehouse';

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
}