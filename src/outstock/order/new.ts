import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { CodeService } from '@app/common/services/code';
import { Order, OrderItem } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";
import { CargoInfoService } from '@app/base/services/cargo-info';
import { observable } from 'aurelia-framework';
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewOrder {
  @observable disabled: boolean = false;
  units = [] as DictionaryData[];
  order = {} as Order;
  outstockOrderItems = [] as OrderItem[];
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
              private cargoInfoService: CargoInfoService,
              private codeService: CodeService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.baseCargoInfo = await this.cargoInfoService.listBaseCargoInfos({ instockStatus: 1 });
  }

  async onSelectCargoInfo(e) {

    this.order = {} as Order;
    this.outstockOrderItems = [] as OrderItem[];
    this.vehicles.data([]);
    this.orderItems.data([]);
    this.outstockCargoItems.data([]);

    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    if (dataItem.id) {
      let res = await this.codeService.generateCode("3", dataItem.batchNumber);
      this.order.outstockOrderNumber = res.content;
      this.setOrderInfo(dataItem);
      this.getBaseCargoItems();
    }
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
    this.order.paymentUnit = dataItem.customerName;
  }

  async getBaseCargoItems() {
    this.baseCargoItems = await this.orderService.listBaseCargoItems(this.order.cargoInfoId);
    //可出库数量和件数
    let canDeliveries = await this.orderService.getValidOutstockNum(this.order.cargoInfoId);
    this.baseCargoItems.forEach(bci => {
      let canDelivery = canDeliveries.find(cd => cd.cargoItemId == bci.id);
      bci.canQuantity = canDelivery.quantity;
      bci.canNumber = canDelivery.number;
    });
    this.outstockCargoItems.data(this.baseCargoItems);
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    if (dataItem.id) {
      Object.assign(dataItem, { sign: dataItem.uid });
      dataItem.cargoItemId = dataItem.id;
      dataItem.id = null;
      dataItem.orderQuantity = null;
      dataItem.orderNumber = null;
      dataItem.outstockOrderNumber = this.order.outstockOrderNumber;
      dataItem.unitStr = this.units.find(r => r.dictDataCode == dataItem.unit).dictDataName;
      this.outstockOrderItems.splice(0, 0, dataItem);
      this.orderItems.read();
      this.outstockCargoItems.data(this.baseCargoItems);
    }
  }

  deleteOrderItem(e) {
    this.outstockOrderItems.forEach(ooi => {
      if (e.sign == ooi.sign) {
        let index = this.outstockOrderItems.indexOf(ooi);
        this.outstockOrderItems.splice(index, 1);
      }
    });
    this.orderItems.data(this.outstockOrderItems);
  }

  async addNewOrder() {
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
      await this.orderService.saveOrder(this.order);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
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

  .ensure((order: Order) => order.batchNumber)
  .required().withMessage(`请选择批次`)

  .ensure((order: Order) => order.paymentUnit)
  .displayName('付款单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][358][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((order: Order) => order.takeDeliveryNum)
  .displayName('提货单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((order: Order) => order.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;