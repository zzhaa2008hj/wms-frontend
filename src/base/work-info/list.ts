import { autoinject } from 'aurelia-framework';
import { DialogService, MessageDialogService } from 'ui';
import { NewWorkInfo } from "./new";
import { EditWorkInfo } from "./edit";
import { WorkInfo } from "@app/base/models/work-info";
import { WorkInfoService } from "@app/base/services/work-info";

@autoinject
export class WorkInfoList {

  selectedItem: WorkInfo;

  private dataSource: kendo.data.TreeListDataSource;

  constructor(private workInfoService: WorkInfoService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
    this.dataSource = new kendo.data.TreeListDataSource({
      transport: {
        read: (options) => {
          this.workInfoService.listWorkInfo()
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
    let result = await this.dialogService.open({ viewModel: NewWorkInfo, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    try {
      await this.workInfoService.saveWorkInfo(workInfo);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async edit(item) {
    this.selectedItem = item;
    let result = await this.dialogService.open({ viewModel: EditWorkInfo, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    try {
      await this.workInfoService.updateWorkInfo(workInfo);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.workInfoService.deleteWorkInfo(id);
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
        await this.workInfoService.updateState(id);
      }
      if (item.hasChildren
        && await this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级作业内容！" })) {
        await this.workInfoService.updateState(id);
      }
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}