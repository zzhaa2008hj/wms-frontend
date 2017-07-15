

import { observable, inject } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { ContractService } from "@app/base/services/contract";
import { WorkInfoService } from "@app/base/services/work-info";
import { WorkOrderArea } from "@app/instock/models/work";
import { NewWorkOrder } from "./new";
import { RouterParams } from '@app/common/models/router-params';

@customElement('area-items')
export class MessageRecipients {

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
        this.workInfoService.listWorkInfoesByCargo(this.newWorkOrder.workOrder.businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  //this.instockCargoItemId, this.type

  constructor(@inject private contractService: ContractService,
              @inject private workInfoService: WorkInfoService,
              @inject private newWorkOrder: NewWorkOrder,
              @inject('routerParams') private routerParams: RouterParams) {
    
  }

  add() {   
    this.dataSource.add({});
  }

  remove(e){
    this.dataSource.remove(e);
  }

  // workOrderAreaChanged() {
  //   this.dataSource.data(this.workOrderArea.workOrderItem);
  // }

  parentUidChanged(){
    this.dataSource = this.newWorkOrder.getNewDataSourceByUid(this.parentUid);
  }

}