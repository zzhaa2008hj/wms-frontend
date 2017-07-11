import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { CargoInfoService, CargoInfoCriteria } from "@app/base/services/cargo-info";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';

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

  constructor(private cargoInfoService: CargoInfoService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory) {

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
}