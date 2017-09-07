/**
 * Created by shun on 2017/6/19.
 */
import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { OrganizationRoleService } from "@app/base/services/organization-role";
import { DialogService } from "ui";
import {OrganizationRoleAdd} from "./new";
import {OrganizationRoleEdit} from "./edit";
import {OrganizationRole} from "@app/base/models/organization-role";

export class RoleList {
  name: string;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  roleTypes = [{value: "customize", text: "自定义角色"}, {value: "internal", text: "内建角色"}];

  constructor(@inject private roleService: OrganizationRoleService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.roleService.queryRolePage(this.name).map(res => {
        res.roleType = this.roleTypes.find(d => d.value == res.roleType).text;
        return res;
      }),
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