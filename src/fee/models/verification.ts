import { ValidationRules } from 'aurelia-validation';
/**
 * 核销
 */
export interface Verification {
  id: string;
  orgId: string;
  remark: string;
  createTime: Date;
  // 需求ID
  infoId: string;
  // 发票ID
  invoiceId: string;
  // 费收类型
  feeType: number;
  // 核销金额
  amount: number;
}

export const verificationValidationRules = ValidationRules
.ensure((v: Verification) => v.amount)
.displayName("发票金额")
.required().withMessage(`\${$displayName}不能为空`)
.matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)
.rules;