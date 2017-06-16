import { bindable, customElement } from "aurelia-framework";
import { autoinject } from "aurelia-dependency-injection";
import { TreeHelper, treeHelper } from "./treeUtil";
import { bindingMode, observable } from "aurelia-framework";
import { MessageDialogService } from "ui";
import { WorkInfoService } from "../services/workInfo";
import { Router } from "aurelia-router";
/**
 * Created by Hui on 2017/6/15.
 */

@customElement('work-info-tree')
@autoinject
export class Tree {
  @observable
  widget: kendo.ui.TreeView;

  @bindable
  @observable
  data: any[] = [];

  @bindable({ attribute: 'selected-item', defaultBindingMode: bindingMode.twoWay })
  @observable
  selectedItem: any;
  id: string = "";

  private helper: TreeHelper<any>;

  private dataSource = new kendo.data.HierarchicalDataSource({
    data: this.data,
    schema: {
      model: {
        children: 'sub',
        hasChildren: item => item.sub && item.sub.length > 0
      }
    }
  });

  constructor(private router: Router,
              private workInfoService: WorkInfoService,
              private messageDialogService: MessageDialogService) {
  }

  async expandTo(item: any) {
    let path = this.helper.pathFor(item);
    await expandPath(this.widget, path.map(item => item.id));
  }

  protected async dataChanged() {
    this.helper = treeHelper(this.data, { childrenKey: 'sub' });
    let rootItems = this.helper.toTree();
    this.dataSource.data(rootItems);
    if (this.selectedItem && this.widget) { //如果selected-item已经先绑定
      await this.expandTo(this.selectedItem);
      let node = this.widget.findByUid(this.dataSource.get(this.selectedItem.id).uid);
      this.widget.select(node);
    }
  }

  protected async widgetChanged() {
    if (this.selectedItem) {
      await this.expandTo(this.selectedItem);
      let node = this.widget.findByUid(this.dataSource.get(this.selectedItem.id).uid);
      this.widget.select(node);
    }
  }

  protected async selectedItemChanged() {
    if (!this.selectedItem) return;
    let item = this.dataSource.get(this.selectedItem.id);
    if (item == null) return; //data 还没初始化
    if (!item.uid) {
      await this.expandTo(item);
    }
    let node = this.widget.findByUid(item.uid);
    this.widget.select(node);
  }

  protected onSelectionChange() {
    let node = this.widget.select()[0];
    if (!node) return;
    this.selectedItem = this.widget.dataItem(node);
    this.id = this.selectedItem.id;
  }

  protected async changeState() {
    try {
      await this.workInfoService.updateState(this.id);
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}
function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}

