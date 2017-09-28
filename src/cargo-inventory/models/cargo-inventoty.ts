import { BaseEntity } from '@app/common/models/base-entity';
import { ValidationRules } from 'aurelia-validation';

export interface CargoInventory extends BaseEntity {

  demandFrom: number;
  demandFromStr: string;

  /**
   * 库区、货类、时间、客户
   */
  demandType: number;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;

  startTime: Date;
  startTimeStr: string;
  endTime: Date;
  endTimeStr: string;

  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  status: number;
  statusStr: string;
  /**
   * 盘点人
   */
  inventoryChecker: string;
  inventoryCheckDate: Date;
  inventoryCheckDateStr: string;

  actualCheckDate: Date;
  actualCheckDateStr: string;
}

export interface CargoInventoryItem extends BaseEntity {
  cargoInventoryId: string;
  cargoName: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  warehouseName: string;
  instockDate: Date;
  instockDateStr: string;
  
  inventoryNumber: number;
  inventoryQuantity: number;

  unit: string;
  unitStr: string;

  actualNumber: number;
  actualQuantity: number;

  profitLossNumber: number;
  profitLossQuantity: number;
}

export interface CargoInventoryVO {
  cargoInventory: CargoInventory;
  inventoryItemList: Array<CargoInventoryItem>;
}

export const cargoInventoryValidationRules  = ValidationRules
  .ensure((cargoInventory: CargoInventory) => cargoInventory.cargoCategoryName)
  .displayName('货类')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.startTime)
  .displayName('开始时间')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.endTime)
  .displayName('结束时间')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.remark)
  .displayName('备注')
  .maxLength(200).withMessage(`\${$displayName} 长度不能超过200`)

  .ensure((cargoInventory: CargoInventory) => cargoInventory.agentId)
  .displayName('代理商')
  .satisfies((x: string, cargoInventory: CargoInventory) => {
    if (cargoInventory.demandFrom == 1 && (!x || x == '')) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.customerId)
  .displayName('客户')
  .satisfies((x: string, cargoInventory: CargoInventory) => {
    if (cargoInventory.demandFrom == 1 && (!x || x == '')) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.warehouseName)
  .displayName('库区')
  .satisfies((x: string, cargoInventory: CargoInventory) => {
    if (cargoInventory.demandFrom == 2 && (!x || x == '')) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能为空`)
  .rules;


  export const cargoItemsValidationRules = ValidationRules
  .ensure((cargoInventory: CargoInventory) => cargoInventory.inventoryChecker)
  .displayName('盘点人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoInventory: CargoInventory) => cargoInventory.actualCheckDate)
  .displayName('实盘时间')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;