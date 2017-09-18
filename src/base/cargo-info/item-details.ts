import { autoinject } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate } from '@app/base/models/cargo-info';
import { DialogController } from 'ui';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class DetailsCargoItem {
  cargoItem = {} as CargoItem;

  cargoRateDataSource: kendo.data.DataSource;

  cargoRates: CargoRate[];
  unitDatasource = [] as DictionaryData[];
  //warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService) {
    this.cargoRateDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoRates);
        }
      }
    });
  }


  async activate({ cargoItemInfo }) {
    this.unitDatasource = await this.dictionaryDataService.getDictionaryDatas("unit");
    //this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoItem = cargoItemInfo;
    this.cargoItem.unitStr = this.unitDatasource.find(d => d.dictDataCode == this.cargoItem.unit).dictDataName;
    this.cargoRates = cargoItemInfo.cargoRates;
    this.convertCargoRates();
  }

  convertCargoRates() {
    this.cargoRates.map(res => {
      let unit = this.unitDatasource.find(d => res.unit == d.dictDataCode);
      //let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      if (res.cargoRateSteps) {
        res.cargoRateSteps.map(r => {
          let unit = this.unitDatasource.find(d => r.stepUnit == d.dictDataCode);
          r.stepUnitStr = unit.dictDataName;
          return r;
        });
      }
      if (unit) {
        res.unitStr = unit.dictDataName;
      }
      // if (warehouseType) {
      //   res.warehouseTypeStr = warehouseType.dictDataName;
      // }
      if (warehouseCategory) {
        res.warehouseCategoryStr = warehouseCategory.dictDataName;
      }
      if (rateType) {
        res.rateTypeStr = rateType.text;
      }
      return res;
    });
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
            options.success(e.data.cargoRateSteps);
          },
          update: (options) => {
            options.success();
          },
          destroy: (options) => {
            options.success();
          }
        },
        schema: {
          model: {
            id: 'id',
            fields: {
              stepNum: { editable: false },
              stepStart: { editable: false },
              stepEnd: { editable: false },
              stepPrice: { editable: false },
              stepUnit: { editable: false },
              remark: { editable: false }
            }
          }
        },
      },

      editable: true,
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        {
          field: 'stepPrice',
          title: '阶梯价'
        },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ]
    });
  }

}