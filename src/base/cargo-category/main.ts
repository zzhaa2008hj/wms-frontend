import { autoinject } from "aurelia-dependency-injection";
import { observable } from "aurelia-framework";
import { CargoCategoryService } from "../services/cargo-category";

@autoinject
export class CargoCategory {
  @observable
  selectedItem: any;

  cargoCategoryItems: any;

  constructor(private cargoCategoryService: CargoCategoryService) {
  }

  async activate() {
    this.cargoCategoryItems = await this.cargoCategoryService.listCargoCategory();
  }


}