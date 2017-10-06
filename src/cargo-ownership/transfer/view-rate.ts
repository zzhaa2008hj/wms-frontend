import { autoinject } from 'aurelia-dependency-injection';
import { DialogController } from 'ui';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class RateView {
  units = [] as DictionaryData[];
  //warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  cargoCategory = {} as CargoCategory;

  cargoRateSteps: CargoRateStep[] = [];
  cargoRates: CargoRate[] = [];

  rateTypes = ConstantValues.WorkInfoCategory;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;
  cargoCategoryName: string;
  cargoCategoryId: string;

  cargoRateDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoRates);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });
  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(cargoRates) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoRates = cargoRates;
    this.cargoRates.forEach(item => this.codeToStr(item));
    this.cargoRateDataSource.read();

    this.cargoCategoryName = this.cargoRates[0].cargoCategoryName;
    this.cargoCategoryId = this.cargoRates[0].cargoCategoryId;
  }

  codeToStr(item) {
    let unit = this.units.find(d => item.unit == d.dictDataCode);
    if (unit) {
      item.unitStr = unit.dictDataName;
    }
    let rateType = this.rateTypes.find(r => r.value == item.rateType);
    if (rateType) {
      item.rateTypeStr = rateType.text;
    }
    let warehouseCategory = this.warehouseCategory.find(d => item.warehouseCategory == d.dictDataCode);
    if (warehouseCategory) {
      item.warehouseCategoryStr = warehouseCategory.dictDataName;
    }
    if (item.cargoRateSteps && item.cargoRateSteps.length > 0) {
      item.cargoRateSteps.forEach(rate => {
        let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
        if (unit) {
          rate.stepUnitStr = unit.dictDataName;
        }
      });
      this.cargoRateSteps = item.cargoRateSteps;
    }
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.cargoRateSteps);
          },
          update: (options) => {
            options.success();
          },
          destroy: (options) => {
            options.success();
          }
        },
        filter: { field: 'cargoRateId', operator: 'eq', value: e.data.id }
      },
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        { field: 'stepPrice', title: '阶梯价' },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
    });
  }

}