import { DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { RateStep } from "@app/base/models/rate";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
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
    this.validationController.addObject(this.rateStep, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.rateStep);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}

const validationRules = ValidationRules
  .ensure((rateStep: RateStep) => rateStep.stepNum)
  .displayName('阶梯号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rateStep: RateStep) => rateStep.stepStart)
  .displayName('开始值')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rateStep: RateStep) => rateStep.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;