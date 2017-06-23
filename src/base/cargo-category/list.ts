import { autoinject } from 'aurelia-framework';
import { DialogService, MessageDialogService } from 'ui';
import { NewCargoCategory } from "./new";
import { EditCargoCategory } from "./edit";
import TreeListDataSource = kendo.data.TreeListDataSource;
import { CargoCategory } from "../models/cargo-category";
import { CargoCategoryService } from "../services/cargo-category";

@autoinject
export class CargoCategoryList {

  selectedItem: CargoCategory;

  private dataSource = new kendo.data.TreeListDataSource({
    data: [],
    schema: {
      model: {
        id: 'id',
        parentId: 'parentId',
        fields: {
          id: { type: 'string', editable: false, nullable: false },
          parentId: { nullable: true, type: 'string' },
          categoryName: { validation: { required: true } },
          specs: { validation: { required: true } },
          remark: { type: 'string' },
        },
        expanded: true
      }
    }
  });

  constructor(private cargoCategoryService: CargoCategoryService,
    private dialogService: DialogService,
    private messageDialogService: MessageDialogService) {

  }

  async activate() {
    this.initData();
  }

  async initData() {
    let data = await this.cargoCategoryService.listCargoCategory();
    console.log(data);
    this.dataSource.data(data);
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
      this.initData();
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
      this.initData();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.cargoCategoryService.deleteCargoCategory(id);
        await this.messageDialogService.alert({ title: "删除成功", message: "删除成功" });
        this.initData();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async changeState(item) {
    let id = item.id;
    console.log(item);
    try {
      if (!item.hasChildren) {
        await this.cargoCategoryService.updateState(id);
      }
      if (item.hasChildren
        && await this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级作业内容！" })) {
        await this.cargoCategoryService.updateState(id);
      }
      await this.messageDialogService.alert({ title: "启用禁用成功", message: "启用禁用成功" });
      this.initData();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}