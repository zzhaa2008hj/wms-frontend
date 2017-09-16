import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory, requiredPermissionsAttributeResult } from "@app/utils";
import { CargoInfoService, CargoInfoCriteria } from "@app/base/services/cargo-info";
import { OutstockInventoryService } from "@app/outstock/services/inventory";
import { Router } from 'aurelia-router';
import { UserSession } from '@app/user';

@autoinject
export class CargoInfoList {
  cargoInfoCriteria: CargoInfoCriteria;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  batchNumber: string;
  infoId: string;

  constructor(private cargoInfoService: CargoInfoService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory,
              private router: Router,
              private outstockInventoryService: OutstockInventoryService,
              private user: UserSession) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoInfoService.queryCargoInfo(this.cargoInfoCriteria),
      pageSize: 10
    });
  }

  async delete(id) {
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该入库指令吗？" });
    if (confirm) {
      try {
        await this.cargoInfoService.delete(id);
        await this.messageDialogService.alert({ title: "", message: "删除成功！" });
        this.dataSource.read();
      } catch (err) {
        await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
      }
    }
  }

  select() {
    this.dataSource.read();
  }

  /**
   * 单选数据
   */
  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    let dataItem = grid.dataItem(selectedRow);
    this.infoId = dataItem.id;
    this.batchNumber = dataItem.batchNumber;
  }

  /**
   * 生成出库清单
   */
  async createOutstockInventory() {
    if (!this.batchNumber) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择指令单', icon: "error" });
      return;
    }
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: "生成出库清单？" });
    if (!confirm) return;
    try {
      await this.outstockInventoryService.createOutstockInventory(this.batchNumber);
      await this.messageDialogService.confirm({ title: "提示", message: "生成成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async changeHistory() {
    if (!this.infoId) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择指令单', icon: "error" });
      return;
    }
    this.router.navigateToRoute('changeHistory', { id: this.infoId });
  }

  requiredPermissions(sourceCode: string) {
    return requiredPermissionsAttributeResult(sourceCode, this.user.userInfo.menuVoList);
  }

}