import { autoinject } from 'aurelia-dependency-injection';
import { CargoItem, CargoRate } from '@app/base/models/cargo-info';
import { DialogController } from 'ui';

@autoinject
export class DetailsCargoItem {
    cargoItem = {} as CargoItem;

    cargoRateDataSource: kendo.data.DataSource;

    cargoRates: CargoRate[];

    constructor(private dialogController: DialogController) {
        this.cargoRateDataSource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.cargoRates);
                }
            }
        });
    }


    async activate({ cargoItemInfo }) {
        this.cargoItem = cargoItemInfo;
        this.cargoRates = cargoItemInfo.cargoRates;
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
                            stepPrice: { editable: false},
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
            ]
        });
    }

}