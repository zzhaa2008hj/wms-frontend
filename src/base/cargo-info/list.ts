import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { CargoInfoService, CargoInfoCriteria } from "@app/base/services/cargo-info";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { OutstockInventoryService } from "@app/outstock/services/inventory";

@autoinject
export class CargoInfoList {
  cargoInfoCriteria: CargoInfoCriteria;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  warehouseTypes = [] as DictionaryData[];
  batchNumber: string;

  constructor(private cargoInfoService: CargoInfoService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory,
              private outstockInventoryService: OutstockInventoryService) {

  }

  async activate() {
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoInfoService.queryCargoInfo(this.cargoInfoCriteria).map(res => {
        let warehouseType = this.warehouseTypes.find(d => res.warehouseType == d.dictDataCode);
        if (warehouseType) {
          res.warehouseTypeStr = warehouseType.dictDataName;
        }
        return res;
      }),
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
    try {
      await this.outstockInventoryService.createOutstockInventory(this.batchNumber);
      let res = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库清单" });
      if (!res) {
        this.dataSource.read();
        return;
      }
      let inventory = await this.outstockInventoryService.getOutstockInventoryByBatchNumber(this.batchNumber);
      // 跳转 到出库清单页面
      window.location.href = '#/outstock/inventory/' + inventory.id + '/view';
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}