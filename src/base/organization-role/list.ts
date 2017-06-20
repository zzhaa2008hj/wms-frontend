/**
 * Created by shun on 2017/6/19.
 */
import { autoinject, inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { DataSourceFactory } from "../../utils";
import { OrganizationRoleService } from "../services/organization-role";
import { DialogService } from "ui";
import {OrganizationRoleAdd} from "./new";
import {OrganizationRoleEdit} from "./edit";
import {OrganizationRole} from "../models/organization-role";

@autoinject
export class RoleList {
  name: string;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private router: Router,
              private roleService: OrganizationRoleService,
              private dialogService: DialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.roleService.queryRolePage(this.name),
      pageSize: 10
    });
  }

  find() {
    this.dataSource.read();
  }
  /**
   * 删除
   */
  async delete(id) {
    let confirmed = await this.dialogService.confirm({ title: "提示", message: "确认删除？" });
    if (!confirmed) return;
    try {
      await this.roleService.deleteOrganizationRole(id);
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
    }
  }

  /**
   * 新增
   */
  async add() {
    let result = await this.dialogService.open({ viewModel: OrganizationRoleAdd, model: {}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.roleService.add(result.output);
      await this.dialogService.alert({ title: "提示", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 编辑
   */
  async edit(organizationRole: OrganizationRole) {
    let result = await this.dialogService.open({ viewModel: OrganizationRoleEdit, model: organizationRole, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    try {
      let role = result.output as OrganizationRole;
      await this.roleService.edit(role.id, role);
      await this.dialogService.alert({ title: "提示", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}