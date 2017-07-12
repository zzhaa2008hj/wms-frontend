import { Router } from "aurelia-router";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { CodeService } from '@app/common/services/code';
import { Order, OrderItem } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";

/**
 * Created by Hui on 2017/6/23.
 */
export class NewOrder {
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

  constructor(@inject private router: Router,
              @inject private orderService: OrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private codeService: CodeService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.baseCargoInfo = await this.orderService.listBaseCargoInfosByInstock();
  }

  async onSelectCargoInfo(e) {
    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    let res = await this.codeService.generateCode("3", dataItem.batchNumber);
    this.order.outstockOrderNumber = res.content;
    this.setOrderInfo(dataItem);
    this.getBaseCargoItems();
  }

  setOrderInfo(dataItem: CargoInfo) {
    this.order.agentId = dataItem.agentId;
    this.order.agentName = dataItem.agentName;
    this.order.customerId = dataItem.customerId;
    this.order.customerName = dataItem.customerName;
    this.order.batchNumber = dataItem.batchNumber;
    this.order.unit = dataItem.unit;
    this.order.cargoInfoId = dataItem.id;
    this.order.id = null;
    this.order.lastBatch = 0;
  }

  async getBaseCargoItems() {
    this.baseCargoItems = await this.orderService.listBaseCargoItems(this.order.cargoInfoId);
    this.outstockCargoItems.data(this.baseCargoItems);
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
      if (e.uuid == ooi.uuid) {
        let index = this.outstockOrderItems.indexOf(ooi);
        this.outstockOrderItems.splice(index, 1);
      }
    });
    this.deletedBaseCargoItems.forEach(dbci => {
      if (e.uuid == dbci.id) {
        let index = this.deletedBaseCargoItems.indexOf(dbci);
        this.deletedBaseCargoItems.splice(index, 1);
        this.baseCargoItems.splice(0, 0, dbci);
      }
    });
    this.orderItems.read();
    this.outstockCargoItems.data(this.baseCargoItems);
  }

  async addNewOrder() {
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
      await this.orderService.saveOrder(this.order);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
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