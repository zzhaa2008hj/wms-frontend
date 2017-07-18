import { inject, newInstance } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { MessageDialogService } from "ui";
import { WorkOrder, WorkOrderArea } from "@app/instock/models/work";
import { WorkInfoService } from "@app/base/services/work-info";
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
import { WorkOrderItemService } from "@app/instock/services/work-order";

export class EditWorkOrder {
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;
  cargoFlow = {} as CargoFlow;

  workOrderAreas = [] as WorkOrderArea[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  workOrderArea = {} as WorkOrderArea;
  workOrderItem = {} as WorkOrderItem;

  selectedVehicle: any;

  data = new kendo.data.ObservableArray([]);
  grid: kendo.ui.Grid;

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

  cargoItemsSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.cargoItemService.getCargoItemsByFlowId(this.cargoFlow.id)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  instockVehicleSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.instockVehicleService.getInstockVehicles(this.workOrder.businessId)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  warehouseSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.warehouseService.listWarehouse()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  constructor(@inject('routerParams') private routerParams: RouterParams,
              @inject private cargoFlowService: CargoFlowService,
              @inject private cargoItemService: CargoItemService,
              @inject private instockVehicleService: InstockVehicleService,
              @inject private workInfoService: WorkInfoService,
              @inject private warehouseService: WarehouseService,
              @inject private organizationService: OrganizationService,
              @inject private workOrderService: WorkOrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private router: Router,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private workAreaService: WorkAreaService,
              @inject private workOrderItemService: WorkOrderItemService) {

    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    if (this.routerParams.type == 1) {
      this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.routerParams.businessId);
      //   this.workOrder.workOrderCategory = this.routerParams.type;
      //   this.workOrder.batchNumber = this.cargoFlow.batchNumber;
    }
    this.workOrder = await this.workOrderService.getWorkOrderById(params.id);
    this.validationController.addObject(this.workOrder, workOrderRules);

    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.workAreaService.getByWorkOrderId(this.workOrder.id)
            .then(options.success)
            .catch(err => options.error("", "", err));
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
    });

    this.datasource.bind("change", (e) => {
      for (let i = 0; i < e.items.length; i++) {
        let itemDatasource = new kendo.data.DataSource({
          transport: {
            read: options => {
              this.workOrderItemService.getWorkOrderItems(e.items[i].id)
                .then(options.success)
                .catch(err => options.error("", "", err));
            }
          },
          schema: {
            model: {
              fields: {
                workName: { editable: false },
                workNumber: {
                  editable: false,
                  notify: true,
                  type: 'number',
                  validation: { required: true, min: 0, max: 1000000000000000 },
                  title: '作业数量'
                },
                customerName: { editable: false },
                remark: { editable: false },
              }
            }
          }
        });

        this.itemsDataSources.set(e.items[i].uid, itemDatasource);
      }

      if (e.action == "remove") {
        console.log("1111");
        this.datasource.remove(e.items);
        this.itemsDataSources.delete(e.items.uid);
      }

      if (e.action == "add") {
        let itemDataSource = new kendo.data.DataSource({
          schema: {
            model: {
              fields: {
                workName: { editable: false },
                workNumber: {
                  editable: false,
                  notify: true,
                  type: 'number',
                  validation: { required: true, min: 0, max: 1000000000000000 },
                  title: '作业数量'
                },
                customerName: { editable: false },
                remark: { editable: false },
              }
            }
          }
        });

        this.itemsDataSources.set(e.items.uid, itemDataSource);

      }

      console.log('datasource type', this.datasource.data(), e.items, e.action);

    });


  }

  changeCargo() {
    this.instockVehicleSource.read();
  }

  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {

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

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      for (let i = 0; i < this.workOrderAreas.length; i++) {
        this.warehouse = await this.warehouseService.getWarehouseById(this.workOrderAreas[i].warehouseId);
        this.workOrderAreas[i].warehouseName = this.warehouse.name;

        for (let j = 0; j < this.workOrderAreas[i].workOrderItem.length; j++) {
          this.workInfo = await this.workInfoService.getWorkInfo(this.workOrderAreas[i].workOrderItem[j].workId);
          this.workOrderAreas[i].workOrderItem[j].workName = this.workInfo.name;

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