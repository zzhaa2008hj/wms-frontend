/**
 * Created by shun on 2017/6/20.
 */
import { Router} from "aurelia-router";
import { inject} from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { OrganizationRoleService} from "@app/base/services/organization-role";
import { Menu} from "@app/base/models/menu";
import { OrganizationRole } from "@app/base/models/organization-role";

export class AuthMenu {
  disabled: boolean = false;
  id: string;
  menuItems: Menu[] = [];
  assignedMenuItems: Menu[] = [];
  orgRole: OrganizationRole;
  menuTree: any;
  constructor(@inject private router: Router,
              @inject private organizationRoleService: OrganizationRoleService,
              @inject private dialogService: DialogService) {
  }

  async activate(params) {
    this.id = params.id;
    this.orgRole = await this.organizationRoleService.getOrgRole(params.id);
    let menus = await this.organizationRoleService.getOrgMenu();
    if (menus.length != 0) this.menuItems = menus;
    let assignedMenus = await this.organizationRoleService.getOrgRoleMenu(params.id);
    if (assignedMenus.length != 0) {
      // 选中效果需要node对象
      let assigned = new Set(assignedMenus.map(menu => menu.id));
      let parentIdAll = new Set(this.menuItems.map(item => item.parentId));
      this.assignedMenuItems = menus.filter(item => assigned.has(item.id) && !parentIdAll.has(item.id));
    }
  }

  async assignOrgRoleMenu() {
    // 选中的
    let checked = this.assignedMenuItems.filter(item => item.menuType != -1);
    // 其中只要有一个选中的父
    console.log(this.menuTree);
    let indeterminated = this.menuTree.nodes.filter(node => node.indeterminate == true && node.model.type != -1).map(node => node.model);
    let menuIds = checked.concat(indeterminated).map(item => item.id);
    this.disabled = true;
    try {
      await this.organizationRoleService.assignOrgRoleMenu(this.id, menuIds);
      await this.dialogService.alert({ title: "提示", message: "菜单授权成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  /* tslint:disable */
  getIcon(type: number, parentId: any) {
    if (type == 0) {
      return "fa fa-list-alt text-primary";
    } else if (type == 1) {
      return "fa fa-bolt  text-warning";
    } else if (type == -1 && !parentId) {
      return "fa fa-window-maximize text-info";
    } else if (type == -1 && parentId) {
      return "fa fa-window-restore text-info";
    }
    return null;
  }
  /* tslint:enable */

}