import { autoinject, Container } from 'aurelia-dependency-injection';
import { DialogController, DialogService } from 'ui';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { ContractSearch } from '@app/base/models/contract';
@autoinject
export class RateView {
  units = [] as DictionaryData[];
  //warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  cargoCategory = {} as CargoCategory;

  validationController: ValidationController;

  cargoRateSteps: CargoRateStep[] = [];
  cargoRates: CargoRate[] = [];
  allCargoRates: CargoRate[] = [];
  rateTypes = ConstantValues.WorkInfoCategory;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;
  calculateStandards = ConstantValues.CalculateStandard;
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
    },
    autoSync: true,
    schema: {
      model: {
        id: 'id',
        fields: {
          price: { type: 'number', validation: { required: true, min: 0, max: 100000000 }, editable: true },
          rateCategory: { editable: false },
          chargeType: { editable: false },
          unitStr: { editable: false },
          rateTypeStr: { editable: false },
          pricingMode: { editable: false },
          workName: { editable: false },
          // warehouseTypeStr: { editable: false },
          cargoCategoryName: { editable: false },
          cargoSubCategoryName: { editable: false },
          warehouseCategoryStr: { editable: false },
          remark: { editable: true },
          calculateStandardStr: {editable: false}
        }
      }
    }
  });
  search = {} as ContractSearch;
  constructor(private dialogController: DialogController,
              private dialogService: DialogService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(contractRates) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    // this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.allCargoRates = contractRates;
    // 取消展开显示所有，让用户自己选择
    this.allCargoRates.forEach(item => this.codeToStr(item));
    this.cargoRateDataSource.read();

    this.cargoCategoryName = this.allCargoRates[0].cargoCategoryName;
    this.cargoCategoryId = this.allCargoRates[0].cargoCategoryId;
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
    let calculateStandard = this.calculateStandards.find(c => item.calculateStandard == c.value);
    if (calculateStandard) {
      item.calculateStandardStr = calculateStandard.text;
    }
    if (item.cargoRateSteps && item.cargoRateSteps.length > 0) {
      item.cargoRateSteps.forEach(rate => {
        let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
        if (unit) {
          rate.stepUnitName = unit.dictDataName;
        }
      });
      this.cargoRateSteps = item.cargoRateSteps;
    }
  }

  async save() {
    await this.cargoRateDataSource.sync();
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    let rate;
    this.cargoRates.forEach(r => {
      let rates = this.cargoRates.filter(e =>
        r.chargeType == e.chargeType &&
        r.rateCategory == e.rateCategory &&
        r.rateType == e.rateType &&
        r.workId == e.workId &&
        r.warehouseCategory == e.warehouseCategory
      );
      if (rates.length > 1) {
        rate = r;
      }
    });
    if (rate) {
      await this.dialogService.alert({
        title: "提示",
        message: ['仓储费', '装卸费', '其他费用'][rate.rateCategory - 1] +
        '-' + ['收费', '付费'][rate.chargeType - 1] + '-' + rate.workName + ':' + "存在多条费率"
      });
      return;
    }
    await this.dialogController.ok(this.cargoRates);
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
        schema: {
          model: {
            id: 'id',
            fields: {
              stepNum: { editable: false },
              stepStart: { editable: false },
              stepEnd: { editable: false },
              stepPrice: { editable: true, notify: true, type: 'number'},
              stepUnitStr: { editable: false },
              remark: { editable: false }
            }
          }
        },
        filter: { field: 'cargoRateId', operator: 'eq', value: e.data.id }
      },

      editable: true,
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        { field: 'stepPrice', title: '阶梯价' },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
  }

  delete(id) {
    this.cargoRates = this.cargoRates.filter(r => r.id != id);
    this.cargoRateDataSource.read();
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: this.search.workId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.search.workName = workInfo.name;
    this.search.workId = workInfo.id;
  }

  select() {
    let source = [];
    Object.assign(source, this.allCargoRates);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        source = source.filter(x => x[e] == this.search[e]);
      }
    }
    //过滤已经选择的合同费率
    source = source.filter(r => {
      return this.cargoRates.every(e => {
        let res1 = true, res2 = true, res3 = true, res4 = true, res5 = true, res6 = true, res7 = true;
        if (e.chargeType) {
          res1 = e.chargeType == r.chargeType;
        }
        if (e.rateCategory) {
          res2 = e.rateCategory == r.rateCategory;
        }
        if (e.rateType) {
          res3 = e.rateType == r.rateType;
        }
        if (e.workId) {
          res4 = e.workId == r.workId;
        }
        if (e.warehouseCategory) {
          res5 = e.warehouseCategory == r.warehouseCategory;
        }
        if (e.pricingMode) {
          res6 = e.pricingMode == r.pricingMode;
        }
        // 仓储费 阶梯费率 才有
        if (e.pricingMode == 2 && e.rateCategory == 1) {
          res7 = e.calculateStandard == r.calculateStandard;
        }
        return !(res1 && res2 && res3 && res4 && res5 && res6 && res7);
      });
    });
    //合并费率
    this.cargoRates = this.cargoRates.concat(source);
    this.cargoRateDataSource.read();
  }
}