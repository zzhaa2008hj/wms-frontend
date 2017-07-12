import { DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { RateStep, rateStepValidationRules } from "@app/base/models/rate";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRateStep {
  rateId: string;
  rateStep: RateStep;
  stepUnit = [{ text: "元/天", value: "元/天" }, { text: "元/吨", value: "元/吨" }];
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

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