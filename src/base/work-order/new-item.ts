import { autoinject, Container } from "aurelia-dependency-injection";
import { WorkOrderItem } from "@app/instock/models/work";
import { WorkInfoService } from "@app/base/services/work-info";
import { DialogController } from "ui";
import { ContractService } from "@app/base/services/contract";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class NewWorkOrderItem {
  private static id = 1;
  selectedCustomer: any;
  selectedWork: any;

  instockCargoItemId: string;
  type: number;

  validationController: ValidationController;

  workOrderItem = {} as WorkOrderItem;

  customersSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.contractService.getCustomers(2)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  worksSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.workInfoService.listWorkInfoesByCargo(this.instockCargoItemId, this.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  constructor(private contractService: ContractService,
              private workInfoService: WorkInfoService,
              private dialogController: DialogController,
              private validationControllerFactory: ValidationControllerFactory,
              private container: Container) {
                this.validationController = this.validationControllerFactory.create();
                this.validationController.addRenderer(formValidationRenderer);
                this.container.registerInstance(ValidationController, this.validationController);

  }

  activate(model) {
    this.workOrderItem.batchNumber = model.batchNumber;
    if(this.workOrderItem.workAreaId !=null&&this.workOrderItem.workAreaId != ""){
      this.workOrderItem.workAreaId = model.workAreaId;
    }
    this.instockCargoItemId = model.businessId;
    this.type = model.type;
    this.validationController.addObject(this.workOrderItem, validationRules);
    
  }
  workInfoChanged(){
    this.workOrderItem.workId = this.selectedWork.value();
    this.workOrderItem.workName = this.selectedWork.text();
  }

  customerChanged(){
    this.workOrderItem.customerId = this.selectedCustomer.value();
    this.workOrderItem.customerName = this.selectedCustomer.text();
  }

  validateWorkOrderItem(propertyName: string) {
    this.validationController.validate({ object: this.workOrderItem, propertyName });
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if(!valid) return;
    this.workOrderItem.id = "" + NewWorkOrderItem.id++;
    await this.dialogController.ok(this.workOrderItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}

const validationRules = ValidationRules
  .ensure((workOrderItem: WorkOrderItem) => workOrderItem.workId)
  .displayName("作业内容")
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((workOrderItem: WorkOrderItem) => workOrderItem.customerId)
  .displayName("作业单位")
  .required().withMessage(`\${$displayName} 不能为空`)

  // .ensure((workOrderItem: WorkOrderItem) => workOrderItem.containerNumber)
  // .displayName("集装箱号")
  // .satisfies((containerNumber, workOrderItem) =>{ 
  //   if(!workOrderItem.containerType) return true;
  //   if(!containerNumber) return false; 
  //   return true;
  // } )
  // .withMessage(`\${$displayName} 不能为空`)
  .rules