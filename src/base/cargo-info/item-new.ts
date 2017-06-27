import { autoinject } from 'aurelia-dependency-injection';
import { DialogController } from 'ui';
import { CargoCategory } from '../models/cargo-category';
import { CargoItem, CargoRate, CargoRateStep } from '../models/cargo-info';
import { CargoInfoService } from '../services/cargo-info';

@autoinject
export class NewCargoItem {
    cargoItem = {} as CargoItem;

    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    cargoCategoryDataSource: CargoCategory[];
    cargoCategory: kendo.ui.DropDownList;

    cargoRateDataSource: kendo.data.DataSource;


    contractCargoRates: CargoRate[];
    contractCargoRateSteps: CargoRateStep[];

    cargoRates: CargoRate[];

    constructor(private cargoInfoService: CargoInfoService,
        private dialogController: DialogController) {
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


    async activate({ contractId, warehouseType, cargoItemInfo }) {
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
            this.cargoItem.cargoRate.forEach(r => {
                let id = r.id;
                this.cargoRates.forEach((res, index, arr) => {
                    if (res.id == id) {
                        arr[index] = r;
                        return;
                    }
                });

                r.cargoRateSteps.forEach((steps) => {
                    let id = steps.id;
                    this.contractCargoRateSteps.forEach((contractRes, stepIndex, stepArr) => {
                        if (contractRes.id == id) {
                            stepArr[stepIndex] = steps;
                            return;
                        }
                    });
                });
            });
            //this.cargoRateDataSource.read();
        }


    }


    cargoCategoryChanged() {
        this.cargoRates = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        this.cargoRateDataSource.read();
    }


    async save() {
        await this.cargoRateDataSource.sync();
        this.cargoItem.cargoCategoryName = this.cargoCategory.text();

        let cargoRateList = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        cargoRateList.forEach(r => {
            let id = r.id;
            let cargoRateStepList = this.contractCargoRateSteps.filter(x => x.cargoRateId = id);
            r.cargoRateSteps = cargoRateStepList;
        });
        this.cargoItem.cargoRate = cargoRateList;

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
                            stepPrice: { editable: true, notify: true },
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