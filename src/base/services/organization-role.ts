/**
 * Created by shun on 2017/6/19.
 */
import {OrganizationRole} from "@app/base/models/organization-role";
import {Menu} from "@app/base/models/menu";
import {Query, handleResult, RestClient} from "@app/utils";
import {autoinject} from "aurelia-dependency-injection";

@autoinject
export class OrganizationRoleService {
  constructor(private http: RestClient) {

  }

  /**
   * 查询角色信息
   */
  queryRolePage(keywords?: string): Query<OrganizationRole> {
    return this.http.query("/base/org-role/page", {keywords});
  }

  /**
   * 新增
   */
  async add(role: OrganizationRole): Promise<void> {
    await this.http.post('/base/org-role', role).then(handleResult);
  }
  /**
   * 修改
   */
  async edit(id: string, role: OrganizationRole): Promise<void> {
    await this.http.put(`/base/org-role/${id}`, role).then(handleResult);
  }
  /**
   * 删除
   */
  async deleteOrganizationRole(id: string): Promise<void> {
    await this.http.delete(`/base/org-role/${id}`).then(handleResult);
  }

  /**
   * 获取机构菜单
   */
  async getOrgMenu(): Promise<Menu[]> {
    let res = await this.http.get('/base/org-role/org-menu');
    return res.content;
  }

  /**
   * 获取机构角色菜单
   */
  async getOrgRoleMenu(roleId: string): Promise<Menu[]> {
    let res = await this.http.get(`/base/org-role/menu/${roleId}`);
    return res.content;
  }

  /**
   * 菜单授权
   */
  async assignOrgRoleMenu(roleId: string, menuIds: string[]): Promise<void> {
    await this.http.put(`/base/org-role/menu/${roleId}`, menuIds).then(handleResult);
  }
}