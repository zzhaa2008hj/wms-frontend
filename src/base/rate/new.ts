import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Rate, RateStep, rateValidationRules } from '@app/base/models/rate';
import { RateService, RateStepService } from '@app/base/services/rate';
import { NewRateStep } from "@app/base/rate/step/new";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { CargoCategoryTree } from "@app/base/rate/cargo-category-tree";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { ConstantValues } from '@app/common/models/constant-values';
import { observable } from 'aurelia-framework';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  @observable disabled: boolean = false;
  rate = {} as Rate;
  rateSteps = [] as RateStep[];

  chargeCategory = ConstantValues.ChargeCategory;
  customerCategory = ConstantValues.CustomerCategory;
  chargeType = ConstantValues.ChargeType;
  pricingMode = ConstantValues.PricingMode;

  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  unit = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  dataSourceRateStep = new kendo.data.HierarchicalDataSource({
    data: []
  });
  validationController: ValidationController;
  private stepIndex: number = 1;
  private stepStart: number = 0;

  constructor(private router: Router,
              private rateService: RateService,
              private rateStepService: RateStepService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory, 
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    if (params.id) {
      this.rate = await this.rateService.getRate(params.id);
      this.rate.id = null;
      this.rateSteps = await this.rateStepService.listRateStepByRateId(params.id);
      if (this.rateSteps.length > 0) {
        this.stepIndex = this.rateSteps.length;
        this.stepStart = this.rateSteps[this.stepIndex - 1].stepEnd;
        this.rateSteps.forEach(rs => {
          rs.id = null;
          rs.rateId = null;
          rs.stepUnitStr = this.unit.find(u => u.dictDataCode == rs.stepUnit).dictDataName;
        });
        this.dataSourceRateStep.data(this.rateSteps);
      }
    } 
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: this.rate.workId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.rate.workName = workInfo.name;
    this.rate.workId = workInfo.id;
  }

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: CargoCategoryTree, model: this.rate.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.rate.cargoCategoryName = cargoCategory.categoryName;
    this.rate.cargoCategoryId = cargoCategory.id;
  }

  chargeCategoryChanged() {
    this.rate.rateType = -1;
    this.rate.workName = '';
    this.rate.workId = '';
    this.rate.warehouseType = '';
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
    this.validationController.addObject(this.rate, rateValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    if (this.rate.pricingMode == 2 && this.rate.rateStep.length == 0) {
      await this.messageDialogService.alert({ title: "新增失败", message: '请设置阶梯费率', icon: 'error' });
      return;
    }

    this.disabled = true;
    try {
      await this.rateService.saveRate(this.rate);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
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

  cancel() {
    this.router.navigateToRoute("list");
  }
}