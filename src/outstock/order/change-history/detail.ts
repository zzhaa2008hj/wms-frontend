import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import * as moment from 'moment';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";

@autoinject
export class OrderChangeHistoryDetail {

  oldOrder: Order;
  newOrder: Order;
  units = [] as DictionaryData[];
  warehouseTypes = [] as DictionaryData[];
  oldOrderItems: OrderItem[];
  newOrderItems: OrderItem[];
  oldVehicles: Vehicle[];
  newVehicles: Vehicle[];

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(changeHistory: ChangeHistory<Order>) {

    this.oldOrder = changeHistory.oldObj;
    this.newOrder = changeHistory.newObj;

    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");

    this.oldOrder.outstockDateStr = moment(this.oldOrder.outstockDate).format("YYYY-MM-DD");
    this.oldOrderItems = this.oldOrder.outstockOrderItems;
    this.oldVehicles = this.oldOrder.outstockVehicles;

    this.newOrder.outstockDateStr = moment(this.newOrder.outstockDate).format("YYYY-MM-DD");
    this.newOrderItems = this.newOrder.outstockOrderItems;
    this.newVehicles = this.newOrder.outstockVehicles;
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}