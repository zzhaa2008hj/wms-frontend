import { ValidationRules } from 'aurelia-validation';
/**
 * Created by Hui on 2017/6/15.
 */
export interface Rate {
  id?: string;
  orgId: string;
  remark: string;

  // Rate
  chargeType: number;
  chargeCategory: number;
  chargeCategoryStr: string;
  workId: string;
  workName: string;
  rateType: number;
  rateTypeStr: string;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  pricingMode: number;
  unit: string;
  unitStr: string;
  price: number;
  warehouseType: string;
  warehouseCategory: string;
  warehouseTypeStr: string;
  warehouseCategoryStr: string;
  customerCategory: number;

  rateStep: RateStep[];
  rateCategory: number;
}

export interface RateStep {
  id?: string;
  orgId: string;
  remark: string;

  // RateStep
  rateId: string;
  stepNum: number;
  stepStart: number;
  stepEnd: number;
  stepPrice: number;
  stepUnit: string; //元/天、元/吨

  stepUnitStr: string;

}

export const rateValidationRules = ValidationRules
  .ensure((rate: Rate) => rate.chargeCategory)
  .displayName('费用类别')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.chargeType)
  .displayName('收付费')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.customerCategory)
  .displayName('客户类别')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.cargoCategoryName)
  .displayName('货物类别')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.pricingMode)
  .displayName('计价方式')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.price)
  .displayName('单价')
  .satisfies((x: number, rate: Rate) => {
    if ((x == null || x <= 0) && rate.pricingMode == 1) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能为空并且应大于0`)
  .ensure((rate: Rate) => rate.unit)
  .displayName('计量单位')
  .satisfies((x: string, rate: Rate) => {
    if ((x == '' || x == null) && rate.pricingMode == 1) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.rateType)
  .displayName('作业类别')
  .satisfies((x: number, rate: Rate) => {
    if (x == -1 && rate.chargeCategory != 1) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.workName)
  .displayName('作业内容')
  .satisfies((x: string, rate: Rate) => {
    if ((x == '' || x == null) && rate.chargeCategory != 1) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.warehouseType)
  .displayName('库位性质')
  .satisfies((x: string, rate: Rate) => {
    if ((x == '' || x == null) && rate.chargeCategory == 1) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能为空`)
  .ensure((rate: Rate) => rate.warehouseCategory)
  .displayName('库位类别')
  .satisfies((x: string, rate: Rate) => {
    if ((x == '' || x == null) && rate.chargeCategory == 1) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 不能为空`)

  .ensure((rate: Rate) => rate.remark)
  .displayName('备注')
  .maxLength(500)
  .withMessage(`\${$displayName} 过长`)
  .rules;


export const rateStepValidationRules = ValidationRules
  .ensure((rateStep: RateStep) => rateStep.stepNum)
  .displayName('阶梯号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rateStep: RateStep) => rateStep.stepStart)
  .displayName('开始值')
  .required().withMessage(`\${$displayName} 不能为空`)  
  .satisfies((x: number) => {
    if (x != undefined) {
      return x >= 0;
    }
    return false;
  }).withMessage(`请输入正数或0`)

  .ensure((rateStep: RateStep) => rateStep.stepEnd)
  .displayName('结束值')
  .satisfies((x: number) => {
    if (x != undefined) {
      return x > 0;
    }
    return true;
  }).withMessage(`请输入正数`)
  .satisfies((x: number, rateStep: RateStep) => {
    if (x != undefined && rateStep.stepStart >= x) {
      return false;
    }
    return true;
  }).withMessage(`结束值应大于开始值`)

  .ensure((rateStep: RateStep) => rateStep.stepPrice)
  .displayName('阶梯价')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rateStep: RateStep) => rateStep.stepUnit)
  .displayName('计量单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((rateStep: RateStep) => rateStep.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;