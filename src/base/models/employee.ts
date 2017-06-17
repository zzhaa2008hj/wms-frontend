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
  home_number: string;
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

}