/**
 * Created by shun on 2017/6/15.
 */
import {Employee} from "../models/employee";
import {OrganizationRole} from "../models/organization-role";
import {Query, handleResult, RestClient} from "../../utils";
import {autoinject} from "aurelia-dependency-injection";

@autoinject
export class EmployeeService {
  constructor(private http: RestClient) {

  }

  /**
   * 查询员工信息
   */
  queryEmployeesPage(keywords?: string): Query<Employee> {
    return this.http.query("/employee/page", {keywords});
  }

  /**
   * 删除员工
   */
  async deleteEmployee(id: string): Promise<void> {
    await this.http.delete(`/employee/${id}`).then(handleResult);
  }

  /**
   * 修改员工状态
   */
  async updateEmployeeStatus(id: string, status: string): Promise<void> {
    await this.http.put(`/employee/${id}/status/${status}`, null).then(handleResult);
  }

  /**
   * 获取机构角色
   */
  async getOrganizationRoles(): Promise<OrganizationRole[]> {
    let res = await this.http.get("/employee/organization/role-list");
    return res.content;
  }

  /**
   * 保存员工
   */
  async saveEmployee(employee: Employee) {
    await this.http.post('/employee', employee).then(handleResult);
  }
}