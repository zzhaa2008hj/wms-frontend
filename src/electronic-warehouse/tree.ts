import { autoinject, bindable, bindingMode, customElement, observable } from "aurelia-framework";

import { TreeHelper, treeHelper } from "@app/utils";

@customElement('warehouse-tree')
@autoinject
export class WarehouseTree {

  @bindable({ attribute: 'selected-item', defaultBindingMode: bindingMode.twoWay })
  @observable
  selectedItem: any = null;

  @bindable
  @observable
  data: any[] = [];

  @observable
  widget: kendo.ui.TreeView;

  private dataSource = new kendo.data.HierarchicalDataSource({
    data: this.data,
    schema: {
      model: {
        id: 'id',
        children: 'area',
        hasChildren: item => item.area && item.area.length > 0
      }
    }
  });

  private helper: TreeHelper<any>;

  /**
   *  树节点的展开
   * @param item 
   */
  async expandTo(item: any) {
    let path = this.helper.pathFor(item);
    await expandPath(this.widget, path.map(item => item.id));
  }

  onSelectionChange() {
    let node = this.widget.select()[0];
    if (!node) return;
    this.selectedItem = this.widget.dataItem(node);
  }

  protected async widgetChanged() {
    if (this.selectedItem) {
      await this.expandTo(this.selectedItem);
      let node = this.widget.findByUid(this.dataSource.get(this.selectedItem.id).uid);
      this.widget.select(node);
    }
  }

  protected async dataChanged() {
    let items = this.data;
    this.helper = treeHelper(items, { childrenKey: 'area' });
    let rootItems = this.helper.toTree();
    this.dataSource.data(rootItems);
    if (this.selectedItem && this.widget) { //如果selected-item已经先绑定
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
    } else if (item.uid != this.selectedItem.uid) {
      let node = this.widget.findByUid(item.uid);
      this.widget.select(node);
    }
  }



}

function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}