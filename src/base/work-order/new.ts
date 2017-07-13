import { inject, newInstance } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { MessageDialogService, DialogService } from "ui";
import { WorkOrder, WorkOrderArea } from "@app/instock/models/work";
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
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { RouterParams } from '@app/common/models/router-params';
import { CargoFlowService } from '@app/instock/services/cargo-flow';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { NewWorkOrderItem } from "@app/base/work-order/new-item";
import { WorkOrderItem } from "@app/instock/models/work";

export class NewWorkOrder {
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;
  cargoFlow = {} as CargoFlow;
  containerTypes = [{ text: "集装箱类型1", value: 1 }, { text: "集装箱类型2", value: 2 }];

  workOrderAreas = [] as WorkOrderArea[];
  workInfo: WorkInfo;
  warehouse: Warehouse;
  organization: Organization;

  workOrderArea: WorkOrderArea;
  workorderItem = {} as WorkOrderItem;

  selectedVehicle: any;

  data = new kendo.data.ObservableArray([]);
  grid: kendo.ui.Grid;

  // worksSource = new kendo.data.DataSource({
  //   transport: {
  //     read: options => {
  //       this.workInfoService
  //         .listWorkInfoesByCargo(this.workOrder.businessId, this.routerParams.type)
  //         .then(options.success)
  //         .catch(err => options.error("", "", err));
  //     }
  //   }
  // });

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

  // customersSource = new kendo.data.DataSource({
  //   transport: {
  //     read: options => {
  //       this.contractService.getCustomers(2)
  //         .then(options.success)
  //         .catch(err => options.error("", "", err));
  //     }
  //   }
  // });

  datasource : kendo.data.DataSource;

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

  constructor( @inject('routerParams') private routerParams: RouterParams,
    @inject private cargoFlowService: CargoFlowService,
    @inject private cargoItemService: CargoItemService,
    @inject private instockVehicleService: InstockVehicleService,
    @inject private workInfoService: WorkInfoService,
    @inject private contractService: ContractService,
    @inject private warehouseService: WarehouseService,
    @inject private organizationService: OrganizationService,
    @inject private workOrderService: WorkOrderService,
    @inject private messageDialogService: MessageDialogService,
    @inject private router: Router,
    @newInstance() private validationController: ValidationController,
    @inject private dictionaryDataService: DictionaryDataService,
    @inject private dialogService: DialogService) {
      this.workorderItem.workNumber = 1 ;
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
          let data = this.datasource.data();
          options.data.models
            .forEach((e, i) => {
              if (!e.sign) data[i].sign = e.sign = this.getSign();
            });
        
          this.workOrderAreas = options.data.models;
          
          console.log(options.data.models);
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
            sign:{
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
    }
    this.validationController.addObject(this.workOrder, workOrderRules);
  }

  changeCargo() {
    this.instockVehicleSource.read();
    //this.worksSource.read();
  }

  async cancel() {
    this.router.navigateToRoute("list");
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      console.log("---");
      console.log(this.workOrderAreas);
      console.log(this.workOrder);
      for (let i = 0; i < this.workOrderAreas.length; i++) {
        this.warehouse = await this.warehouseService.getWarehouseById(this.workOrderAreas[i].warehouseId);
        this.workOrderAreas[i].warehouseName = this.warehouse.name;
      
        for(let j=0; j< this.workOrderAreas[i].workOrderItem.length; j++){
          this.workInfo = await this.workInfoService.getWorkInfo(this.workOrderAreas[i].workOrderItem[j].workId);
          this.workOrderAreas[i].workOrderItem[j].workName = this.workInfo.name;

          this.organization = await this.organizationService.getOrganization(this.workOrderAreas[i].workOrderItem[j].customerId);
          this.workOrderAreas[i].workOrderItem[j].customerName = this.organization.name;
        }
      }
      //this.workOrder.workOrderCategory = this.cargoFlow.status;
      await this.workOrderService.saveWorkOrderAndItems({
        warehouseWorkOrder: this.workOrder,
        list: this.workOrderAreas
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

  validateWorkOrder(propertyName: string) {
    this.validationController.validate({ object: this.workOrder, propertyName });
  }

  updateProp(item, property) {
    alert("22");
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  detailInit(e) { 
    let detailRow = e.detailRow;
    detailRow.find('.workItem').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => { 
              //options.success(this.workorderItem);
              console.log(this.getWorkItems(e.data.sign));
              options.success(this.getWorkItems(e.data.sign));
          },
          update: (options) => {
            alert("update");
            options.success();
          },
          destroy: (options) => {
            alert("destroy")
            options.success();
          },
          create: (options) => {
            alert("create");
            options.success();
          }
        } ,
        schema: {
          model: {
            id: "id",
            fields: {
              workName: { editable: false },
              workNumber: { editable: true, notify: true, type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, title: '作业数量' },
              customerName: { editable: false },
              remark: { editable: false},
            }
          }
        }
      },
      editable: true,
      columns: [
        { field: 'workName', title: '作业内容' },
        { field: 'workNumber', title: '作业数量' },
        { field: 'customerName', title: '作业单位' },
        { field: 'remark', title: '备注' },
        { command: [ { name: "destroy" ,
                       click: (e) =>{
                          alert("11");
                          this.router.navigateBack;
                       }
                      } ]
        }
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
  }


  async addItem(e) {
    let res = await this.dialogService.open({
      viewModel: NewWorkOrderItem,
      model: { batchNumber: "", workAreaId: "", businessId: this.workOrder.businessId ,type: this.routerParams.type },
      lock: true
    }).whenClosed()
    if (res.wasCancelled) return;
    try {
      for( let workOrderArea of this.workOrderAreas) {
        if(e.sign == workOrderArea.sign){
          let index = this.workOrderAreas.indexOf(workOrderArea)
          if(workOrderArea.workOrderItem == null){
            workOrderArea.workOrderItem = [];
            this.datasource.data()[index].workOrderItem = [];
          }
          workOrderArea.workOrderItem.push(res.output);
          this.datasource.data()[index].workOrderItem.push(res.output);
          this.workOrderArea = workOrderArea
          console.log("666");
          console.log(this.workOrderArea);
        }
      }
      let child = this.grid.element.find(`[data-uid='${e.uid}']`).next().find(".k-grid").eq(0);
      if (child.data("kendoGrid")) {
        child.data("kendoGrid").dataSource.read();
      }
    } catch (err) {
      await this.dialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  getSign(){
    return [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).toString();
  }

  getWorkItems(sign: string){
       let data;
       for( let workOrderArea of this.workOrderAreas) {
                if(sign == workOrderArea.sign){
                  if(workOrderArea.workOrderItem == null){
                  workOrderArea.workOrderItem = [];
                  }
                data =  workOrderArea.workOrderItem
                }
       }  
       return data;
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