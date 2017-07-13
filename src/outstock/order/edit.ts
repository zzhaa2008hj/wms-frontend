import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { Order, OrderItem } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditOrder {
  order = {} as Order;
  outstockOrderItems = [];
  outstockCargoItems = new kendo.data.HierarchicalDataSource({
    data: []
  });

  baseCargoInfo: Array<CargoInfo>;
  baseCargoItems = [] as CargoItem[];
  deletedBaseCargoItems = [] as CargoItem[];
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
          warehouseName: { validation: { required: true } },
          unit: { validation: { required: true } },
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
  private dropDownListCargoItem: any;

  constructor(private router: Router,
              private orderService: OrderService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.order = await this.orderService.getOrderById(params.id);
    this.baseCargoItems = await this.orderService.listBaseCargoItems(this.order.cargoInfoId);
    this.outstockOrderItems = this.order.outstockOrderItems;
    this.outstockOrderItems.forEach(ooi => {
      let bci = this.baseCargoItems.filter(bci => bci.id == ooi.cargoItemId);
      let index = this.baseCargoItems.indexOf(bci[0]);
      this.baseCargoItems.splice(index, 1);
      this.deletedBaseCargoItems.splice(0, 0, bci[0]);
    });

    this.outstockCargoItems.data(this.baseCargoItems);
    this.orderItems.read();
    this.vehicles.data(this.order.outstockVehicles);
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    let outstockOrderItem = {} as OrderItem;
    outstockOrderItem.batchNumber = dataItem.batchNumber;
    outstockOrderItem.cargoItemId = dataItem.id;
    outstockOrderItem.cargoName = dataItem.cargoName;
    outstockOrderItem.cargoCategoryName = dataItem.cargoCategoryName;
    outstockOrderItem.cargoSubCategoryName = dataItem.cargoSubCatergoryName;
    outstockOrderItem.unit = dataItem.unit;
    outstockOrderItem.outstockOrderNumber = this.order.outstockOrderNumber;
    Object.assign(outstockOrderItem, { uuid: dataItem.id });
    this.outstockOrderItems.push(outstockOrderItem);

    this.baseCargoItems.forEach(bci => {
      if (dataItem.id == bci.id) {
        let index = this.baseCargoItems.indexOf(bci);
        this.baseCargoItems.splice(index, 1);
        this.deletedBaseCargoItems.splice(0, 0, bci);
      }
    });
    console.log(this.baseCargoItems);
    this.orderItems.read();
    this.outstockCargoItems.data(this.baseCargoItems);
  }

  deleteOrderItem(e) {
    console.log(e);
    this.outstockOrderItems.forEach(ooi => {
      if (e.id == ooi.id) {
        let index = this.outstockOrderItems.indexOf(ooi);
        this.outstockOrderItems.splice(index, 1);
      }
    });
    this.deletedBaseCargoItems.forEach(dbci => {
      if (e.cargoItemId == dbci.id) {
        let index = this.deletedBaseCargoItems.indexOf(dbci);
        this.deletedBaseCargoItems.splice(index, 1);
        this.baseCargoItems.splice(0, 0, dbci);
      }
    });
    this.orderItems.read();
    this.outstockCargoItems.data(this.baseCargoItems);
  }

  async editOrder() {
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

    this.validationController.addObject(this.order, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    try {
      await this.orderService.updateOrder(this.order);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
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

  .ensure((order: Order) => order.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][358][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((order: Order) => order.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;