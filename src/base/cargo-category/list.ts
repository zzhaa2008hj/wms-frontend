import { autoinject } from 'aurelia-framework';
import { DialogService, MessageDialogService } from 'ui';
import { NewCargoCategory } from "./new";
import { EditCargoCategory } from "./edit";
import { CargoCategoryService } from "@app/base/services/cargo-category";
import { CargoCategory } from "@app/base/models/cargo-category";

@autoinject
export class CargoCategoryList {

  selectedItem: CargoCategory;
  dataSource: kendo.data.TreeListDataSource;

  constructor(private cargoCategoryService: CargoCategoryService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
    this.dataSource = new kendo.data.TreeListDataSource({
      transport: {
        read: (options) => {
          this.cargoCategoryService.listCargoCategory()
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
    let result = await this.dialogService.open({ viewModel: NewCargoCategory, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    try {
      await this.cargoCategoryService.saveCargoCategory(cargoCategory);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async edit(item) {
    this.selectedItem = item;
    let result = await this.dialogService.open({ viewModel: EditCargoCategory, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    try {
      await this.cargoCategoryService.updateCargoCategory(cargoCategory);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.cargoCategoryService.deleteCargoCategory(id);
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
        await this.cargoCategoryService.updateState(id);
      }
      if (item.hasChildren
        && await this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级作业内容！" })) {
        await this.cargoCategoryService.updateState(id);
      }
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}