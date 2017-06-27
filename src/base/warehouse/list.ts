import { autoinject } from 'aurelia-framework';
import { DialogService, MessageDialogService } from 'ui';
import { NewWarehouse } from "./new";
import { EditWarehouse } from "./edit";
import { Warehouse } from "@app/base/models/warehouse";
import { WarehouseService } from "@app/base/services/warehouse";

@autoinject
export class WarehouseList {

  selectedItem: Warehouse;

  private dataSource = new kendo.data.TreeListDataSource({
    data: [],
    schema: {
      model: {
        id: 'id',
        parentId: 'parentId',
        fields: {
          id: { type: 'string', editable: false, nullable: false },
          parentId: { nullable: true, type: 'string' },
          name: { validation: { required: true } },
          type: { validation: { required: true } },
          category: { validation: { required: true } },
          remark: { type: 'string' },
        },
        expanded: true
      }
    }
  });

  constructor(private warehouseService: WarehouseService,
    private dialogService: DialogService,
    private messageDialogService: MessageDialogService) {

  }

  async activate() {
    this.initData();
  }

  async initData() {
    let data = await this.warehouseService.listWarehouse();
    this.dataSource.data(data);
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
      this.initData();
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
      this.initData();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.warehouseService.deleteWarehouse(id);
        await this.messageDialogService.alert({ title: "删除成功", message: "删除成功" });
        this.initData();
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
        && await this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级作业内容！" })) {
        await this.warehouseService.updateState(id);
      }
      await this.messageDialogService.alert({ title: "启用禁用成功", message: "启用禁用成功" });
      this.initData();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}