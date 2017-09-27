/**
 * Created by Hui on 2017/6/15.
 */
import { ValidationRules } from 'aurelia-validation';
export interface Warehouse {
  id?: string;
  parentId?: string;
  category: string;
  name: string;
  type: string;
  remark: string;
  orgId: string;
  status: boolean;

  //列表页显示
  typeStr: string;
  categoryStr: string;
}

export const wareHouseValidationRules = ValidationRules
  .ensure((warehouse: Warehouse) => warehouse.name)
  .displayName('库区名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((warehouse: Warehouse) => warehouse.type)
  .displayName('库区性质')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((warehouse: Warehouse) => warehouse.category)
  .displayName('库区类别')
  .required().withMessage(`\${$displayName} 不能为空`)


  .ensure((warehouse: Warehouse) => warehouse.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;