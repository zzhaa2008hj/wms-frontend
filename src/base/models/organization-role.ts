/**
 * Created by shun on 2017/6/16.
 */
export interface OrganizationRole {
  id: string;
  /**
   * 角色名称
   */
  name: string;
  /**
   * 角色编码
   */
  code: string;
  /**
   * 内建  自建
   */
  roleType: string;
  organizationId: string;
  appKey: string;
  appId: string;
  appType: string;
}