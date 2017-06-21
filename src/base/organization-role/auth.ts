/**
 * Created by shun on 2017/6/20.
 */
import { Router} from "aurelia-router";
import { autoinject, inject} from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { OrganizationRoleService} from "../services/organization-role";
import { Menu} from "../models/menu";

export class AuthMenu {

  id: string;
  menuItems: Menu[];
  assignedMenuItems: Menu[];

  constructor(@inject private router: Router,
              @inject private organizationRoleService: OrganizationRoleService,
              @inject private dialogService: DialogService) {
  }

  async activate(params) {
    this.id = params.id;
    this.menuItems = await this.organizationRoleService.getOrgMenu();
    this.assignedMenuItems = await this.organizationRoleService.getOrgRoleMenu(params.id);

  }

  async assignOrgRoleMenu() {
    let menuIds = this.assignedMenuItems.map(menu => menu.id);
    try {
      await this.organizationRoleService.assignOrgRoleMenu(this.id, menuIds);
      await this.dialogService.alert({ title: "提示", message: "菜单授权成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}