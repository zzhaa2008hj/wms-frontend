import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate,CargoRateStep } from '@app/base/models/cargo-info';
import { DialogController } from 'ui';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class EditCargoItem {

  cargoItem = {} as CargoItem;

  unitDatasource = [] as DictionaryData[];
  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];

  cargoRateDataSource: kendo.data.DataSource;
  validationController: ValidationController;

  cargoRates: CargoRate[];
  cargoRateSteps = [] as CargoRateStep[];

  rateTypes = ConstantValues.WorkInfoCategory;

  constructor(private dialogController: DialogController,
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
            warehouseTypeStr: { editable: false },
            cargoCategoryName: { editable: false },
            cargoSubCategoryName: { editable: false },
            warehouseCategoryStr: { editable: false },
            remark: { editable: false }
          }
        }
      }
    });
  }


  async activate({ cargoItemInfo }) {
    this.unitDatasource = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.cargoItem = cargoItemInfo;
    this.cargoRates = cargoItemInfo.cargoRates;
    this.cargoRates.forEach(x => {
      if(x.cargoRateSteps){
        this.cargoRateSteps =  this.cargoRateSteps.concat(x.cargoRateSteps);
      }
    })
    this.convertCargoRates();
    this.validationController.addObject(this.cargoItem, validationRules);
  }

  convertCargoRates() {
    this.cargoRates.map(res => {
      let unit = this.unitDatasource.find(d => res.unit == d.dictDataCode);
      let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
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

  async save() {
    await this.cargoRateDataSource.sync();
    let { valid } = await this.validationController.validate();
    if (!valid) return;
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

  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.cargoItem, propertyName });
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            // options.success(a.cargoRateSteps);
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
              stepPrice: { editable: true, notify: true, type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, title: '阶梯价' },
              stepUnitStr: { editable: false},
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
    if (x === 0) { return false; }
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
