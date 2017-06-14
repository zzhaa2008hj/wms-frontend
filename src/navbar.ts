
import { customElement, containerless } from "aurelia-templating";
import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";

@customElement('ui-navbar')
@containerless
@autoinject
export class NavBar {



  constructor(private router: Router) {

  }

  toggleSidebar() {
    // this.user.settings.sidebar.condensed = !this.user.settings.sidebar.condensed;
  }

  changePassword() {
    this.router.navigateToRoute('changePassword');
  }

  logout() {
    // this.user.logout();
  }

}