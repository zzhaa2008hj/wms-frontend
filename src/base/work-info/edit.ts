import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { WorkInfo } from "@app/base/models/work-info";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWorkInfo {
  workInfo: WorkInfo;
  category = [{ text: "入库", value: 1 }, { text: "出库", value: 2 }, { text: "移库", value: 4 }];
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  activate(workInfo: WorkInfo) {
    this.workInfo = workInfo;
  }

  async save() {
    this.validationController.addObject(this.workInfo, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.workInfo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((workInfo: WorkInfo) => workInfo.name)
  .displayName('作业名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((workInfo: WorkInfo) => workInfo.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;
