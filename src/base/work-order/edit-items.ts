import { observable, inject, newInstance } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { ContractService } from "@app/base/services/contract";
import { WorkInfoService } from "@app/base/services/work-info";
import { EditWorArea } from "./edit-area";
import { RouterParams } from '@app/common/models/router-params';
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { MessageDialogService } from "ui";
import { EventAggregator } from "aurelia-event-aggregator";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { WorkOrderItem } from "@app/instock/models/work";
import { datagridValidationRenderer } from "./new-area";

@customElement('edit-area-items')
export class EditItems {

  dataSource: kendo.data.DataSource;

  @bindable
  @observable
  parentUid: string;

  @bindable
  areaId: string;

  @bindable
  @observable
  disabled: boolean;

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
        this.workInfoService.listWorkInfoesByCargo(this.editWorArea.businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  //this.instockCargoItemId, this.type

  constructor(@inject private contractService: ContractService,
              @inject private workInfoService: WorkInfoService,
              @inject private editWorArea: EditWorArea,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private workOrderItemService: WorkOrderItemService,
              @inject private messageDialogService: MessageDialogService,
              @inject private eventAggregator: EventAggregator,
              @newInstance() private validationController: ValidationController) {
    this.validationController.addRenderer(datagridValidationRenderer);

  }

  bind() {
    //this.newWorkArea.onItemAdd(this);
    this.dataSource = this.editWorArea.getNewDataSourceByUid(this.parentUid);
    this.eventAggregator.publish("item:bind", this);
  }

  unbind() {
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
    if (!valid) {
      await this.messageDialogService.alert({ title: "提示", message: "输入内容不规范请检查输入内容" });
    }
    if (valid) this.dataSource.add({});
  }

  async remove(e) {
    let confirmed = await this.messageDialogService.confirm({ title: "删除", message: "删除后无法修复" });
    if (confirmed) {
      if (e.id != null && e.id != "") {
        try {
          await this.workOrderItemService.removeWorkOrderItem(e.id);
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
    this.dataSource = this.editWorArea.getNewDataSourceByUid(this.parentUid);
  }

  async verify() {

    let len = this.dataSource.data().length;
    for (let i = 0; i < len; i++) {
      this.validationController.addObject(this.dataSource.data()[i], workOrderItemRules);
    }

    let { valid } = await this.validationController.validate();
    return valid;
  }

  async aa() {
    await this.verify();
  }

  validateWorkOrderItem(obj, propertyName: string) {
    this.validationController.validate({ object: obj, propertyName });
  }

}

const workOrderItemRules = ValidationRules
  .ensure((workOrderIem: WorkOrderItem) => workOrderIem.workId)
  .displayName("作业内容")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrderIem: WorkOrderItem) => workOrderIem.customerId)
  .displayName("作业单位")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrderIem: WorkOrderItem) => workOrderIem.workNumber)
  .displayName("作业数量")
  .required().withMessage(`\${$displayName}不能为空`)
  .satisfies(x => x <= 1000000000000000 && x >= 0)
  .withMessage(`\${$displayName} 为无效值`)

  .rules;