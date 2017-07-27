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
import { WorkOrderItem } from "@app/instock/models/work";
import { Order } from "@app/outstock/models/order";
import { OrderService, OrderItemService } from "@app/outstock/services/order";
import { CargoRateService } from "@app/base/services/rate";
import { NewWorArea } from "./new-area";
import { observable } from "aurelia-framework";

export class NewWorkOrder {
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;
  cargoFlow = {} as CargoFlow;
  order = {} as Order;
  newWorkArea: NewWorArea;

  disabled: boolean = false;

  workOrderAreas = [] as WorkOrderArea[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  workOrderArea = {} as WorkOrderArea;
  workOrderItem = {} as WorkOrderItem;


  @observable
  areaDatasource: kendo.data.DataSource;

  selectedVehicle: any;

  data = new kendo.data.ObservableArray([]);
  grid: kendo.ui.Grid;

  itemsDataSources = new Map<string, kendo.data.DataSource>();

  datasource: kendo.data.DataSource;

  cargoItemsSource: kendo.data.DataSource;

  vehicleSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        let businessId: string;
        if (!this.workOrder.businessId) {
          options.success([]);
        } else {
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
              @inject private orderService: OrderService,
              @inject private orderItemService: OrderItemService,
              @inject private cargoRateService: CargoRateService) {
    this.datasource = new kendo.data.DataSource({
        transport: {
          read: (options) => {
            options.success([]);
          },
          update: (options) => {
            options.success();
          }
          ,
          destroy: (options) => {
            options.success();
          }
          ,
          create: async options => {
            this.datasource.data()[0].workOrderItem = [];
            this.workOrderAreas = options.data.models;
            options.success();
          }
        },
        batch: true,
        pageSize: 8,
        schema: {
          model: {
            fields: {
              workItemId: {
                editable: false, nullable: true
              },
              workId: {
                type: 'string',
                validation: { required: true }
              },
              quantity: {
                type: 'number',
                validation: { min: 0, max: 1000000000000000 }
              },
              number: {
                type: 'number',
                validation: { min: 0, max: 1000000000000000 }
              },
              containerType: {
                type: 'string'
              },
              containerNumber: {
                type: 'string'
              },
              sign: {
                type: 'string'
              },
              customerId: {
                type: 'string',
                validation: { required: true }
              },
              remark: {
                type: 'string',
                validation: { required: true }
              }
            }
          }
        }
      }
    );
    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate() {

    if (this.routerParams.type == 1) {
      this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.routerParams.businessId);
      this.workOrder.workOrderCategory = this.routerParams.type;
      this.workOrder.batchNumber = this.cargoFlow.batchNumber;
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
      this.workOrder.workOrderCategory = this.routerParams.type;
      this.workOrder.batchNumber = this.order.batchNumber;
      this.cargoItemsSource = new kendo.data.DataSource({
        transport: {
          read: options => {
            this.orderItemService.getItemsByOrderIdAndType(this.order.id, 0)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        }
      });
    }
    this.validationController.addObject(this.workOrder, workOrderRules);
  }

  changeCargo() {
    this.vehicleSource.read();
  }

  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {
    let { valid } = await this.validationController.validate();
    let res = await this.newWorkArea.verify();
    if (!valid || !res) {
      await this.messageDialogService.alert({ title: "提示", message: "数据不符合规范请检查数据" });
      return;
    }
    this.disabled = true;

    let len = this.areaDatasource.data().length;
    for (let i = 0; i < len; i++) {
      let items = this.itemsDataSources.get(this.areaDatasource.data()[i].uid);
      this.areaDatasource.data()[i].WorkOrderItem = items;

      let workOrderArea = {} as WorkOrderArea;
      workOrderArea.warehouseId = this.areaDatasource.data()[i].warehouseId;
      workOrderArea.quantity = this.areaDatasource.data()[i].quantity;
      workOrderArea.number = this.areaDatasource.data()[i].number;
      workOrderArea.unit = this.areaDatasource.data()[i].unit;
      workOrderArea.containerNumber = this.areaDatasource.data()[i].containerNumber;
      workOrderArea.containerType = this.areaDatasource.data()[i].containerType;
      workOrderArea.remark = this.areaDatasource.data()[i].remark;

      let workOrderItems = [] as WorkOrderItem[];
      for (let j = 0; j < items.data().length; j++) {
        let workOrderItem = {} as WorkOrderItem;
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
          this.workOrderAreas[i].workOrderItem[j].workName = await this.cargoRateService
            .getCargoRateById(this.workOrderAreas[i].workOrderItem[j].workId)
            .then(res => res.workName);

          this.organization = await this.organizationService
            .getOrganization(this.workOrderAreas[i].workOrderItem[j].customerId);
          this.workOrderAreas[i].workOrderItem[j].customerName = this.organization.name;
        }
      }

      await this.workOrderService.saveWorkOrderAndItems({
        warehouseWorkOrder: this.workOrder,
        list: this.workOrderAreas
      });
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功" });
      this.router.navigateToRoute("list");

    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
      this.workOrderAreas = [] as WorkOrderArea[];
      this.disabled = false;
    }
  }

  getAreaDatasource(datasource) {
    this.areaDatasource = datasource;
  }

  getItemsDataSources(itemDatasource) {
    this.itemsDataSources = itemDatasource;
  }


  onSelectPlateNumber(e) {
    let vehicle: InstockVehicle = this.selectedVehicle.dataItem(e.item);
    if (vehicle == null) return;
    this.workOrder.plateNumber = vehicle.plateNumber;
    this.workOrder.driverName = vehicle.driverName;
    this.validateWorkOrder("driverName");
    this.workOrder.driverIdentityNumber = vehicle.driverIdentityNumber;
    this.validateWorkOrder("driverIdentityNumber");
    this.workOrder.phoneNumber = vehicle.phoneNumber;
    this.validateWorkOrder("phoneNumber");
  }

  validateWorkOrder(propertyName: string) {
    this.validationController.validate({ object: this.workOrder, propertyName });
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
  .satisfies(x => {
    if (!x) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName}不能为空`)
  .satisfies(x => {
    if (x) {
      return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/.test(x);
    }
    return true;
  })
  .withMessage(`\${$displayName}不符合规范`)

  .ensure((workOrder: WorkOrder) => workOrder.driverName)
  .displayName("司机名称")
  .satisfies(x => {
    if (!x) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName}不能为空`)
  .satisfies(x => {
    if (x) {
      return /[\u4E00-\u9FA5]{2,4}/.test(x);
    }
    return true;
  })
  .withMessage(`\${$displayName}不符合规范`)

  .ensure((workOrder: WorkOrder) => workOrder.driverIdentityNumber)
  .displayName("身份证号")
  .satisfies(x => {
    if (!x) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName}不能为空`)
  .satisfies(x => {
    if (x) {
      return /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/.test(x);
    }
    return true;
  })
  .withMessage(`\${$displayName}不符合规范`)

  .ensure((workOrder: WorkOrder) => workOrder.phoneNumber)
  .displayName("电话号码")
  .satisfies(x => {
    if (!x) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName}不能为空`)
  .satisfies(x => {
    if (x) {
      return /(^1[3|4|5|7|8][0-9]{9}$)|(([0-9]{3,4}-)?[0-9]{7,8})/.test(x);
    }
    return true;
  })
  .withMessage(`\${$displayName}不符合规范`)
  .rules;