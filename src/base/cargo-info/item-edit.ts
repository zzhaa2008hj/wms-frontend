import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate } from '@app/base/models/cargo-info';
import { DialogController } from 'ui';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class EditCargoItem {
    cargoItem = {} as CargoItem;

    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];

    cargoRateDataSource: kendo.data.DataSource;
    validationController: ValidationController;

    cargoRates: CargoRate[];

    constructor(private dialogController: DialogController,
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
                    id: 'id'
                }
            }
        });
    }


    async activate({ cargoItemInfo }) {
        this.cargoItem = cargoItemInfo;
        this.cargoRates = cargoItemInfo.cargoRates;
        this.validationController.addObject(this.cargoItem, validationRules);
    }

    async save() {
        await this.cargoRateDataSource.sync();
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

    validateProperty(propertyName: string) {
        this.validationController.validate({ object: this.cargoItem, propertyName });
    }
    
    detailInit(e) {
        let a = e.data;
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
                            stepPrice: { editable: true, notify: true },
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
                { field: 'stepUnit', title: '单位' },
                { field: 'remark', title: '备注' }
            ],
            save: (e) => {
                e.sender.saveChanges();
                this.cargoRateDataSource.pushUpdate(a as CargoRate[]);
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