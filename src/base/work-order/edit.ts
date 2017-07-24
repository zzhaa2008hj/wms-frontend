import { inject, newInstance } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { MessageDialogService } from "ui";
import { WorkOrder, WorkOrderArea } from "@app/instock/models/work";
import { WorkInfo } from "@app/base/models/work-info";
import { WarehouseService } from "@app/base/services/warehouse";
import { Warehouse } from "@app/base/models/warehouse";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";
import { WorkOrderService } from "@app/instock/services/work-order";
import { Router } from "aurelia-router";
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { RouterParams } from '@app/common/models/router-params';
import { CargoFlowService } from '@app/instock/services/cargo-flow';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { WorkOrderItem } from "@app/instock/models/work";
import { WorkAreaService } from "@app/base/services/work";
import { Order } from "@app/outstock/models/order";
import { OrderService, OrderItemService } from "@app/outstock/services/order";
import { CargoRateService } from "@app/base/services/rate"
import { EditWorArea } from "./edit-area"

export class EditWorkOrder {
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;
  cargoFlow = {} as CargoFlow;
  order = {} as Order;

  workOrderAreas = [] as WorkOrderArea[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  workOrderArea = {} as WorkOrderArea;
  workOrderItem = {} as WorkOrderItem;

  selectedVehicle: any;

  data = new kendo.data.ObservableArray([]);
  grid: kendo.ui.Grid;

  editWorArea: EditWorArea;

  itemsDataSources = new Map<string, kendo.data.DataSource>();

  unitSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.dictionaryDataService
          .getDictionaryDatas("unit")
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  containerTypeSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.dictionaryDataService
          .getDictionaryDatas("containerType")
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  datasource: kendo.data.DataSource;

  // cargoItemsSource = new kendo.data.DataSource({
  //   transport: {
  //     read: options => {
  //       this.cargoItemService.getCargoItemsByFlowId(this.cargoFlow.id)
  //         .then(options.success)
  //         .catch(err => options.error("", "", err));
  //     }
  //   }
  // });
  cargoItemsSource: kendo.data.DataSource;

  VehicleSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        let businessId: string;
        if (this.routerParams.type == 1) {
          businessId = this.workOrder.businessId;
        } else if (this.routerParams.type == 2) {
          businessId = this.routerParams.businessId;
        }
        this.instockVehicleService.getInstockVehicles(businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  warehouseSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.warehouseService.getWarehouses(this.workOrder.businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  constructor(@inject('routerParams') private routerParams: RouterParams,
              @inject private cargoFlowService: CargoFlowService,
              @inject private cargoItemService: CargoItemService,
              @inject private instockVehicleService: InstockVehicleService,
              @inject private warehouseService: WarehouseService,
              @inject private organizationService: OrganizationService,
              @inject private workOrderService: WorkOrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private router: Router,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private workAreaService: WorkAreaService,
              @inject private orderItemService: OrderItemService,
              @inject private orderService: OrderService,
              @inject private cargoRateService: CargoRateService) {

    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    if (this.routerParams.type == 1) {
      this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.routerParams.businessId);
      // this.workOrder.workOrderCategory = this.routerParams.type;
      // this.workOrder.batchNumber = this.cargoFlow.batchNumber;
      this.cargoItemsSource = new kendo.data.DataSource({
        transport: {
          read: options => {
            this.cargoItemService.getCargoItemsByFlowId(this.cargoFlow.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        }
      });
    }
    if (this.routerParams.type == 2) {
      this.order = await this.orderService.getOrderById(this.routerParams.businessId);
      // this.workOrder.workOrderCategory = this.routerParams.type;
      // this.workOrder.batchNumber = this.order.batchNumber;
      this.cargoItemsSource = new kendo.data.DataSource({
        transport: {
          read: options => {
            this.orderItemService.getItemsByOrderId(this.order.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        }
      });
    }
    // if (this.routerParams.type == 1) {
    //   this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.routerParams.businessId);
    //   //   this.workOrder.workOrderCategory = this.routerParams.type;
    //   //   this.workOrder.batchNumber = this.cargoFlow.batchNumber;
    // }
    this.workOrder = await this.workOrderService.getWorkOrderById(params.id);
    this.validationController.addObject(this.workOrder, workOrderRules);

  }

  changeCargo() {
    this.VehicleSource.read();
  }

  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {
    let { valid } = await this.validationController.validate();

    let res = await this.editWorArea.verify();

    if (!valid || !res) {
      await this.messageDialogService.alert({ title: "提示", message: "数据不符合规范请检查数据" })
      return;
    }

    let len = this.datasource.data().length;
    for (let i = 0; i < len; i++) {
      let items = this.itemsDataSources.get(this.datasource.data()[i].uid);
      this.datasource.data()[i].WorkOrderItem = items;

      let workOrderArea = {} as WorkOrderArea;
      workOrderArea.id = this.datasource.data()[i].id;
      workOrderArea.warehouseId = this.datasource.data()[i].warehouseId;
      workOrderArea.quantity = this.datasource.data()[i].quantity;
      workOrderArea.number = this.datasource.data()[i].number;
      workOrderArea.unit = this.datasource.data()[i].unit;
      workOrderArea.containerNumber = this.datasource.data()[i].containerNumber;
      workOrderArea.containerType = this.datasource.data()[i].containerType;
      workOrderArea.remark = this.datasource.data()[i].remark;

      let workOrderItems = [] as WorkOrderItem[];
      for (let j = 0; j < items.data().length; j++) {
        let workOrderItem = {} as WorkOrderItem;
        workOrderItem.id = items.data()[j].id;
        workOrderItem.workId = items.data()[j].workId;
        workOrderItem.workNumber = items.data()[j].workNumber;
        workOrderItem.customerId = items.data()[j].customerId;
        workOrderItem.remark = items.data()[j].remark;
        workOrderItems.push(workOrderItem);
      }
      workOrderArea.workOrderItem = workOrderItems;

      this.workOrderAreas.push(workOrderArea);
    }

    try {
      for (let i = 0; i < this.workOrderAreas.length; i++) {
        this.warehouse = await this.warehouseService.getWarehouseById(this.workOrderAreas[i].warehouseId);
        this.workOrderAreas[i].warehouseName = this.warehouse.name;

        for (let j = 0; j < this.workOrderAreas[i].workOrderItem.length; j++) {
          //this.workInfo = await this.workInfoService.getWorkInfo(this.workOrderAreas[i].workOrderItem[j].workId);
          this.workOrderAreas[i].workOrderItem[j].workName = await this.cargoRateService
            .getCargoRateById(this.workOrderAreas[i].workOrderItem[j].workId)
            .then(res => res.workName);

          this.organization = await this.organizationService
            .getOrganization(this.workOrderAreas[i].workOrderItem[j].customerId);
          this.workOrderAreas[i].workOrderItem[j].customerName = this.organization.name;
        }
      }
      await this.workOrderService.updateWorkOrderAndItems({
        warehouseWorkOrder: this.workOrder,
        list: this.workOrderAreas
      });
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功" });
      this.router.navigateToRoute("list");

    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  onSelectPlateNumber(e) {
    let vehicle: InstockVehicle = this.selectedVehicle.dataItem(e.item);
    this.workOrder.plateNumber = vehicle.plateNumber;
    this.workOrder.driverName = vehicle.driverName;
    this.workOrder.driverIdentityNumber = vehicle.driverIdentityNumber;
    this.workOrder.phoneNumber = vehicle.phoneNumber;
  }

  validateWorkOrder(propertyName: string) {
    this.validationController.validate({ object: this.workOrder, propertyName });
  }

  async detailInit() {
  }

  add() {
    this.datasource.add({});
  }


  async remove(e) {
    let confirmed = await this.messageDialogService.confirm({ title: "删除", message: "删除后无法修复" });
    if (confirmed) {
      if (e.id != null && e.id != "") {
        try {
          await this.workAreaService.removeWorkOrderArea(e.id);
          await this.messageDialogService.alert({ title: "", message: "删除成功" });
          this.datasource.remove(e);
          this.itemsDataSources.delete(e.uid);
        } catch (e) {
          await this.messageDialogService.alert({ title: "错误", message: e.message, icon: 'error' });
        }
      } else {
        await this.messageDialogService.alert({ title: "", message: "删除成功" });
        this.datasource.remove(e);
        this.itemsDataSources.delete(e.uid);
      }
    }
  }

  getNewDataSourceByUid(uid: string) {
    return this.itemsDataSources.get(uid);
  }

  // setItemDataSource(uid: string, datasource: kendo.data.DataSource) {
  //   this.itemsDataSources.set(uid, datasource);
  // }

  // getAreaDatasource(){
  //   return this.datasource;
  // }
  getAreaDatasource(datasource) {
    this.datasource = datasource;
    console.log('this.datasource', this.datasource);
    console.log('this.datasource.data()', this.datasource.data());
  }

  getItemsDataSources(itemDatasource) {
    this.itemsDataSources = itemDatasource;
  }


}
const workOrderRules = ValidationRules
  .ensure((workOrder: WorkOrder) => workOrder.businessId)
  .displayName("入库货物")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.workOrderNumber)
  .displayName("作业单号")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.workDate)
  .displayName("作业时间")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.plateNumber)
  .displayName("车牌号")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.driverName)
  .displayName("司机名称")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.driverIdentityNumber)
  .displayName("身份证号")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.phoneNumber)
  .displayName("电话号码")
  .required().withMessage(`\${$displayName}不能为空`)
  .rules;