import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";
import { observable } from 'aurelia-framework';
import { Order, OrderItem } from "@app/outstock/models/order";
import { CargoInfo } from "@app/base/models/cargo-info";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";

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

  orderItems = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.outstockOrderItems);
      }
    },
    schema: {
      model: {
        fields: {
          cargoName: { editable: false, nullable: true },
          cargoCategoryName: { editable: false, nullable: true },
          unitStr: { editable: false, nullable: true },
          orderQuantity: { type: 'number', validation: { required: true, min: 0 } },
          orderNumber: { type: 'number', validation: { required: true, min: 0 } }
        }
      }
    }
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
      this.orderItems.read();
    }
    this.vehicles.data(this.order.outstockVehicles);
  }

  async editOrder() {
    this.validationController.addObject(this.order, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    let vehicles = [];
    Object.assign(vehicles, this.vehicles.data());
    let orderItems = [];
    Object.assign(orderItems, this.orderItems.data());
    if (vehicles) {
      Object.assign(this.order, { outstockVehicles: vehicles });
    }
    if (orderItems) {
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
    if (this.order.outstockOrderItems.length == 0) {
      return this.messageDialogService.alert({ title: "新增失败", message: "请填写出库货物信息", icon: 'error' });
    }
    if (this.order.outstockVehicles.length == 0) {
      return this.messageDialogService.alert({ title: "新增失败", message: "请填写出库车辆信息", icon: 'error' });
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

const validationRules = ValidationRules
  .ensure((order: Order) => order.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.paymentUnit)
  .displayName('付款单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.takeDeliveryNum)
  .displayName('提货单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][358][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((order: Order) => order.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;