/**
 * Created by shun on 2017/6/15.
 */
import { Employee } from "../models/employee";
import { OrganizationRole } from "../models/organization-role";
import { Query, handleResult, RestClient } from "../../utils";
import { autoinject } from "aurelia-dependency-injection";

@autoinject
export class EmployeeService {
  constructor(private http: RestClient) {

  }

  /**
   * 查询员工信息
   */
  queryEmployeesPage(keywords?: string): Query<Employee> {
    return this.http.query("/base/employee/page", { keywords });
  }

  /**
   * 删除员工
   */
  async deleteEmployee(ids: string[]): Promise<void> {
    await this.http.createRequest(`/base/employee`).withContent(ids).asDelete().send().then(handleResult);
  }

  /**
   * 修改员工状态
   */
  async updateEmployeeStatus(ids: string[], status: string): Promise<void> {
    await this.http.put(`/base/employee/status/${status}`, ids).then(handleResult);
  }

  /**
   * 保存员工
   */
  async saveEmployee(employee: Employee) {
    await this.http.post('/base/employee', employee).then(handleResult);
  }

  /**
   * 获取单个员工
   */
  async getEmployee(id: string): Promise<Employee> {
    let res = await this.http.get(`/base/employee/${id}`);
    return res.content;
  }

  /**
   * 修改员工
   */
  async updateEmployee(id: string, employee: Employee) {
    await this.http.put(`/base/employee/${id}`, employee).then(handleResult);
  }

  /**
   * 获取机构角色列表
   */
  async getOrganizationRoles(): Promise<OrganizationRole[]> {
    let res = await this.http.get('/base/employee/organization/role-list');
    return res.content;
  }

  /**
   * 获取员工机构角色列表
   */
  async getEmployeeRoles(id: string): Promise<OrganizationRole[]> {
    let res = await this.http.get(`/base/employee/role-list/${id}`);
    return res.content;
  }

  /**
   * 授权角色
   */
  async updateAuthorization(id: string, checkedRoleIds: string[]) {
    await this.http.put(`/base/employee/auth/${id}`, checkedRoleIds).then(handleResult);
  }

  /**
   * 重置密码
   */
  async resetPassword(id: string) {
    await this.http.put(`/base/employee/${id}/reset-password`, null).then(handleResult);
  }

  async listEmployee() {
    let res = await this.http.get(`/rest/employee/list`);
    return res.content;
  }
}