import { CargoCategoryTree } from '@app/base/cargo-info//cargo-category-tree';
import { autoinject, Container } from 'aurelia-dependency-injection';
import { DialogController, DialogService } from 'ui';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoItem, CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class NewCargoItem {
    cargoItem = {} as CargoItem;

    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    cargoCategoryDataSource: CargoCategory[];
    cargoCategory = {} as CargoCategory;

    cargoRateDataSource: kendo.data.DataSource;
    validationController: ValidationController;

    contractCargoRates: CargoRate[];
    contractCargoRateSteps: CargoRateStep[];

    cargoRates: CargoRate[];

    constructor(private cargoInfoService: CargoInfoService,
        private dialogController: DialogController,
        private dialogService: DialogService,
        validationControllerFactory: ValidationControllerFactory, container: Container) {

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
                        unit: { editable: false },
                        pricingMode: { editable: false },
                        workName: { editable: false },
                        warehouseType: { editable: false },
                        cargoCategoryName: { editable: false },
                        cargoSubCategoryName: { editable: false },
                        warehouseCategory: { editable: false },
                        remark: { editable: false }
                    }
                }
            }
        });
    }


    async activate({ contractId, warehouseType, cargoItemInfo }) {
        //免堆期的默认值
        this.cargoItem.freeDays = 0;
        //货物种类
        this.cargoCategoryDataSource = await this.cargoInfoService.getCargoCategories();
        //该合同下所有货物的费率
        this.contractCargoRates = await this.cargoInfoService.getContractCargoRates(contractId, warehouseType);
        //该合同下所有货物的阶梯费率
        this.contractCargoRateSteps = await this.cargoInfoService.getContractCargoRateSteps(contractId);
        //编辑时带过来的信息
        if (!!cargoItemInfo) {
            //要把费率list中的已修改的数据修改掉
            this.cargoItem = cargoItemInfo;
            this.cargoRates = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
            this.cargoItem.cargoRates.forEach(r => {
                let id = r.id;
                this.cargoRates.every((res, index, arr) => {
                    if (res.id == id) {
                        arr[index] = r;
                        return false;
                    }
                    return true;
                });

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
            //this.cargoRates = this.cargoItem.cargoRates;
            //this.cargoRateDataSource.read();
        }

        this.validationController.addObject(this.cargoItem, validationRules);

    }

    cargoCategoryChanged() {
        this.cargoRates = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        this.cargoRateDataSource.read();
    }


    validateProperty(propertyName: string) {
        this.validationController.validate({ object: this.cargoItem, propertyName });
    }

    async selectCargoCategory() {
        let result = await this.dialogService.open({ viewModel: CargoCategoryTree, model: this.cargoCategoryDataSource, lock: true })
            .whenClosed();
        if (result.wasCancelled) return;
        if (!this.cargoItem.cargoCategoryId || this.cargoItem.cargoCategoryId != result.output.id) {
            this.cargoItem.cargoCategoryName = result.output.categoryName;
            this.cargoItem.cargoCategoryId = result.output.id;
            this.cargoCategoryChanged();
        }

    }
    async save() {
        await this.cargoRateDataSource.sync();
        //let cargoRateList = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        let cargoRateList = this.cargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        cargoRateList.forEach(r => {
            let id = r.id;
            let cargoRateStepList = this.contractCargoRateSteps.filter(x => x.cargoRateId = id);
            r.cargoRateSteps = cargoRateStepList;
        });
        this.cargoItem.cargoRates = cargoRateList;

        let { valid } = await this.validationController.validate();
        if (!valid) return;
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
                            stepPrice: { editable: true, notify: true, type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, title: '阶梯价' },
                            stepUnit: { editable: false },
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
                { field: 'stepUnit', title: '单位' },
                { field: 'remark', title: '备注' }
            ],
            save: function (e) {
                e.sender.saveChanges();
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
    .satisfies(x => !x || (x <= 1000000000000000 && x >= 0))
    .withMessage(`\${$displayName} 为无效值(过大或过小)`)

    .ensure((cargoItem: CargoItem) => cargoItem.orderNumber)
    .displayName('指令件数')
    .required().withMessage(`\${$displayName} 不能为空`)
    .satisfies(x => !x || (x <= 2147483647 && x >= 0))
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