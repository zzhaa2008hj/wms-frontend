import { DictionaryData } from '../../base/models/dictionary';
import { DictionaryDataService } from '../../base/services/dictionary';
import { autoinject } from "aurelia-dependency-injection";
import { Organization } from '@app/base/models/organization';
import { OrganizationService } from '@app/base/services/organization';
import * as moment from 'moment';
import { Order, OrderItem, Vehicle } from '@app/outstock/models/order';
import { OrderService } from '@app/outstock/services/order';
import { addHeader, print } from "@app/common/services/print-tool";

@autoinject
export class OrderWork {
  vehicles: Vehicle[];
  outstockOrder: Order;
  organization: Organization;
  units = [] as DictionaryData[];
  cargoItems = [] as OrderItem[];

  constructor(private outstockOrderService: OrderService,
              private dictionaryDataService: DictionaryDataService,
              private organizationService: OrganizationService) {
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.outstockOrder = await this.outstockOrderService.viewWorkOrder(params.id);
    this.outstockOrder.outstockDateStr = moment(this.outstockOrder.outstockDate).format("YYYY-MM-DD");
    this.outstockOrder.createTimeStr = moment(this.outstockOrder.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.organization = await this.organizationService.getOrganization(this.outstockOrder.orgId);
    this.cargoItems = this.outstockOrder.outstockOrderItems;
    let index = 1;
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      res.index = index++;
      if (!res.outstockNumber) {
        res.outstockNumber = 0;
      }
      if (!res.outstockQuantity) {
        res.outstockQuantity = 0;
      }
      return res;
    });
    if (this.outstockOrder.stage == 11) {
      this.outstockOrderService.updateStage(params.id, 12);
    }

    this.vehicles = this.outstockOrder.outstockVehicles;
    this.vehicles.forEach(v => Object.assign(v, { index: this.vehicles.indexOf(v) + 1 }));
  }

  async printOrderWork() {
    let title = "出库作业指令单";
    let strHTML = $("#orderWork").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}