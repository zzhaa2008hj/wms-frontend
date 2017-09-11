import { ValidationRules } from 'aurelia-validation';
export interface Organization {
  /**
   * 机构id
   */
  id: string;
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

  printAddress: string;
}

export const orgValidationRules = ValidationRules
  .ensure((org: Organization) => org.name)
  .displayName('机构名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.shortName)
  .displayName('机构简称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.contactMobile)
  .displayName('联系人手机')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/^0?(1[358][0-9]|17[05678]|15[012356789]|18[02356789]|14[57])[0-9]{8}$/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)

  .ensure((org: Organization) => org.organizationCode)
  .displayName('组织机构代码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

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