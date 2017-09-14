import { ValidationRules } from 'aurelia-validation';
/**
 * Created by Hui on 2017/8/7.
 * 发票
 */
export interface Invoice{
  id: string;
  orgId: string;
  remark: string;
  // 结算ID
  infoId: string;
  // 费收类型
  feeType: number;
  // 发票类型
  invoiceType: number;
  // 发票号
  invoiceNumber: string;
  // 金额
  amount: number;
  // 核销金额
  verificationAmount: number;
}

export const invoiceValidationRules = ValidationRules
.ensure((invoice: Invoice) => invoice.invoiceType)
.displayName("发票类型")
.required().withMessage(`\${$displayName}不能为空`)
.ensure((invoice: Invoice) => invoice.invoiceNumber)
.displayName("发票号")
.required().withMessage(`\${$displayName}不能为空`)
.ensure((invoice: Invoice) => invoice.amount)
.displayName("发票金额")
.required().withMessage(`\${$displayName}不能为空`)
.matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)
.rules;