import { inject, newInstance } from 'aurelia-dependency-injection';
import { DialogController } from "ui";
import { CargoDistrainVo } from '@app/instock/models/cargo-distrain';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class EditDistrain {
  cargoDistrain = {} as CargoDistrainVo;
  units: DictionaryData[] = [];

  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService) {
    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate(distrain: CargoDistrainVo) {
    this.cargoDistrain = distrain;
    this.validationController.addObject(this.cargoDistrain, validationRules);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.cargoDistrain.timestrap = new Date().getTime();
    await this.dialogController.ok(this.cargoDistrain);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}

const validationRules = ValidationRules
  .ensure((d: CargoDistrainVo) => d.number)
  .displayName('扣押件数')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.quantity)
  .displayName('扣押数量')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.unit)
  .displayName('单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 长度不能超过500`)
  .rules;