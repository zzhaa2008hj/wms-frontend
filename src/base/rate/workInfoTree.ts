import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { WorkInfo } from "@app/base/models/work-info";
import { WorkInfoService } from "@app/base/services/work-info";
import { treeHelper, TreeHelper } from "@app/utils";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class WorkInfoTree {
  workInfo: WorkInfo;
  selectedWorkInfo: any;
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
              private workInfoService: WorkInfoService) {

  }

  async activate() {
    let wData = await this.workInfoService.listWorkInfo();
    this.helper = treeHelper(wData, { childrenKey: 'sub' });
    let wRootItems = this.helper.toTree();
    this.dataSourceWorkInfo.data(wRootItems);
  }

  onSelectedWorkInfoChange() {
    let node = this.selectedWorkInfo.select()[0];
    if (!node) return;
    this.workInfo = this.selectedWorkInfo.dataItem(node);
  }

  async save() {
    await this.dialogController.ok(this.workInfo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}