import { autoinject } from "aurelia-dependency-injection";
import { WorkOrderItem } from "@app/instock/models/work";
import { WorkInfoService } from "@app/base/services/work-info";
import { DialogController } from "ui";
import { ContractService } from "@app/base/services/contract";

@autoinject
export class NewWorkOrderItem {
  selectedCustomer: any;
  selectedWork: any;
  workOrderItem = {} as WorkOrderItem;
  units = [{ text: "单位1", value: 1 }, { text: "单位2", value: 2 }];
  containerType = [{ text: "集装箱类型1", value: 1 }, { text: "集装箱类型2", value: 2 }];

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
        this.workInfoService.listWorkInfo()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  constructor(private contractService: ContractService,
              private workInfoService: WorkInfoService,
              private dialogController: DialogController) {
  }
  activate(model) {
    this.workOrderItem.batchNumber = model.batchNumber;
    this.workOrderItem.workOrderId = model.workOrderId;
  }

  async save() {
    this.workOrderItem.workId = this.selectedWork.value();
    this.workOrderItem.workName = this.selectedWork.text();
    this.workOrderItem.customerId = this.selectedCustomer.value();
    this.workOrderItem.customerName = this.selectedCustomer.text();
    await this.dialogController.ok(this.workOrderItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}