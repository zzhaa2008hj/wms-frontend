import { Router } from 'aurelia-router';
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from 'ui';
import { RateService } from "@app/base/services/rate";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoCategoryTree } from '@app/base/rate/cargo-category-tree';
import { Rate } from '@app/base/models/rate';

@autoinject
export class List {
  searchName: string;
  rate = {} as Rate;
  selectedItemId: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  // warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  unit = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;
  customerCategories = ConstantValues.CustomerCategory;
  chargeCategories = ConstantValues.ChargeCategory;
  chargeTypes = ConstantValues.ChargeType;
  chargeCategory = [{ type: 1, name: '仓储费' }, { type: 2, name: '装卸费' }, { type: 3, name: '其他费用' }];

  private dataSource: kendo.data.DataSource;

  constructor(private rateService: RateService,
              private dataSourceFactory: DataSourceFactory,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private router: Router,
              private messageDialogService: MessageDialogService) {

  }

  async activate() {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    //this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.dataSource = this.dataSourceFactory.create({
      query: () => this.rateService.queryRates(this.rate).map(res => {
        let unit = this.unit.find(d => res.unit == d.dictDataCode);
        //let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
        let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
        let rateType = this.rateTypes.find(d => res.rateType == d.value);
        let chargeCategory = this.chargeCategory.find(d => d.type == res.chargeCategory);
        if (unit) {
          res.unit = unit.dictDataName;
        }
        // if (warehouseType) {
        //   res.warehouseType = warehouseType.dictDataName;
        // }
        if (warehouseCategory) {
          res.warehouseCategory = warehouseCategory.dictDataName;
        }
        if (rateType) {
          res.rateTypeStr = rateType.text;
        }
        if (chargeCategory) {
          res.chargeCategoryStr = chargeCategory.name;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: CargoCategoryTree, model: this.rate.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.rate.cargoCategoryName = cargoCategory.categoryName;
    this.rate.cargoCategoryId = cargoCategory.id;
  }

  select() {
    this.dataSource.read();
  }

  reset() {
    this.rate = {} as Rate;
    this.dataSource.read();
  }

  async copyRate() {
    if (!this.selectedItemId) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择费率!" });
      return;
    }
    this.router.navigateToRoute('new', { id: this.selectedItemId });
  }

  /**
   * 单选数据
   */
  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    this.selectedItemId = grid.dataItem(selectedRow).id;
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
      let confirmed = await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" });
      if (confirmed) {
        await this.rateService.deleteRate(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

}