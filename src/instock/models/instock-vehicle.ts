import { ValidationRules } from 'aurelia-validation';

export interface InstockVehicle {
  id: string ;

  instockGoodsId: string ;

  plateNumber: string ;

  driverName: string ;

  driverIdentityNumber: string ;

  phoneNumber: string ;

  remark: string ;

  orgId: string ;

//唯一性标识
  sign?: string;

  cargoName: string;
}

export const vehicleValidationRules = ValidationRules
  .ensure((vehicle: InstockVehicle) => vehicle.plateNumber)
  .displayName('车牌号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: InstockVehicle) => vehicle.driverName)
  .displayName('司机名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: InstockVehicle) => vehicle.driverIdentityNumber)
  .displayName('身份证号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: InstockVehicle) => vehicle.phoneNumber)
  .displayName('电话')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: InstockVehicle) => vehicle.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;