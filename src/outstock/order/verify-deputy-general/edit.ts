import { inject } from "aurelia-dependency-injection";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import * as moment from 'moment';
import { DialogService} from "ui";
import { AppRouter } from "aurelia-router";
import { ViewRate } from "@app/outstock/order/verify-deputy-general/view";

export class VerifyBusinessDialogEdit {

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
              @inject private appRouter: AppRouter,
              @inject('outstockOrderId') private outstockOrder: Order) {
  }

  async activate() {
    this.order = await this.orderService.getOrderById(this.outstockOrder.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.order.cargoInfoId);
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");

    this.orderItems = this.order.outstockOrderItems;
    this.vehicles = this.order.outstockVehicles;
    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    this.cargoInfo.warehouseTypeStr = this.warehouseTypes
      .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;
  }

  /**
   * 副总审批
   */
  async verifyDeputyGeneral(verifyStatus: number) {
    try {
      await this.orderService.approve(this.order.id, verifyStatus);
      await this.dialogService.alert({ title: "提示", message: "审批成功！" });
      this.appRouter.navigateToRoute('outstockOrder');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async showRate(outstockItemId) {
    let result = await this.dialogService.open({ viewModel: ViewRate, model: {id: outstockItemId}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
  }

}