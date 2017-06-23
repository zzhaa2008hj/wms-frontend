/**
 * Created by shun on 2017/6/15.
 */
import {autoinject, inject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {DataSourceFactory} from "../../utils";
import {DialogService} from "ui";
import {Employee} from "../models/employee";
import { EmployeeAuth } from "./auth";
import { EmployeePassword } from "./reset";
import {computedFrom} from "aurelia-framework";

export class EmployeeList {

  keywords: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  dataSource: kendo.data.DataSource;

  selection: Employee[] = [];

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.employeeService.queryEmployeesPage(this.keywords),
      pageSize: 10
    });
  }

  find() {
    this.dataSource.read();
  }

  async delete() {
    let employees = this.selection;
    let confirmMessage = employees.length == 1 ? `确认删除员工：“${employees[0].name}” ？` : `确认是否删除${employees.length}个员工？`;
    let confirmed = await this.dialogService.confirm({title: "删除确认", message: confirmMessage});
    if (!confirmed) return;
    let ids = employees.map(emp => emp.id);
    try {
      await this.employeeService.deleteEmployee(ids);
      await this.dialogService.alert({title: "", message: '删除成功'});
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  async enable() {
    await this.updateStatus("1");
  }

  async disable() {
    await this.updateStatus("0");
  }

  selectionChange(event) {
    let grid = event.detail.sender as kendo.ui.Grid;
    this.selection = getSelectedDataItems(grid).map(data => data as Employee);
    console.log('selection change', this.selection);
  }

  @computedFrom('selection')
  get canEdit(): boolean {
    return this.selection.length > 0;
  }

  @computedFrom('selection')
  get canAuthorize(): boolean {
    return this.selection.length > 0;
  }

  @computedFrom('selection')
  get canDelete(): boolean {
    return this.selection.length > 0;
  }

  @computedFrom('selection')
  get canDisable(): boolean {
    return this.selection.length > 0 && this.selection.every(emp => emp.employeeStatus != "0");
  }

  @computedFrom('selection')
  get canEnable(): boolean {
    return this.selection.length > 0 && this.selection.every(emp => emp.employeeStatus == "0");
  }

  /**
   * 批量禁用启用
   */
  private async updateStatus(status: string) {
    let employees = this.selection;
    if (employees.length == 0) return;
    let ids = employees.map(emp => emp.id);
    try {
      await this.employeeService.updateEmployeeStatus(ids, status);
      await this.dialogService.alert({title: "", message: "修改状态成功！"});
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  /**
   * 授权弹出窗
   */
  async authorize() {
    let employee = this.selection[0];
    try {
      let result = await this.dialogService.open({ viewModel: EmployeeAuth, model: employee }).whenClosed();
      if (result.wasCancelled) return;
      await this.dialogService.alert({ title: "", message: "授权成功！" });
    } catch (err) {
      await this.dialogService.alert({ title: "", message: err.message, icon: "error" });
    }
  }

  /**
   * 重置密码弹出窗
   */
  async resetPassword() {
    let employee = this.selection[0];
    let confirmed = await this.dialogService.confirm({title: "提示", message: `确认重置${employee.name}的密码？`});
    if (!confirmed) return;
    try {
      await this.employeeService.resetPassword(employee.id);
      await this.dialogService.alert({title: "", message: "重置密码成功！"});
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

}

function getSelectedDataItems(grid: kendo.ui.Grid): any[] {
  return grid.select().toArray().map(tr => grid.dataItem(tr));
}