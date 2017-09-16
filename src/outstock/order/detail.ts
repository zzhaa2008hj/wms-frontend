import { autoinject } from "aurelia-dependency-injection";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import * as moment from 'moment';

/**
 * Created by Hui on 2017/7/13.
 */
@autoinject
export class Detail {
  cargoInfo: CargoInfo;
  order = {} as Order;
  orderItems = [] as OrderItem[];
  vehicles = [] as Vehicle[];

  //warehouseTypes = [] as DictionaryData[];
  units = [] as DictionaryData[];

  constructor(private orderService: OrderService,
              private cargoInfoService: CargoInfoService,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(params) {
    this.order = await this.orderService.getOrderById(params.id);
    if (this.order.stage > 7) {
      //已生成出库单后,显示出库信息
      this.order = await  this.orderService.getOrderByIdAndType(params.id, 1);
    }
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.order.cargoInfoId);
    //this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.orderItems = this.order.outstockOrderItems;
    this.vehicles = this.order.outstockVehicles;
    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    // this.cargoInfo.warehouseTypeStr = this.warehouseTypes
    //   .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;
    this.orderItems.forEach(oi => oi.unitStr = this.units.find(res => res.dictDataCode == oi.unit).dictDataName);
  }


}

