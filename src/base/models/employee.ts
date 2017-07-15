import { ValidationRules } from 'aurelia-validation';
/**
 * Created by shun on 2017/6/15.
 */
export interface Employee {
  id: string;
  /**
   * 机构ID
   */
  organizationId: string;
  /**
   * 机构名称
   */
  organizationName: string;
  /**
   * 账户ID
   */
  accountId: string;
  /**
   * 姓名
   */
  name: string;
  /**
   * 性别
   */
  sex: string;
  /**
   * 手机
   */
  mobile: string;
  /**
   * 邮件
   */
  email: string;
  /**
   * 住址
   */
  address: string;
  /**
   * 住宅电话
   */
  homeNumber: string;
  /**
   * 身份证号
   */
  idcard: string;
  /**
   * 职位
   */
  position: string;
  /**
   * 办公室电话
   */
  officeNumber: string;
  /**
   * 关键字
   */
  keywords: string;
  /**
   * 员工状态
   */
  employeeStatus: string;
  /**
   * 机构角色ids
   */
  orgRoleIds: string[];

  remark: string;

}

export const validationRules = ValidationRules
  .ensure((e: Employee)  => e.name)
  .displayName('员工姓名')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(20).withMessage(`\${$displayName} 长度不能超过20`)

  .ensure((e: Employee)  => e.email)
  .displayName('邮箱')
  .email().withMessage(`\${$displayName} 格式错误`)
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.mobile)
  .displayName('手机号码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/^1[0-9]{10}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.idcard)
  .displayName('身份证号码')
  .matches(/^\d{15}|\d{18}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.officeNumber)
  .displayName('办公号码')
  .matches(/^\d{3}-\d{8}|\d{4}-\d{7}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.homeNumber)
  .displayName('家庭电话')
  .matches(/^\d{3}-\d{8}|\d{4}-\d{7}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.position)
  .displayName('职位')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.address)
  .displayName('家庭住址')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 长度不能超过500`)
  .rules;