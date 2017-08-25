import { observable, inject, newInstance } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { WorkInfoService } from "@app/base/services/work-info";
import { NewWorArea } from "./new-area";
import { RouterParams } from '@app/common/models/router-params';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { WorkOrderItem } from "@app/instock/models/work";
import { EventAggregator } from "aurelia-event-aggregator";
import { MessageDialogService } from "ui";
import { datagridValidationRenderer } from "./new-area";
import { WorkOrderService } from '@app/instock/services/work-order';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { Rate } from '@app/base/models/rate';

@customElement('area-items')
export class NewWorkItem {

  // @bindable
  // @observable
  // workOrderArea: WorkOrderArea;

  dataSource: kendo.data.DataSource;

  @bindable
  @observable
  parentUid: string;

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
        this.workInfoService.listWorkInfoesByCargo(this.newWorkArea.instockCargoId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  //this.instockCargoItemId, this.type
  unit = [] as DictionaryData[];
  //private resBind: Subscription;
  constructor(@inject private workInfoService: WorkInfoService,
              @inject private newWorkArea: NewWorArea,
              @inject private workOrderService: WorkOrderService,
              @inject('routerParams') private routerParams: RouterParams,
              @newInstance() private validationController: ValidationController,
              @inject private eventAggregator: EventAggregator,
              @inject private messageDialogService: MessageDialogService,
              @inject private dictionaryDataService: DictionaryDataService,) {
    this.validationController.addRenderer(datagridValidationRenderer);

  }

  async bind() {
    //this.newWorkArea.onItemAdd(this);
    this.dataSource = this.newWorkArea.getNewDataSourceByUid(this.parentUid);
    this.eventAggregator.publish("item:bind", this);
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

  remove(e) {
    this.dataSource.remove(e);
  }

  // workOrderAreaChanged() {
  //   this.dataSource.data(this.workOrderArea.workOrderItem);
  // }

  parentUidChanged() {
    this.dataSource = this.newWorkArea.getNewDataSourceByUid(this.parentUid);
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
      let rates: Rate[] = [];
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