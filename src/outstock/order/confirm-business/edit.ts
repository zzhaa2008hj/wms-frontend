import { inject } from "aurelia-dependency-injection";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import * as moment from 'moment';
import { DialogService} from "ui";
import { Router } from "aurelia-router";

export class VerifyBusinessDialogEdit {
  disabled: boolean = false;
  cargoInfo: CargoInfo;
  orderItems = [] as OrderItem[];
  vehicles = [] as Vehicle[];

  warehouseTypes = [] as DictionaryData[];
  verifyStatus: number;
  order: Order;

  constructor(@inject private orderService: OrderService,
              @inject private cargoInfoService: CargoInfoService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject('outstockOrderId') private outstockOrder: Order) {
  }

  async activate() {
    this.order = await this.orderService.getItemsAndWorkOrders(this.outstockOrder.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.order.cargoInfoId);
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.orderItems = this.order.outstockOrderItems.map(res => {
      let dict = units.find(r => r.dictDataCode == res.unit);
      if (dict) {
        res.unitStr = dict.dictDataName;
      }
      return res;
    });
    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    this.cargoInfo.warehouseTypeStr = this.warehouseTypes
      .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;
  }

  /**
   * 商务确认
   */
  async businessConfirm() {
    try {
      await this.orderService.businessConfirm(this.outstockOrder.id);
      await this.dialogService.alert({ title: "提示", message: "确认成功！" });
      this.router.navigateToRoute('outstockOrder');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}