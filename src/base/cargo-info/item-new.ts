import { CargoCategoryTree } from '@app/base/cargo-info//cargo-category-tree';
import { autoinject } from 'aurelia-dependency-injection';
import { DialogController, DialogService } from 'ui';
import { CargoCategory } from '@app/base/models/cargo-category';
import { CargoItem, CargoRate, CargoRateStep } from '@app/base/models/cargo-info';
import { CargoInfoService } from '@app/base/services/cargo-info';

@autoinject
export class NewCargoItem {
    cargoItem = {} as CargoItem;

    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    cargoCategoryDataSource: CargoCategory[];
    cargoCategory = {} as CargoCategory;

    cargoRateDataSource: kendo.data.DataSource;


    contractCargoRates: CargoRate[];
    contractCargoRateSteps: CargoRateStep[];

    cargoRates: CargoRate[];

    constructor(private cargoInfoService: CargoInfoService,
        private dialogController: DialogController,
        private dialogService: DialogService) {
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
            this.cargoItem.cargoRates.forEach(r => {
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

        let cargoRateList = this.contractCargoRates.filter(x => x.cargoCategoryId == this.cargoItem.cargoCategoryId);
        cargoRateList.forEach(r => {
            let id = r.id;
            let cargoRateStepList = this.contractCargoRateSteps.filter(x => x.cargoRateId = id);
            r.cargoRateSteps = cargoRateStepList;
        });
        this.cargoItem.cargoRates = cargoRateList;

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