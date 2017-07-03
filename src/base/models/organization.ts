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
}