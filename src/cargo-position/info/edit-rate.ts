import { autoinject } from 'aurelia-dependency-injection';
import { DictionaryData } from "@app/base/models/dictionary";
import { Contract, ContractSearch } from "@app/base/models/contract";
import { DialogController, DialogService } from "ui";
import { ConstantValues } from "@app/common/models/constant-values";
import { CargoCategoryTree } from "@app/base/rate/cargo-category-tree";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { Rate, RateStep } from "@app/base/models/rate";
import { ContractService } from "@app/base/services/contract";
import { ContractVo } from "@app/base/models/contractVo";

@autoinject
export class EditRate {
  search = {} as ContractSearch;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;
  rateTypes = ConstantValues.WorkInfoCategory;
  warehouseCategory = [] as DictionaryData[];
  source: Rate[];
  filterBaseRateSteps: Rate[];
  datasource: kendo.data.DataSource;
  baseRateAndSteps: Rate[];
  baseRateStep: RateStep[];
  contract = {} as Contract;
  unit = [] as DictionaryData[];

  constructor(private dialogController: DialogController,
              private contractService: ContractService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.filterBaseRateSteps);
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
            price: {
              type: 'number',
              validation: { required: true, min: 0, max: 1000000000000000 },
              editable: true,
              nullable: false
            },
            rateCategory: { editable: false },
            chargeCategory: { editable: false },
            chargeType: { editable: false },
            unitStr: { editable: false },
            rateTypeStr: { editable: false },
            pricingMode: { editable: false },
            workName: { editable: false },
            cargoCategoryName: { editable: false },
            cargoSubCategoryName: { editable: false },
            warehouseCategoryStr: { editable: false },
            remark: { editable: false }
          }
        }

      }
    });
  }

  async activate(params: any) {
    let contractVo: ContractVo = await this.contractService.getContract(params.id);
    this.contract = contractVo.contract;
    this.datasource.data(params.cargoRates);
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");

    let rates = await this.contractService.getBaseRate();
    rates.map(res => {
      let unit = this.unit.find(d => res.unit == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
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
      if (res.rateStep) {
        res.rateStep.forEach(rs => {
          let stepUnit = this.unit.find(d => rs.stepUnit == d.dictDataCode);
          if (stepUnit) {
            rs.stepUnitStr = stepUnit.dictDataName;
          }
        });
      }
      return res;
    });
    this.baseRateAndSteps = rates;
    this.filterBaseRateSteps = [];
    this.baseRateStep = await this.contractService.getBaseRateStep();
    this.baseRateStep.map(res => {
      if (res.stepUnit) {
        res.stepUnitStr = this.unit.find(r => r.dictDataCode == res.stepUnit).dictDataName;
      }
      return res;
    });
  }

  delete(e) {
    this.filterBaseRateSteps = this.filterBaseRateSteps.filter(r => r.id != e.id);
    this.datasource.remove(e);
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: this.search.workId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.search.workName = workInfo.name;
    this.search.workId = workInfo.id;
  }

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: CargoCategoryTree, model: this.search.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.search.cargoCategoryName = cargoCategory.categoryName;
    this.search.cargoCategoryId = cargoCategory.id;
  }

  select() {
    this.source = [];
    Object.assign(this.source, this.baseRateAndSteps);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        this.source = this.source.filter(x => x[e] == this.search[e]);
      }
    }
    //过滤掉已经选择的费率
    this.source = this.source.filter(r => {
      return this.filterBaseRateSteps.every(e => r.id != e.id);
    });
    //合并费率
    this.filterBaseRateSteps = this.filterBaseRateSteps.concat(this.source);
    this.datasource.read();
    this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: this.contract.contractType });
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.baseRateStep);
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
              stepPrice: {
                editable: true,
                notify: true,
                type: 'number',
                validation: { required: true, min: 0, max: 1000000000000000 },
                title: '阶梯价'
              },
              stepUnit: { editable: false },
              remark: { editable: false }
            }
          }
        },
        filter: { field: 'rateId', operator: 'eq', value: e.data.id }
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
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
  }

  edit(e) {
    let mode = e.detail.model.pricingMode;
    if (mode == 1) {
      return;
    }
    let dataGrid = e.detail.sender;
    dataGrid.closeCell();
  }

  async save() {
    let cargoRates = this.datasource.data();
    await this.dialogController.ok(cargoRates);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}