import { customAttribute } from "aurelia-templating";
import { UserSession } from '@app/user';
@customAttribute('required-permissions')
export class RequiredPermissionsAttribute {

  private element: HTMLElement;

  constructor(element: Element,
              private user: UserSession) {
    this.element = element as HTMLElement;
  }

  async valueChanged(permissions: string | string[]) {
    if (!Array.isArray(permissions)) {
      permissions = permissions ? permissions.split(' ') : [];
    }
    let authorized = await Promise.resolve(this.hasPermissions(permissions));
    this.element.style.display = authorized ? '' : 'none'; //TODO use ViewSlot
  }

  hasPermissions(permissions: string[]): boolean | Promise<boolean> {
    let aa = new Set(this.user.userInfo.menuVoList.map(x => x.code));
    return  !permissions.every(a => !aa.has(a));
    //return permissions.length == 0;
  }

}