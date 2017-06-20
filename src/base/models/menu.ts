/**
 * Created by shun on 2017/6/20.
 */
export interface Menu {
  id: string;
  Top_Web_Menu_Id: string;
  /**
   * 菜单名称
   */
  name: string;
  /**
   * 菜单url
   */
  url: string;
  /**
   * 上级菜单Id
   */
  parentId: string;
  menuCategory: string;
  /**
   * 是否自定义
   */
  customized: boolean;
  menuKey: string;
  /**
   * 0-菜单 1-功能
   */
  menuType: number;
  /**
   * 菜单样式
   */
  menuClass: string;
  sort: number;
  /**
   * 主页上显示的logo
   */
  logo: string;
  /**
   * URL带入的参数
   */
  params: string;
  appKey: string;
  /**
   * 应用类型
   */
  appType: string;
  appId: string;
  code: string;
}