import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { treeHelper, TreeHelper } from "@app/utils";
import { CargoCategoryService } from "@app/base/services/cargo-category";
import { CargoCategory } from "@app/base/models/cargo-category";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class CargoCategoryTree {
  cargoCategory: CargoCategory;
  selectedCargoCategory: any;
  dataSourceCargoCategory = new kendo.data.HierarchicalDataSource({
    data: [],
    schema: {
      model: {
        id: 'id',
        children: 'sub',
        hasChildren: item => item.sub && item.sub.length > 0
      }
    }
  });
  private helper: TreeHelper<any>;

  constructor(private dialogController: DialogController,
              private cargoCategoryService: CargoCategoryService) {

  }

  async activate() {
    let cData = await this.cargoCategoryService.listCargoCategory();
    this.helper = treeHelper(cData, { childrenKey: 'sub' });
    let cRootItems = this.helper.toTree();
    this.dataSourceCargoCategory.data(cRootItems);
  }

  onSelectedCargoCategoryChange() {
    let node = this.selectedCargoCategory.select()[0];
    if (!node) return;
    this.cargoCategory = this.selectedCargoCategory.dataItem(node);
  }

  async save() {
    await this.dialogController.ok(this.cargoCategory);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}