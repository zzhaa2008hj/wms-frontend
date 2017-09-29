import { observable, inject, newInstance } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { WorkInfoService } from "@app/base/services/work-info";
import { EditWorArea } from "./edit-area";
import { WorkOrderItemService, WorkOrderService } from '@app/instock/services/work-order';
import { MessageDialogService } from "ui";
import { EventAggregator } from "aurelia-event-aggregator";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { WorkOrderItem } from "@app/instock/models/work";
import { datagridValidationRenderer } from "@app/base/work-order/new-area";
import { DictionaryData } from '@app/base/models/dictionary';
import { CargoRate } from '@app/base/models/cargo-info';
import { DictionaryDataService } from '@app/base/services/dictionary';

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
        this.workOrderService.listCustomersForWork()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  worksSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.workInfoService.listWorkInfoesByTransferItemId(this.editWorArea.transferItemId)
          .then(options.success)
          .catch(err => options.error("", "", err));

      }
    }
  });
  //this.instockCargoItemId, this.type
  unit = [] as DictionaryData[];
  constructor( @inject private workInfoService: WorkInfoService,
    @inject private editWorArea: EditWorArea,
    @inject private workOrderService: WorkOrderService,
    @inject private workOrderItemService: WorkOrderItemService,
    @inject private messageDialogService: MessageDialogService,
    @inject private eventAggregator: EventAggregator,
    @newInstance() private validationController: ValidationController,
    @inject private dictionaryDataService: DictionaryDataService) {
    this.validationController.addRenderer(datagridValidationRenderer);

  }

  async bind() {
    this.dataSource = this.editWorArea.getNewDataSourceByUid(this.parentUid);
    this.eventAggregator.publish("item:bind", this);
    // 显示计价单位
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
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

    // 显示计价单位
    let rateData = this.worksSource.data();
    if (rateData && rateData.length > 0) {
      let rates: CargoRate[] = [];
      Object.assign(rates, rateData);
      let rate = rates.find(rate => rate.id == obj.workId);
      if (rate) {
        let unit = this.unit.find(d => rate.unit == d.dictDataCode);
        if (unit) {
          obj.unitStr = unit.dictDataName;
        }
      }
    }
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
  .satisfies(x => x <= 1000000000000000 && x > 0)
  .withMessage(`\${$displayName} 为无效值`)

  .rules;