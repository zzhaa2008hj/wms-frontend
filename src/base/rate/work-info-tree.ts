import { DialogController, MessageDialogService } from 'ui';
import { autoinject } from "aurelia-dependency-injection";
import { WorkInfo } from "@app/base/models/work-info";
import { WorkInfoService } from "@app/base/services/work-info";
import { treeHelper, TreeHelper } from "@app/utils";
import { observable } from 'aurelia-framework';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class WorkInfoTree {
  workInfo: WorkInfo;
  selectedWorkInfo: any;

  @observable
  tree: kendo.ui.TreeView;

  dataSourceWorkInfo = new kendo.data.HierarchicalDataSource({
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
              private workInfoService: WorkInfoService) {

  }

  async activate(workId) {
    if (workId) {
      this.selectedWorkInfo = await this.workInfoService.getWorkInfo(workId);
    }
    let wData = await this.workInfoService.listWorkInfo();
    this.helper = treeHelper(wData, { childrenKey: 'sub' });
    let wRootItems = this.helper.toTree();
    this.dataSourceWorkInfo.data(wRootItems);
  }

  async expandTo(item: any) {
    let path = this.helper.pathFor(item);
    await expandPath(this.tree, path.map(item => item.id));
  }

  async treeChanged() {
    if (this.selectedWorkInfo) {
      await this.expandTo(this.selectedWorkInfo);
      let node = this.tree.findByUid(this.dataSourceWorkInfo.get(this.selectedWorkInfo.id).uid);
      this.tree.select(node);
    }
  }

  onSelectedWorkInfoChange() {
    let node = this.tree.select()[0];
    if (!node) return;
    this.selectedWorkInfo = this.tree.dataItem(node);
  }

  async save() {
    if (this.selectedWorkInfo.hasChildren) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择子类作业内容", icon: "warning" });
      return;
    }
    this.workInfo = this.selectedWorkInfo;
    this.selectedWorkInfo = null;
    await this.dialogController.ok(this.workInfo);
  }

  async cancel() {
    this.selectedWorkInfo = null;
    await this.dialogController.cancel();
  }
}

function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}