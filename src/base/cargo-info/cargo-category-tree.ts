import { DialogController, MessageDialogService } from 'ui';
import { autoinject } from "aurelia-dependency-injection";
import { treeHelper, TreeHelper } from "@app/utils";
import { CargoCategory } from "@app/base/models/cargo-category";
import { CargoCategoryService } from '@app/base/services/cargo-category';
import { observable } from 'aurelia-framework';

@autoinject
export class CargoCategoryTree {
  cargoCategory = {} as CargoCategory;;
  selectedCargoCategory: any;
  @observable
  tree: kendo.ui.TreeView;
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
              private messageDialogService: MessageDialogService,
              private cargoCategoryService: CargoCategoryService) {

  }

  async activate(categoryId) {
    if (categoryId) {
      this.selectedCargoCategory = await this.cargoCategoryService.getCargoCategory(categoryId);
    }
    let cData = await this.cargoCategoryService.listCargoCategory(true);
    this.helper = treeHelper(cData, { childrenKey: 'sub' });
    let cRootItems = this.helper.toTree();
    this.dataSourceCargoCategory.data(cRootItems);
  }

  onSelectedCargoCategoryChange() {
    let node = this.tree.select()[0];
    if (!node) return;
    this.selectedCargoCategory = this.tree.dataItem(node);
  }

  async expandTo(item: any) {
    let path = this.helper.pathFor(item);
    await expandPath(this.tree, path.map(item => item.id));
  }

  async treeChanged() {
    if (this.selectedCargoCategory) {
      await this.expandTo(this.selectedCargoCategory);
      let node = this.tree.findByUid(this.dataSourceCargoCategory.get(this.selectedCargoCategory.id).uid);
      this.tree.select(node);
    }
  }

  async save() {
    if (this.selectedCargoCategory.hasChildren) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择子类货物类别", icon: "warning" });
      return;
    }
    let categoryName = this.selectedCargoCategory.categoryName;
    let id = this.selectedCargoCategory.id;
    this.cargoCategory.id = id;
    let data = this.selectedCargoCategory;
    while (data.parentId) {
      id = data.parentId;
      data = this.dataSourceCargoCategory.get(id);
      categoryName = data.categoryName + "-" + categoryName;
    }
    this.cargoCategory.categoryName = categoryName;
    this.selectedCargoCategory = null;
    await this.dialogController.ok(this.cargoCategory);
  }

  async cancel() {
    this.selectedCargoCategory = null;
    await this.dialogController.cancel();
  }
}

function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}