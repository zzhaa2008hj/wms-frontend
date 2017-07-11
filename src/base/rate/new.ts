import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Rate } from "@app/base/models/rate";
import { RateService } from "@app/base/services/rate";
import { NewRateStep } from "@app/base/rate/step/new";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { CargoCategoryTree } from "@app/base/rate/cargo-category-tree";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { ConstantValues } from '@app/common/models/constant-values';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  rate = {} as Rate;
  rateStep = new Array;

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

  constructor(private router: Router,
              private rateService: RateService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
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

  async addNewRate() {
    if (this.rateStep) {
      Object.assign(this.rate, { rateStep: this.rateStep });
    }
    try {
      this.validationController.addObject(this.rate, validationRules);
      let { valid } = await this.validationController.validate();
      if (!valid) return;

      await this.rateService.saveRate(this.rate);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  async addStep() {
    let result = await this.dialogService.open({ viewModel: NewRateStep, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
    let ob = {};
    Object.assign(ob, result.output);
    Object.assign(ob, { sign: r });
    this.rateStep.push(ob);
    this.dataSourceRateStep.data(this.rateStep);
  }

  deleteStep(e) {
    for (let o of this.rateStep) {
      if (e.sign == o.sign) {
        let index = this.rateStep.indexOf(o);
        this.rateStep.splice(index, 1);
      }
    }
    this.dataSourceRateStep.data(this.rateStep);
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

const validationRules = ValidationRules
  .ensure((rate: Rate) => rate.chargeCategory)
  .displayName('费用类别')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.chargeType)
  .displayName('费用类型')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.customerCategory)
  .displayName('客户类别')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;