import { inject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { MessageDialogService } from "ui";
import { WorkOrder, WorkOrderItem } from "@app/instock/models/work";
import { WorkInfoService } from "@app/base/services/work-info";
import { WorkInfo } from "@app/base/models/work-info";
import { WarehouseService } from "@app/base/services/warehouse";
import { Warehouse } from "@app/base/models/warehouse";
import { ContractService } from "@app/base/services/contract";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";
import { WorkOrderService } from "@app/instock/services/work-order";
import { Router } from "aurelia-router";
import { InstockVehicle } from "@app/instock/models/instock-vehicle";

export class NewWorkOrder {
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;
  units = [{ text: "单位1", value: 1 }, { text: "单位2", value: 2 }];
  containerTypes = [{ text: "集装箱类型1", value: 1 }, { text: "集装箱类型2", value: 2 }];

  workOrderItems = [] as WorkOrderItem[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  selectedVehicle: any;

  worksSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.workInfoService.listWorkInfoesByCargo(this.workOrder.businessId)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  customersSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.contractService.getCustomers(2)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  datasource;


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

  constructor(@inject('cargoFlow') private cargoFlow: CargoFlow,
              @inject private cargoItemService: CargoItemService,
              @inject private instockVehicleService: InstockVehicleService,
              @inject private workInfoService: WorkInfoService,
              @inject private contractService: ContractService,
              @inject private warehouseService: WarehouseService,
              @inject private organizationService: OrganizationService,
              @inject private workOrderService: WorkOrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private router: Router) {
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
            this.workOrderItems = options.data.models;
            options.success();
          }
        },
        batch: true,
        pageSize: 8,
        schema: {
          model: {
            id: 'workItemId',
            fields: {
              workItemId: {
                editable: false, nullable: true
              },
              workId: {
                type: 'string'
              },
              quantity: {
                type: 'number'
              },
              number: {
                type: 'number'
              },
              containerType: {
                type: 'string'
              },
              containerNumber: {
                type: 'string'
              },
              customerId: {
                type: 'string'
              },
              remark: {
                type: 'string'
              }
            }
          }
        }
      }
    )
    ;
  }

  activate() {
    this.workOrder.batchNumber = this.cargoFlow.batchNumber;
    this.workOrder.workOrderCategory = this.cargoFlow.status;
  }

  changeCargo() {
    this.instockVehicleSource.read();
    this.worksSource.read();
  }

  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {
    try {
      for (let i = 0; i < this.workOrderItems.length; i++) {
        this.workInfo = await this.workInfoService.getWorkInfo(this.workOrderItems[i].workId);
        this.workOrderItems[i].workName = this.workInfo.name;
        this.warehouse = await this.warehouseService.getWarehouseById(this.workOrderItems[i].warehouseId);
        this.workOrderItems[i].warehouseName = this.warehouse.name;
        this.organization = await this.organizationService.getOrganization(this.workOrderItems[i].customerId);
        this.workOrderItems[i].customerName = this.organization.name;
      }
      this.workOrder.workOrderCategory = this.cargoFlow.status;
      await this.workOrderService.saveWorkOrderAndItems({
        warehouseWorkOrder: this.workOrder,
        list: this.workOrderItems
      });
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功" });
      this.router.navigateToRoute("list");

    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  onSelectPlateNumber(e) {
    let vehicle: InstockVehicle = this.selectedVehicle.dataItem(e.item);
    this.workOrder.plateNumber = vehicle.plateNumber;
    this.workOrder.driverName = vehicle.driverName;
    this.workOrder.driverIdentityNumber = vehicle.driverIdentityNumber;
    this.workOrder.phoneNumber = vehicle.phoneNumber;
  }
}