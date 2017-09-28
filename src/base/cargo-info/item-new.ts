import { CargoCategoryTree } from "@app/base/cargo-category/tree";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { DialogController, DialogService } from 'ui';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoItem, CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { ContractSearch } from '@app/base/models/contract';
import { WorkInfoTree } from "@app/base/rate/work-info-tree";

@autoinject
export class NewCargoItem {
  cargoItem = {} as CargoItem;

  unitDatasource = [] as DictionaryData[];
  //warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  cargoCategory = {} as CargoCategory;

  cargoRateDataSource: kendo.data.DataSource;
  validationController: ValidationController;

  contractCargoRates: CargoRate[];
  contractCargoRateSteps: CargoRateStep[];

  cargoRates: CargoRate[] = [];
  allCargoRates: CargoRate[];
  rateTypes = ConstantValues.WorkInfoCategory;

  search = {} as ContractSearch;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;

  constructor(private cargoInfoService: CargoInfoService,
              private dialogController: DialogController,
              private dialogService: DialogService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {

    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

    this.cargoRateDataSource = new kendo.data.DataSource({
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
      schema: {
        model: {
          id: 'id',
          fields: {
            price: { type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, editable: true },
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
            remark: { editable: false }
          }
        }
      }
    });
  }

  aa(e) {
    let mode = e.detail.model.pricingMode;
    if (mode == 1) {
      return;
    }
    let dataGrid = e.detail.sender;
    dataGrid.closeCell();
  }

  async activate({ contractId, cargoItemInfo }) {
    this.unitDatasource = await this.dictionaryDataService.getDictionaryDatas("unit");
    // this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    //免堆期的默认值
    this.cargoItem.freeDays = 0;
    this.cargoItem.orderNumber = 0;
    this.cargoItem.orderQuantity = 0;
    //该合同下所有货物的费率
    this.contractCargoRates = await this.cargoInfoService.getContractCargoRates(contractId);
    //该合同下所有货物的阶梯费率
    this.contractCargoRateSteps = await this.cargoInfoService.getContractCargoRateSteps(contractId);
    //编辑时带过来的信息
    if (cargoItemInfo) {
      //要把费率list中的已修改的数据修改掉
      this.cargoItem = cargoItemInfo;
      // this.convertCargoRates();
      this.cargoRates = this.cargoItem.cargoRates;
      this.cargoItem.cargoRates.forEach(r => {
        //let id = r.id;
        // this.cargoRates.every((res, index, arr) => {
        //   if (res.id == id) {
        //     arr[index] = r;
        //     return false;
        //   }
        //   return true;
        // });
        r.cargoRateSteps.forEach((steps) => {
          let id = steps.id;
          this.contractCargoRateSteps.every((contractRes, stepIndex, stepArr) => {
            if (contractRes.id == id) {
              stepArr[stepIndex] = steps;
              return false;
            }
            return true;
          });
        });
      });
      this.cargoRates = this.cargoItem.cargoRates;
      this.cargoRateDataSource.read();
    }

    this.validationController.addObject(this.cargoItem, validationRules);

  }

  convertCargoRates() {
    this.allCargoRates = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
    this.allCargoRates.map(res => {
      let unit = this.unitDatasource.find(d => res.unit == d.dictDataCode);
      //let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
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
    this.contractCargoRateSteps.map(res => {
      let unit = this.unitDatasource.find(d => res.stepUnit == d.dictDataCode);
      res.stepUnitStr = unit.dictDataName;
      return res;
    });
  }

  cargoCategoryChanged() {
    //this.convertCargoRates();
    this.cargoRateDataSource.read();
  }


  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.cargoItem, propertyName });
  }

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: CargoCategoryTree, model: this.cargoItem.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    if (!this.cargoItem.cargoCategoryId || this.cargoItem.cargoCategoryId != result.output.id) {
      this.cargoItem.cargoCategoryName = result.output.categoryName;
      this.cargoItem.cargoCategoryId = result.output.id;
      this.cargoRates = [];
      this.cargoCategoryChanged();
    }

  }

  async save() {
    await this.cargoRateDataSource.sync();
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    let rate;

    let cargoRateList = this.cargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
    cargoRateList.forEach(r => {
      let id = r.id;
      let cargoRateStepList = this.contractCargoRateSteps.filter(x => x.customerRateId == id);
      r.cargoRateSteps = cargoRateStepList;
    });
    this.cargoItem.cargoRates = cargoRateList;
    this.cargoItem.cargoRates.forEach(r => {
      let rates = this.cargoItem.cargoRates.filter(e =>
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
    this.cargoItem.unitStr = this.unitDatasource.find(d => this.cargoItem.unit == d.dictDataCode).dictDataName;
    await this.dialogController.ok(this.cargoItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.contractCargoRateSteps);
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
              stepUnitStr: { editable: false },
              remark: { editable: false }
            }
          }
        },
        filter: { field: 'customerRateId', operator: 'eq', value: e.data.id }
      },

      editable: true,
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        {
          field: 'stepPrice',
          title: '阶梯价'
          //template: '<input type="text" value.bind=" stepPrice & validate & notify">'

        },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
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
    this.convertCargoRates();
    let source = [];
    Object.assign(source, this.allCargoRates);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        source = source.filter(x => x[e] == this.search[e]);
      }
    }
    // 过滤不同合同类型的费率
    // source = source.filter(r => r.customerCategory == this.contract.contractType);
    //过滤已经选择的合同费率
    source = source.filter(r => {
      return this.cargoRates.every(e => {
        let res1 = true;
        let res2 = true;
        let res3 = true;
        let res4 = true;
        let res5 = true;
        let res6 = true;
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
        return !(res1 && res2 && res3 && res4 && res5 && res6);
      });
    });
    //合并费率
    this.cargoRates = this.cargoRates.concat(source);
    this.cargoRateDataSource.read();
  }

  delete(e) {
    this.cargoRates = this.cargoRates.filter(r => r.id != e.id);
    this.cargoRateDataSource.remove(e);
  }


}
const validationRules = ValidationRules
  .ensure((cargoItem: CargoItem) => cargoItem.cargoName)
  .displayName('货物名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((cargoItem: CargoItem) => cargoItem.cargoCategoryName)
  .displayName('货物种类')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoItem: CargoItem) => cargoItem.orderQuantity)
  .displayName('指令数量')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies((x, cargoItem) => {
    if (cargoItem.orderNumber) return true;
    if (x) return (x <= 1000000000000000 && x > 0);
    if (x === 0) {
      return false;
    }
    return true;
  })
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)

  .ensure((cargoItem: CargoItem) => cargoItem.orderNumber)
  .displayName('指令件数')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies((x, cargoItem) => {
    if (cargoItem.orderQuantity) return true;
    if (x) return (x <= 2147483647 && x > 0);
    if (x === 0) return false;
    return true;
  })
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)

  .ensure((cargoItem: CargoItem) => cargoItem.unit)
  .displayName('计量单位')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoItem: CargoItem) => cargoItem.freeDays)
  .displayName('免堆期')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => !x || (x <= 2147483647 && x >= 0))
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)

  .ensure((cargoItem: CargoItem) => cargoItem.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;