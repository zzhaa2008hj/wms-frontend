import { autoinject } from "aurelia-dependency-injection";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import * as moment from 'moment';
import { addHeader, print } from "@app/common/services/print-tool";
import { NewUpload } from "@app/fee/charge/upload";
import { DialogService } from "ui";
import { Router } from "aurelia-router";

/**
 * Created by Hui on 2017/7/13.
 */
@autoinject
export class Detail {
  disabled = false;
  cargoInfo: CargoInfo;
  order = {} as Order;
  orderItems = [] as OrderItem[];
  vehicles = [] as Vehicle[];

  warehouseTypes = [] as DictionaryData[];
  units = [] as DictionaryData[];

  constructor(private orderService: OrderService,
              private cargoInfoService: CargoInfoService,
              private dialogService: DialogService,
              private router: Router,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(params) {
    this.order = await this.orderService.getOrderById(params.id);

    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.order.cargoInfoId);
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.orderItems = this.order.outstockOrderItems;
    this.vehicles = this.order.outstockVehicles;

    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    this.cargoInfo.warehouseTypeStr = this.warehouseTypes
      .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;
    this.cargoInfo.cargoTypeStr = this.order.cargoType == 1 ? "内贸" : "保税";
    this.orderItems.forEach(oi => {
      oi.unitStr = this.units.find(res => res.dictDataCode == oi.unit).dictDataName;
      Object.assign(oi, { index: this.orderItems.indexOf(oi) + 1 });
    });
    this.vehicles.forEach(v => Object.assign(v, { index: this.vehicles.indexOf(v) + 1 }));
  }

  async customerConfirm() {
    this.disabled = true;
    try {
      //上传客户确认信息
      let result = await this.dialogService.open({ viewModel: NewUpload, model: this.order.id, lock: true })
        .whenClosed();
      if (result.wasCancelled) return;
      await this.orderService.customerConfirm(this.order.id, result.output);
      await this.dialogService.alert({ title: "提示", message: "操作成功！" });
      this.router.navigateToRoute('list');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  // 打印出库指令
  async printConfirm() {
    let title = "出库指令";
    let strHTML = $("#confirm").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
    //await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }
}

