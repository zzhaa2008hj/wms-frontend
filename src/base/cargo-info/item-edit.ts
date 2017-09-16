import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { DialogController, DialogService } from 'ui';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { ContractSearch } from '@app/base/models/contract';
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { CargoInfoService } from '@app/base/services/cargo-info';

@autoinject
export class EditCargoItem {

  cargoItem = {} as CargoItem;

  unitDatasource = [] as DictionaryData[];
  // warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];

  cargoRateDataSource: kendo.data.DataSource;
  validationController: ValidationController;

  cargoRates: CargoRate[];
  allCargoRates: CargoRate[];
  cargoRateSteps = [] as CargoRateStep[];
  contractCargoRates: CargoRate[];
  contractCargoRateSteps: CargoRateStep[];


  rateTypes = ConstantValues.WorkInfoCategory;

  search = {} as ContractSearch;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService,
              private cargoInfoService: CargoInfoService,
              private dialogService: DialogService,
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


  async activate({ contractId, cargoItemInfo }) {
    this.unitDatasource = await this.dictionaryDataService.getDictionaryDatas("unit");
    // this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoItem = cargoItemInfo;
    this.cargoRates = cargoItemInfo.cargoRates;

    this.cargoRates.forEach(x => {
      if (x.cargoRateSteps) {
        this.cargoRateSteps = this.cargoRateSteps.concat(x.cargoRateSteps);
      }
    });

    //该合同下所有货物的费率
    this.contractCargoRates = await this.cargoInfoService.getContractCargoRates(contractId);
    //该合同下所有货物的阶梯费率
    this.contractCargoRateSteps = await this.cargoInfoService.getContractCargoRateSteps(contractId);
    this.contractCargoRateSteps.forEach(e => {
      e.cargoRateId = e.customerRateId;
    });


    // //编辑时带过来的信息
    // if (cargoItemInfo) {
    //   //要把费率list中的已修改的数据修改掉
    //   this.cargoItem = cargoItemInfo;
    //   this.cargoItem.cargoRates.forEach(r => {
    //     if(r.cargoRateSteps){
    //       // alert(r.cargoRateSteps.length);
    //       //console.log("r.cargoRateSteps", r.cargoRateSteps);
    //       r.cargoRateSteps.forEach((steps) => {
    //         let id = steps.id;
    //         this.contractCargoRateSteps.every((contractRes, stepIndex, stepArr) => {
    //           if (contractRes.id == id) {
    //             stepArr[stepIndex] = steps;
    //             return false;
    //           }
    //           return true;
    //         });
    //       });
    //     }
    //   });


    //   this.cargoRates = this.cargoItem.cargoRates;
    //   this.convertCargoRates();
    //   this.cargoRateDataSource.read();
    // }


    this.validationController.addObject(this.cargoItem, validationRules);
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

  async save() {
    alert("hehe");
    await this.cargoRateDataSource.sync();
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.cargoItem.unitStr = this.unitDatasource.find(d => this.cargoItem.unit == d.dictDataCode).dictDataName;

    let rateList = this.cargoRates;
    //  .filter(x => x.customerCategory == this.contract.contractType);

    rateList.forEach(r => {
      let id = r.id;
      let rateSteps;
      if (r.batchNumber) {
        rateSteps = this.cargoRateSteps.filter(res => res.cargoRateId == id);
      } else {
        r.batchNumber = this.cargoItem.batchNumber;
        rateSteps = this.contractCargoRateSteps.filter(res => res.customerRateId == id);
      }
      r.cargoRateSteps = rateSteps;

    });
    this.cargoItem.cargoRates = rateList;

    await this.dialogController.ok(this.cargoItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.cargoItem, propertyName });
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    // let str = "";
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            // options.success(a.cargoRateSteps);
            if (e.data.batchNumber) {
              // str = 'cargoRateId';
              options.success(this.cargoRateSteps);
            } else {
              // alert("2");
              // console.log("e.data.id",e.data.id);
              // console.log("this.contractCargoRateSteps",this.contractCargoRateSteps)
              // str = 'customerRateId';
              options.success(this.contractCargoRateSteps);
            }
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
              stepUnit: { editable: false },
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
        {
          field: 'stepPrice',
          title: '阶梯价'
        },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: (e) => {
        e.sender.saveChanges();
        // this.cargoRateDataSource.pushUpdate(a as CargoRate[]);
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
    let source = [];
    Object.assign(source, this.contractCargoRates);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        source = source.filter(x => x[e] == this.search[e]);
      }
    }
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

  edit(e) {
    let mode = e.detail.model.pricingMode;
    if (mode == 1) {
      return;
    }
    let dataGrid = e.detail.sender;
    dataGrid.closeCell();
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
