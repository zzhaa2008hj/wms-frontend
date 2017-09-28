import { DialogService, MessageDialogService, DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Rate, RateStep, rateValidationRules } from '@app/base/models/rate';
import { NewRateStep } from "@app/base/rate/step/new";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { ConstantValues } from '@app/common/models/constant-values';
import { uuid } from '@app/utils';

/**
 * copy base rate
 */
@autoinject
export class NewRate {
  rate = {} as Rate;
  rateSteps = [] as RateStep[];

  chargeCategory = ConstantValues.ChargeCategory;
  customerCategory = ConstantValues.CustomerCategory;
  chargeType = ConstantValues.ChargeType;
  pricingMode = ConstantValues.PricingMode;

  // warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  unit = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  dataSourceRateStep = new kendo.data.HierarchicalDataSource({
    data: []
  });
  validationController: ValidationController;
  private stepIndex: number = 1;
  private stepStart: number = 0;

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate({cargoCategoryId, cargoCategoryName}) {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    //this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.rate.cargoCategoryName = cargoCategoryName;
    this.rate.cargoCategoryId = cargoCategoryId;
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: this.rate.workId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.rate.workName = workInfo.name;
    this.rate.workId = workInfo.id;
  }

  chargeCategoryChanged() {
    this.rate.rateType = -1;
    this.rate.workName = '';
    this.rate.workId = '';
    //this.rate.warehouseType = '';
    this.rate.warehouseCategory = '';
  }

  async addNewRate() {
    if (this.rateSteps) {
      Object.assign(this.rate, { rateStep: this.rateSteps });
    }
    if (this.rate.pricingMode == 2) {
      this.rate.price = null;
      this.rate.unit = '';
    }
    this.rate.rateCategory = this.rate.chargeCategory; //rate:chargeCategory  cargoRate:rateCategory字段不同
    this.validationController.addObject(this.rate, rateValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    if (this.rate.pricingMode == 2 && this.rate.rateStep.length == 0) {
      await this.messageDialogService.alert({ title: "新增失败", message: '请设置阶梯费率', icon: 'error' });
      return;
    }
    // 临时Id 用于删除
    this.rate.id = uuid();
    this.dialogController.ok(this.rate);
  }

  async addStep() {
    let rateStep = {} as RateStep;
    rateStep.stepNum = this.stepIndex;
    rateStep.stepStart = this.stepStart;
    let result = await this.dialogService.open({ viewModel: NewRateStep, model: rateStep, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.rateSteps.push(result.output);
    this.stepIndex++;
    this.stepStart = result.output.stepEnd;
    this.dataSourceRateStep.data(this.rateSteps);
  }

  deleteStep(e) {
    let deletedStep = this.rateSteps.find(rs => rs.stepNum == e.stepNum);
    let index = this.rateSteps.indexOf(deletedStep);
    if (index < this.rateSteps.length - 1) {
      let steps: RateStep[] = this.rateSteps.filter(rs => rs.stepNum > e.stepNum);
      steps.map(s => s.stepNum -= 1);
      this.rateSteps[index + 1].stepStart = this.rateSteps[index].stepStart;
    } else {
      this.stepStart = e.stepStart;
    }
    this.rateSteps.splice(index, 1);
    this.stepIndex--;
    this.dataSourceRateStep.data(this.rateSteps);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}