import { customAttribute } from "aurelia-templating";

@customAttribute('required-permissions')
export class RequiredPermissionsAttribute {

  private element: HTMLElement;

  constructor(element: Element) {
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
    return permissions.length == 0;
  }

}