import { observable, inject, newInstance } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { ContractService } from "@app/base/services/contract";
import { WorkInfoService } from "@app/base/services/work-info";
import { NewWorArea } from "./new-area";
import { RouterParams } from '@app/common/models/router-params';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { WorkOrderItem } from "@app/instock/models/work";
import { formValidationRenderer } from "@app/validation/support";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";

@customElement('area-items')
export class NewWorkItem {

  // @bindable
  // @observable
  // workOrderArea: WorkOrderArea;

  dataSource: kendo.data.DataSource;

  @bindable
  @observable
  parentUid: string;

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
        this.workInfoService.listWorkInfoesByCargo(this.newWorkArea.instockCargoId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  //this.instockCargoItemId, this.type

  //private resBind: Subscription;
  constructor(@inject private contractService: ContractService,
              @inject private workInfoService: WorkInfoService,
              @inject private newWorkArea: NewWorArea,
              @inject('routerParams') private routerParams: RouterParams,
              @newInstance() private validationController: ValidationController,
              @inject private eventAggregator: EventAggregator) {
              this.validationController.addRenderer(formValidationRenderer);  
              console.log('this',this);

  }
   bind(){
     //this.newWorkArea.onItemAdd(this);
     this.dataSource = this.newWorkArea.getNewDataSourceByUid(this.parentUid);
     this.eventAggregator.publish("item:bind", this);
   }

   unbind(){
     //this.newWorkArea.onItemRemove(this);
     this.eventAggregator.publish("item:unbind", this);
    //  this.resBind.dispose();
   }

  async add() {
    let len = this.dataSource.data().length;
    for (let i = 0; i < len; i++) {
        this.validationController.addObject(this.dataSource.data()[i], workOrderItemRules);
    }

    let { valid } = await this.validationController.validate();
    if(valid) this.dataSource.add({});
  }

  remove(e) {
    this.dataSource.remove(e);
  }

  // workOrderAreaChanged() {
  //   this.dataSource.data(this.workOrderArea.workOrderItem);
  // }

  parentUidChanged() {
    console.log("this.parentUid"+this.parentUid);
    this.dataSource = this.newWorkArea.getNewDataSourceByUid(this.parentUid);
  }

  
  async verify(){
     
    let len = this.dataSource.data().length;
    for (let i = 0; i < len; i++) {
        this.validationController.addObject(this.dataSource.data()[i], workOrderItemRules);
    }

    let { valid } = await this.validationController.validate();
    console.log(this.validationController);
    return valid;
  }

  aa(){
    alert("aa");
  }
}

const workOrderItemRules = ValidationRules
  // .ensure((workOrderIem: WorkOrderItem) => workOrderIem.workName)
  // .displayName("作业内容")
  // .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrderIem: WorkOrderItem) => workOrderIem.workNumber)
  .displayName("作业数量")
  .required().withMessage(`\${$displayName}不能为空`)
  .satisfies(x =>  x <= 1000000000000000 && x >= 0)
  .withMessage(`\${$displayName} 为无效值`)

  .rules;