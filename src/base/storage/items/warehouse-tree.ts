import { inject} from "aurelia-dependency-injection";
import { treeHelper, TreeHelper } from "@app/utils";
import { observable } from 'aurelia-framework';
import { WarehouseService } from '@app/base/services/warehouse';
import { DialogController, DialogService } from 'ui';
import { Warehouse } from '@app/base/models/warehouse';

export class WarehouseTree {
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
  
  constructor(@inject private warehouseService: WarehouseService,
              @inject private dialogController: DialogController,
              @inject private dialogService: DialogService) {
  }

  async activate() {
    let warehouses = await this.warehouseService.listWarehouse();
    this.helper = treeHelper(warehouses, { childrenKey: 'sub' });
    let cRootItems = this.helper.toTree();
    this.dataSourceWarehouse.data(cRootItems);
  }

  onSelectedChange() {
    let node = this.tree.select()[0];
    if (!node) return;
    this.selectedWarehouse = this.tree.dataItem(node);
  }

  async save() {
    if (this.selectedWarehouse.hasChildren) {
      await this.dialogService.alert({ title: "提示", message: "请选择子类货物类别", icon: "warning" });
      return;
    }
    let warehouse = {} as Warehouse;
    let warehouseName = this.selectedWarehouse.name;
    let id = this.selectedWarehouse.id;
    warehouse.id = id;

    let data = this.selectedWarehouse;
    while (data.parentId) {
      id = data.parentId;
      data = this.dataSourceWarehouse.get(id);
      warehouseName = data.name + "-" + warehouseName;
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