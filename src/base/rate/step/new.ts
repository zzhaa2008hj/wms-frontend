import { DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { RateStep, rateStepValidationRules } from "@app/base/models/rate";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRateStep {
  rateId: string;
  rateStep = {} as RateStep;
  validationController: ValidationController;
  stepUnits: DictionaryData[];

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(rateStep: RateStep) {
    this.rateStep = rateStep;

    this.stepUnits = await this.dictionaryDataService.getDictionaryDatas("unit");
  }

  async save() {
    this.validationController.addObject(this.rateStep, rateStepValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.rateStep);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}