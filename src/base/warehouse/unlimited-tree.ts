import { autoinject } from 'aurelia-dependency-injection';
import { treeHelper, TreeHelper } from "@app/utils";
import { observable } from 'aurelia-framework';
import { WarehouseService } from '@app/base/services/warehouse';
import { DialogController } from 'ui';
import { Warehouse } from '@app/base/models/warehouse';

@autoinject
export class UnlimitedWarehouseTree {
  @observable
  tree: kendo.ui.TreeView;
  selectedWarehouse: any;
  dataSourceWarehouse = new kendo.data.HierarchicalDataSource({
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

  constructor(private warehouseService: WarehouseService,
              private dialogController: DialogController) {
  }

  async activate(warehouseId: string) {
    let warehouses = await this.warehouseService.listWarehouse();
    if (warehouseId) {
      this.selectedWarehouse = await this.warehouseService.getWarehouseById(warehouseId);
    }
    this.helper = treeHelper(warehouses, { childrenKey: 'sub' });
    let cRootItems = this.helper.toTree();
    this.dataSourceWarehouse.data(cRootItems);
  }

  onSelectedChange() {
    let node = this.tree.select()[0];
    if (!node) return;
    this.selectedWarehouse = this.tree.dataItem(node);
  }

  async expandTo(item: any) {
    let path = this.helper.pathFor(item);
    await expandPath(this.tree, path.map(item => item.id));
  }

  async treeChanged() {
    if (this.selectedWarehouse) {
      await this.expandTo(this.selectedWarehouse);
      let node = this.tree.findByUid(this.dataSourceWarehouse.get(this.selectedWarehouse.id).uid);
      this.tree.select(node);
    }
  }

  async save() {
    let warehouse = {} as Warehouse;
    let warehouseName = this.selectedWarehouse.name;
    let id = this.selectedWarehouse.id;
    warehouse.id = id;

    let data = this.selectedWarehouse;
    while (data.parentId) {
      id = data.parentId;
      data = this.dataSourceWarehouse.get(id);
      warehouseName = data.name + "_" + warehouseName;
    }

    warehouse.name = warehouseName;
    this.selectedWarehouse = null;
    await this.dialogController.ok(warehouse);
  }

  async cancel() {
    this.selectedWarehouse = null;
    await this.dialogController.cancel();
  }
}

function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}