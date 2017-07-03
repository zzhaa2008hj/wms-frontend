import { autoinject } from 'aurelia-framework';
import { DialogService, MessageDialogService } from 'ui';
import { NewWarehouse } from "./new";
import { EditWarehouse } from "./edit";
import { Warehouse } from "@app/base/models/warehouse";
import { WarehouseService } from "@app/base/services/warehouse";

@autoinject
export class WarehouseList {

  selectedItem: Warehouse;
  private dataSource: kendo.data.TreeListDataSource;

  constructor(private warehouseService: WarehouseService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
    this.dataSource = new kendo.data.TreeListDataSource({
      transport: {
        read: (options) => {
          this.warehouseService.listWarehouse()
            .then(options.success, er => options.error('', '', er));
        }
      },
      schema: {
        model: {
          id: 'id',
          parentId: 'parentId',
          expanded: true
        }
      }
    });
  }

  async add(item) {
    this.selectedItem = item;
    let result = await this.dialogService.open({ viewModel: NewWarehouse, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let warehouse = result.output;
    try {
      await this.warehouseService.saveWarehouse(warehouse);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async edit(item) {
    this.selectedItem = item;
    let result = await this.dialogService.open({ viewModel: EditWarehouse, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let warehouse = result.output;
    try {
      await this.warehouseService.updateWarehouse(warehouse);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.warehouseService.deleteWarehouse(id);
        await this.messageDialogService.alert({ title: "删除成功", message: "删除成功" });
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async changeState(item) {
    let id = item.id;
    try {
      if (!item.hasChildren) {
        await this.warehouseService.updateState(id);
      }
      if (item.hasChildren
        && await this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级库区！" })) {
        await this.warehouseService.updateState(id);
      }
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}