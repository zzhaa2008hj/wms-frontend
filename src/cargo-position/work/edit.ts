import { inject, newInstance } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { WorkOrder, WorkOrderArea } from "@app/instock/models/work";
import { WorkInfo } from "@app/base/models/work-info";
import { WarehouseService } from "@app/base/services/warehouse";
import { Warehouse } from "@app/base/models/warehouse";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";
import { WorkOrderService } from "@app/instock/services/work-order";
import { Router } from "aurelia-router";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { RouterParams } from '@app/common/models/router-params';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { WorkOrderItem } from "@app/instock/models/work";
import { EditWorArea } from "./edit-area";
import { PositionTransferRateService } from "@app/cargo-position/services/transfer-rate";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";

export class EditWorkOrder {
  workOrder = {} as WorkOrder;

  workOrderAreas = [] as WorkOrderArea[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  workOrderArea = {} as WorkOrderArea;
  workOrderItem = {} as WorkOrderItem;

  editWorArea: EditWorArea;

  disabled: boolean = false;

  itemsDataSources = new Map<string, kendo.data.DataSource>();

  transferItemId: string;

  info: PositionTransferInfo;
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

  cargoItemsSource: kendo.data.DataSource;


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
              @inject private warehouseService: WarehouseService,
              @inject private organizationService: OrganizationService,
              @inject private workOrderService: WorkOrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private router: Router,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private positionTransferRateService: PositionTransferRateService,
              @inject private positionTransferInfoService: PositionTransferInfoService) {

    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    this.transferItemId = params.id;
    this.info = await this.positionTransferInfoService.getByTransferItemId(params.id);
    this.workOrder = await this.workOrderService.getWorkOrderByTransferItemId(params.id);
    if (!this.workOrder) {
      this.workOrder = {
        workOrderNumber: "",
        workDate: new Date(),
        workOrderCategory: 4,
        batchNumber: this.info.batchNumber,
        businessId: params.id
      } as WorkOrder;
    }
    this.validationController.addObject(this.workOrder, transferWorkOrderRules);
    console.log('this.workOrder', this.workOrder);
  }


  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {
    let { valid } = await this.validationController.validate();

    let res = await this.editWorArea.verify();

    if (!valid || !res) {
      await this.messageDialogService.alert({ title: "提示", message: "数据不符合规范请检查数据" });
      return;
    }

    this.disabled = true;
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
          this.workOrderAreas[i].workOrderItem[j].workName = await this.positionTransferRateService
            .getRatesById(this.workOrderAreas[i].workOrderItem[j].workId)
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
      this.workOrderAreas = [] as WorkOrderArea[];
      this.disabled = false;
    }
  }

  validateWorkOrder(propertyName: string) {
    this.validationController.validate({ object: this.workOrder, propertyName });
  }

  async detailInit() {
  }

  add() {
    this.datasource.add({});
  }

  getNewDataSourceByUid(uid: string) {
    return this.itemsDataSources.get(uid);
  }

  getAreaDatasource(datasource) {
    this.datasource = datasource;
  }

  getItemsDataSources(itemDatasource) {
    this.itemsDataSources = itemDatasource;
  }


}
const transferWorkOrderRules = ValidationRules
  .ensure((workOrder: WorkOrder) => workOrder.workOrderNumber)
  .displayName("作业单号")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrder: WorkOrder) => workOrder.workDate)
  .displayName("作业时间")
  .required().withMessage(`\${$displayName}不能为空`)
  .rules;