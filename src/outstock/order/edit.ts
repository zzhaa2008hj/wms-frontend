import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";
import { observable } from 'aurelia-framework';
import { Order, OrderItem, orderValidationRules, vehicleValidationRules } from "@app/outstock/models/order";
import { CargoInfo } from "@app/base/models/cargo-info";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { copy } from "@app/utils";

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditOrder {
  @observable disabled: boolean = false;
  units = [] as DictionaryData[];
  order = {} as Order;
  outstockOrderItems = [] as OrderItem[];

  baseCargoInfo: Array<CargoInfo>;
  selectedCargoInfo: any;

  orderItems = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = new kendo.data.DataSource({
    schema: {
      model: {
        fields: {
          plateNumber: { validation: { required: true } },
          driverName: { validation: { required: true } },
          driverIdentityNumber: { validation: { required: true } },
          phoneNumber: { validation: { required: true } }
        }
      }
    }
  });

  validationController: ValidationController;

  constructor(private router: Router,
              private orderService: OrderService,
              private dictionaryDataService: DictionaryDataService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.order = await this.orderService.getOrderById(params.id);
    let canDeliveries = await this.orderService.getValidOutstockNum(this.order.cargoInfoId);
    if (this.order.outstockOrderItems) {
      this.outstockOrderItems = this.order.outstockOrderItems;
      this.outstockOrderItems.forEach(ooi => {
        ooi.unitStr = this.units.find(r => r.dictDataCode == ooi.unit).dictDataName;
        let canDelivery = canDeliveries.find(cd => cd.cargoItemId == ooi.cargoItemId);
        ooi.canQuantity = canDelivery.quantity + ooi.orderQuantity;
        ooi.canNumber = canDelivery.number + ooi.orderNumber;
      });
      this.orderItems.data(this.outstockOrderItems);
    }
    this.vehicles.data(this.order.outstockVehicles);
  }

  async editOrder() {
    this.validationController.addObject(this.order, orderValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    let orderItems = [];
    Object.assign(orderItems, this.orderItems.data());
    if (orderItems) {
      let oois = [] as OrderItem[];
      this.outstockOrderItems.forEach(ooi => {
        oois.push(copy(ooi));
      });
      for (let oi of orderItems) {
        let ci: OrderItem = oois.find(ooi => ooi.id == oi.id);
        if (ci.canQuantity) {
          ci.canQuantity -= oi.orderQuantity;
          if (ci.canQuantity < 0) {
            return this.messageDialogService.alert({
              title: "新增失败",
              message: `货物:${ci.cargoName}    累计出库数量超出可出库数量,请检查后重新提交`,
              icon: 'error'
            });
          }
        } else {
          ci.canNumber -= oi.orderNumber;
          if (ci.canNumber < 0) {
            return this.messageDialogService.alert({
              title: "新增失败",
              message: `货物:${ci.cargoName}    累计出库件数超出可出库件数,请检查后重新提交`,
              icon: 'error'
            });
          }
        }
      }

      let quantitySum = 0;
      let numberSum = 0;
      orderItems.forEach(ci => {
        quantitySum += ci.orderQuantity;
        numberSum += ci.orderNumber;
      });
      this.order.quantitySum = quantitySum;
      this.order.numberSum = numberSum;
      Object.assign(this.order, { outstockOrderItems: orderItems });
    }

    if (this.order.outstockVehicles.length == 0) {
      return this.messageDialogService.alert({ title: "新增失败", message: "请填写出库车辆信息", icon: 'error' });
    }
    let vehicles = [];
    Object.assign(vehicles, this.vehicles.data());
    if (vehicles) {
      for (let v of vehicles) {
        this.validationController.addObject(v, vehicleValidationRules);
        let { valid } = await this.validationController.validate();
        if (!valid) return;
      }
      Object.assign(this.order, { outstockVehicles: vehicles });
    }

    this.disabled = true;
    try {
      await this.orderService.updateOrder(this.order);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}
