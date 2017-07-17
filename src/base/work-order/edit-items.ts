import { observable, inject } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { ContractService } from "@app/base/services/contract";
import { WorkInfoService } from "@app/base/services/work-info";
import { EditWorkOrder } from "./edit";
import { RouterParams } from '@app/common/models/router-params';
import { WorkOderItemService } from "@app/instock/services/work-order";
import { MessageDialogService } from "ui";

@customElement('edit-area-items')
export class EditItems {

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
              @inject private workOderItemService: WorkOderItemService,
              @inject private messageDialogService: MessageDialogService) {

  }

  add() {
    this.dataSource.add({});
  }

  async remove(e) {
    let confirmed = await this.messageDialogService.confirm({ title: "删除", message: "删除后无法修复" });
    if (confirmed) {
      if (e.id != null && e.id != "") {
        try {
          await this.workOderItemService.removeWorkOrderItem(e.id);
          await this.messageDialogService.alert({ title: "", message: "删除成功" });
          this.dataSource.remove(e);
        } catch (e) {
          await this.messageDialogService.alert({ title: "错误", message: e.message, icon: 'error' });
        }

      } else {
        await this.messageDialogService.alert({ title: "", message: "删除成功" });
        this.dataSource.remove(e);
      }
    }
  }


  parentUidChanged() {
    this.dataSource = this.editWorkOrder.getNewDataSourceByUid(this.parentUid);
  }

}