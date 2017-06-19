import { bindable, customElement, bindingMode, observable  } from "aurelia-framework";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { TreeHelper, treeHelper } from "../../utils";
import { WarehouseService } from "../services/warehouse";
import { NewWarehouse } from "./new";
import { EditWarehouse } from "./edit";
/**
 * Created by Hui on 2017/6/15.
 */

@customElement('warehouse-tree')
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

  constructor(private warehouseService: WarehouseService,
              private dialogService: DialogService,
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
      if (!this.selectedItem.sub) {
        await this.warehouseService.updateState(this.id);
      }
      if (this.selectedItem.sub && this.messageDialogService.confirm({ title: "注意", message: "将同时启用或禁用下级库区！" })) {
        await this.warehouseService.updateState(this.id);
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  protected async add() {
    let result = await this.dialogService.open({ viewModel: NewWarehouse, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let warehouse = result.output;
    try {
      await this.warehouseService.saveWarehouse(warehouse);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  protected async edit() {
    let result = await this.dialogService.open({ viewModel: EditWarehouse, model: this.selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let warehouse = result.output;
    try {
      await this.warehouseService.updateWarehouse(warehouse);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  protected async delete() {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.warehouseService.deleteWarehouse(this.id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}
function expandPath(tree: kendo.ui.TreeView, path: any[]): Promise<void> {
  return new Promise<void>(resolve => tree.expandPath(path, resolve));
}

