import { autoinject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { CargoOwnershipTransferRate } from "@app/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { ConstantValues } from "@app/common/models/constant-values";

@autoinject
export class ViewCargoTransferRate {

  datasource: kendo.data.DataSource;
  cargoRates: CargoOwnershipTransferRate[];

  units = [] as DictionaryData[];
  warehouseCategorys = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  constructor(private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory,
              private cargoownershipTransferService : CargoownershipTransferService) {
  }
  /**
   * @param id  货物明细ID
   */
  async activate({id}) {
    // 单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    // 库区类别
    this.warehouseCategorys = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoRates = await this.cargoownershipTransferService.getCargoRatesByCargoItemId(id);
    this.convertCargoRates();
    this.datasource = this.dataSourceFactory.create({
      readAll: () => this.cargoRates
    });
  }

  convertCargoRates() {
    this.cargoRates.map(res => {
      let unit = this.units.find(d => res.unit == d.dictDataCode);
      let warehouseCategory = this.warehouseCategorys.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      if (unit) {
        res.unitStr = unit.dictDataName;
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