/**
 * Created by shun on 2017/6/15.
 */
import {autoinject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {DataSourceFactory} from "../../utils";
import {MessageDialogService} from "ui";
import {Employee} from "../models/employee";
import {computedFrom} from "aurelia-framework";
import {DialogService} from "aurelia-dialog";

@autoinject
export class EmployeeList {

  keywords: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  dataSource: kendo.data.DataSource;

  selection: Employee[] = [];

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory) {
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
    let confirmed = await this.messageDialogService.confirm({title: "删除确认", message: confirmMessage});
    if (!confirmed) return;
    try {
      await Promise.all(employees.map(emp => this.employeeService.deleteEmployee(emp.id)));
      await this.messageDialogService.alert({title: "删除成功", message: `成功删除${employees.length}个员工`});
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({title: "删除失败", message: err.message, icon: "error"});
    }
  }

  async enable() {
    await this.updateStatus("1");
  }

  async disable() {
    await this.updateStatus("0");
  }


  async changeStatus(id, status) {
    try {
      await this.employeeService.updateEmployeeStatus(id, status);
      await this.messageDialogService.alert({title: "", message: "修改状态成功！"});
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({title: "", message: err.message, icon: "error"});
    }
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

  private async updateStatus(status: string) {
    let employees = this.selection;
    if (employees.length == 0) return;
    try {
      await Promise.all(employees.map(emp => this.employeeService.updateEmployeeStatus(emp.id, status)));
      await this.messageDialogService.alert({title: "", message: "修改状态成功！"});
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

}

function getSelectedDataItems(grid: kendo.ui.Grid): any[] {
  return grid.select().toArray().map(tr => grid.dataItem(tr));
}