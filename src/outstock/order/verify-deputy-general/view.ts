import { autoinject } from "aurelia-dependency-injection";
import {  } from "@app/base/services/";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoRate } from '@app/base/models/cargo-info';

@autoinject
export class ViewRate {

  datasource: kendo.data.DataSource;
  cargoRates: CargoRate[];

  units = [] as DictionaryData[];
  warehouseTypes = [] as DictionaryData[];
  warehouseCategorys = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  constructor(private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory,
              private cargoInfoService: CargoInfoService) {
  }
  /**
   * @param id  货物明细ID
   */
  async activate({id}) {
    // 单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    // 库区性质
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    // 库区类别
    this.warehouseCategorys = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoRates = await this.cargoInfoService.getCargoRatesByCargoItemId(id);
    this.convertCargoRates();
    
    this.datasource = this.dataSourceFactory.create({
      readAll: () => this.cargoRates
    });
     
  }

  convertCargoRates() {
    this.cargoRates.map(res => {
      let unit = this.units.find(d => res.unit == d.dictDataCode);
      let warehouseType = this.warehouseTypes.find(d => res.warehouseType == d.dictDataCode);
      let warehouseCategory = this.warehouseCategorys.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      if (unit) {
        res.unitStr = unit.dictDataName;
      }
      if (warehouseType) {
        res.warehouseTypeStr = warehouseType.dictDataName;
      }
      if (warehouseCategory) {
        res.warehouseCategoryStr = warehouseCategory.dictDataName;
      }
      if (rateType) {
        res.rateTypeStr = rateType.text;
      }
      return res;
    });
  }
}