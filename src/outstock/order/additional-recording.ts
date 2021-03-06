import { Router } from "aurelia-router";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { CodeService } from '@app/common/services/code';
import { Order, OrderItem, orderValidationRules, vehicleValidationRules } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService } from "ui";
import { CargoInfoService } from '@app/base/services/cargo-info';
import { observable } from 'aurelia-framework';
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { copy } from "@app/utils";
import { OrganizationService } from "@app/base/services/organization";
import { RouterParams } from '@app/common/models/router-params';

export class OutstockOrderAdditionalRecording {
  @observable disabled: boolean = false;
  units = [] as DictionaryData[];
  order = {} as Order;
  outstockOrderItems = [] as OrderItem[];
  outstockCargoItems = new kendo.data.HierarchicalDataSource({
    data: []
  });
  @observable
  hasInfoId: boolean = false;

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
  vehicles = new kendo.data.DataSource();

  outstockOrderDatePicker: kendo.ui.DatePicker;
  maxDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  validationController: ValidationController;
  private dropDownListCargoItem: any;

  constructor( @inject private router: Router,
    @inject private orderService: OrderService,
    @inject private messageDialogService: MessageDialogService,
    @inject private cargoInfoService: CargoInfoService,
    @inject private codeService: CodeService,
    @inject private organizationService: OrganizationService,
    @inject private dictionaryDataService: DictionaryDataService,
    @inject validationControllerFactory: ValidationControllerFactory,
    @inject('routerParams') private routerParams: RouterParams,
    @inject container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.order, orderValidationRules);

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.baseCargoInfo = await this.cargoInfoService.listBaseCargoInfos({ instockStatus: -3, outstockStatus: 0 });
    this.baseCargoInfo.map(res => {
      res.batchNumberStr = res.batchNumber + "(" + res.customerName + ")";
    });

    if (this.routerParams.infoId) {
      this.hasInfoId = true;
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      this.order.cargoInfoId = this.routerParams.infoId;
      this.order.batchNumber = cargoInfo.batchNumber;

      this.setOrderInfo(cargoInfo);
      this.getBaseCargoItems();
    }
  }

  async onSelectCargoInfo(e) {
    this.outstockOrderDatePicker.value("");
    if (this.order) {
      this.validationController.removeObject(this.order);
    }
    this.order = {} as Order;
    this.outstockOrderItems = [] as OrderItem[];
    this.vehicles.data([]);
    this.orderItems.data([]);
    this.outstockCargoItems.data([]);
    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    if (dataItem.id) {
      this.setOrderInfo(dataItem);
      this.getBaseCargoItems();
    }
    this.validationController.addObject(this.order, orderValidationRules);
    if (this.order.batchNumber) {
      this.outstockOrderDatePicker.enable(true);
    } else {
      this.outstockOrderDatePicker.enable(false);
    }
  }

  /**
   * 根据出库单时间生成出库单号
   */
  async createOutstockOrderNumber() {
    if (this.order.batchNumber) {
      if (this.outstockOrderDatePicker.value()) {
        let res = await this.codeService.generateCodeByDate("3", this.outstockOrderDatePicker.value().getTime(), this.order.batchNumber);
        this.order.outstockOrderNumber = res.content;
      }
    } else {
      await this.messageDialogService.alert({ title: "错误", message: '没有批次号，无法生成出库单号！', icon: 'warning' });
      this.outstockOrderDatePicker.value("");
      return;
    }
  }

  async setOrderInfo(dataItem: CargoInfo) {
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

    let customer = await this.organizationService.getOrganization(dataItem.customerId);
    if (customer) {
      this.order.paymentUnit = customer.name;
      this.order.contactPerson = customer.contactPerson;
      this.order.contactNumber = customer.contactMobile;
    }
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
    this.validationController.addObject(this.order, orderValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    let orderItems = [] as OrderItem[];
    Object.assign(orderItems, this.orderItems.data());
    if (orderItems) {
      let bcis = [] as CargoItem[];
      this.baseCargoItems.forEach(bci => {
        bcis.push(copy(bci));
      });
      for (let oi of orderItems) {
        let ci: CargoItem = bcis.find(bci => bci.id == oi.cargoItemId);
        if (ci.canQuantity) {
          ci.canQuantity -= oi.orderQuantity;
          if (ci.canQuantity < 0) {
            return this.messageDialogService.alert({
              title: "补录失败",
              message: `货物:${ci.cargoName}    累计出库数量超出可出库数量,请检查后重新提交`,
              icon: 'error'
            });
          }
        } else {
          ci.canNumber -= oi.orderNumber;
          if (ci.canNumber < 0) {
            return this.messageDialogService.alert({
              title: "补录失败",
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
    if (this.order.outstockOrderItems.length == 0) {
      return this.messageDialogService.alert({ title: "补录失败", message: "请填写出库货物信息", icon: 'error' });
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
    if (this.order.outstockVehicles.length == 0) {
      return this.messageDialogService.alert({ title: "补录失败", message: "请填写出库车辆信息", icon: 'error' });
    }

    this.disabled = true;
    try {
      await this.orderService.saveOrder(this.order);
      await this.messageDialogService.alert({ title: "补录成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "补录失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

