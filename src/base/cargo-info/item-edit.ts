import { autoinject } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate } from '@app/base/models/cargo-info';
import { DialogController } from 'ui';

@autoinject
export class EditCargoItem {
    cargoItem = {} as CargoItem;

    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];

    cargoRateDataSource: kendo.data.DataSource;

    cargoRates: CargoRate[];

    constructor(private dialogController: DialogController) {
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
    }

    async save() {
        await this.cargoRateDataSource.sync();
        if (!this.cargoItem.freeDays) {
            this.cargoItem.freeDays = "0";
        }
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