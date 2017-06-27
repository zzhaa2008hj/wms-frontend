import { autoinject, observable, bindable, customElement, bindingMode } from "aurelia-framework";
import { treeHelper, TreeHelper } from "@app/utils";

@customElement('menu-tree')
@autoinject
export class MenuTree {

  @bindable({ attribute: 'selected-item', defaultBindingMode: bindingMode.twoWay })
  @observable
  selectedItem: any = null;

  @bindable({ attribute: 'checked-items', defaultBindingMode: bindingMode.twoWay })
  @observable
  checkedItems: any[];

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
        children: node => node.data.submenu,
        hasChildren: node => node.data.submenu && node.data.submenu.length > 0
      }
    }
  });

  private helper: TreeHelper<any>;


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
    this.helper = treeHelper(items, { childrenKey: 'submenu' });
    let rootItems = this.helper.toTree();
    this.dataSource.data(rootItems.map(item => ({ id: item.id, data: item }))); // 放data字段避免冲突
    if (this.selectedItem && this.widget) { //如果selected-item已经先绑定
      await this.expandTo(this.selectedItem);
      let node = this.widget.findByUid(this.dataSource.get(this.selectedItem.id).uid);
      this.widget.select(node);
    }
    if (this.checkedItems) {
      let checked = new Set(this.checkedItems.map(item => item.id));
      forEach(this.dataSource, node => node.checked = checked.has(node.data.id));
    }
  }

  protected async selectedItemChanged() {
    if (!this.selectedItem) return;
    let m = this.dataSource.get(this.selectedItem.id);
    if (m == null) return; //data 还没初始化
    if (!m.uid) {
      await this.expandTo(m);
    }
    let node = this.widget.findByUid(m.uid);
    this.widget.select(node);
  }

  protected async checkedItemsChanged() {
    if (this.data && this.checkedItems) {
      let checked = new Set(this.checkedItems.map(item => item.id));
      forEach(this.dataSource, node => node.checked = checked.has(node.data.id));
    }
  }

// show checked node IDs on datasource change
  protected onCheck() {
    let nodes: any = this.dataSource.view();
    this.checkedItems = collectCheckedNodes(nodes as any[]).map(node => node.data);
  }
}

function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}

function collectCheckedNodes(nodes: any[], arr: any[] = []) {
  for (let node of nodes) {
    if (node.checked) arr.push(node);
    if (node.hasChildren) {
      collectCheckedNodes(node.children.view(), arr);
    }
  }
  return arr;
}

function forEach(dataSource: kendo.data.HierarchicalDataSource, fn: (node: any) => void) {
  let nodes: any = dataSource.view();
  for (let node of nodes) {
    fn(node);
    if (node.hasChildren) {
      forEach(node.children, fn);
    }
  }
}