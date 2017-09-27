import { ValidationRules } from 'aurelia-validation';
export interface Organization {
  /**
   * 机构id
   */
  id: string;

  orgProperty: number;
  
  /**
   * 机构名称
   */
  name: string;
  /**
   *  机构简称
   */
  shortName: string;
  /**
   * 机构邮箱
   */
  email: string;
  /**
   * 联系人
   */
  contactPerson: string;
  /**
   *  联系人手机
   */
  contactMobile: string;
  /**
   * 组织机构代码
   */
  organizationCode: string;
  /**
   * 机构描述
   */
  description: string;
  /**
   * 地址
   */
  address: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 注册代码
   */
  registerCode: string;
  /**
   * 注册时间
   */
  registerDate: Date;
  /**
   * 法人
   */
  legalPerson: string;
  /**
   * 传真号码
   */
  faxNumber: string;
  /**
   * 创建时间
   */
  createTime: Date;
  /**
   * 备注
   */
  remark: string;
  /**
   * 开户行
   */
  bankInfo: string;
  /**
   * 账户
   */
  bankNo: string;

  printAddress: string;
}

export const orgValidationRules = ValidationRules
  .ensure((org: Organization) => org.name)
  .displayName('机构名称/姓名')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.shortName)
  .displayName('机构简称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.bankInfo)
  .displayName('开户银行')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((org: Organization) => org.bankNo)
  .displayName('银行账户')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((org: Organization) => org.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.contactMobile)
  .displayName('联系人手机')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)

  .ensure((org: Organization) => org.organizationCode)
  .displayName('统一社会信用代码/身份证号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/[1-9A-GY]{1}[1239]{1}[1-5]{1}[0-9]{5}[0-9A-Z]{10}|(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)

  .ensure((org: Organization) => org.email)
  .displayName('邮箱')
  .matches(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)

  .ensure((org: Organization) => org.address)
  .displayName('地址')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.description)
  .displayName('机构描述')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.registerCode)
  .displayName('注册代码')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.legalPerson)
  .displayName('法人')
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.faxNumber)
  .displayName('传真号码')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.remark)
  .displayName('备注')
  .maxLength(250).withMessage(`\${$displayName} 过长`)
  .rules;