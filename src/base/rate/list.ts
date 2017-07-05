import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { RateService } from "@app/base/services/rate";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
@autoinject
export class Rate {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  unit = [] as DictionaryData[];
  private dataSource: kendo.data.DataSource;

  constructor(private rateService: RateService,
              private dataSourceFactory: DataSourceFactory,
              private dictionaryDataService: DictionaryDataService,
              private messageDialogService: MessageDialogService) {  
    
  }

  async activate() {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");       

    this.dataSource = this.dataSourceFactory.create({
      query: () => this.rateService.queryRates({ name: this.searchName }).map(res => {
        let unit = this.unit.find(d => res.unit == d.dictDataCode);
        let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
        let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
        if (unit) {
          res.unit = unit.dictDataName;          
        }
        if (warehouseType) {
          res.warehouseType = warehouseType.dictDataName;
        }
        if (warehouseCategory) {
          res.warehouseCategory = warehouseCategory.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });   
  }

  select() {
    this.dataSource.read();
  }

  async changeState(id) {
    try {
      await this.rateService.updateState(id);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async delete(id) {
    try {
      let confirmed = await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })
      if (confirmed) {
        await this.rateService.deleteRate(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

}