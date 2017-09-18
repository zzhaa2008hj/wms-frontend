import { inject, newInstance } from 'aurelia-dependency-injection';
import { DialogController } from "ui";
import { CargoDistrainVo, CargoItemStorageInfoVo, CargoDistrain } from '@app/outstock/models/cargo-distrain';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class NewDistrain {
  cargoDistrain = {} as CargoDistrainVo;
  units: DictionaryData[] = [];

  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService) {
    this.validationController.addRenderer(formValidationRenderer);
  }

  async activate(cargoItemStorageInfoVo: CargoItemStorageInfoVo) {
    this.validationController.addObject(this.cargoDistrain, validationRules);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoDistrain.quantity = 0;
    this.cargoDistrain.number = 0;
    this.cargoDistrain.unit = cargoItemStorageInfoVo.cargoItem.unit;
    this.cargoDistrain.storageNumber = cargoItemStorageInfoVo.storageInfo.inventoryNumber;
    this.cargoDistrain.storageQuantity = cargoItemStorageInfoVo.storageInfo.inventoryQuantity;
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
  .satisfies((x: number, cargoDistrain: CargoDistrainVo) => {
    if (x > cargoDistrain.storageNumber || x < 0) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能小于0且不能大于库存量`)
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.quantity)
  .displayName('扣押数量')
  .satisfies((x: number, cargoDistrain: CargoDistrainVo) => {
    if (x > cargoDistrain.storageQuantity || x < 0) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能小于0且不能大于库存量`)
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.unit)
  .displayName('单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((d: CargoDistrainVo) => d.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 长度不能超过500`)
  .rules;