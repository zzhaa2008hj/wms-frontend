

import { observable, inject } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { ContractService } from "@app/base/services/contract";
import { WorkInfoService } from "@app/base/services/work-info";
import { WorkOrderArea } from "@app/instock/models/work";
import { EditWorkOrder } from "./edit";
import { RouterParams } from '@app/common/models/router-params';
import { WorkOderItemService } from "@app/instock/services/work-order";

@customElement('edit-area-items')
export class EditItems {

  // @bindable
  // @observable
  // workOrderArea: WorkOrderArea;

  dataSource: kendo.data.DataSource;

  @bindable
  @observable
  parentUid: string;

  @bindable
  areaId: string;

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
        this.workInfoService.listWorkInfoesByCargo(this.editWorkOrder.workOrder.businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  //this.instockCargoItemId, this.type

  constructor(@inject private contractService: ContractService,
              @inject private workInfoService: WorkInfoService,
              @inject private editWorkOrder: EditWorkOrder,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private workOderItemService: WorkOderItemService) {
    
  }

  add() {   
    this.dataSource.add({});
  }

  remove(e){
    this.dataSource.remove(e);
  }


  parentUidChanged(){
    this.dataSource = this.editWorkOrder.getNewDataSourceByUid(this.parentUid);
  }

}