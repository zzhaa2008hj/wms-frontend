import {Router} from "aurelia-router";
import {autoinject, newInstance} from "aurelia-dependency-injection";
import {MessageDialogService} from "ui";
import {ValidationController} from "aurelia-validation";
import {ContractService} from "../services/contract";
import {ContractVo} from "../models/contractVo";
import {Rate} from "../models/rate";
import {WorkInfo} from "../models/work-info";
import {RateStep} from "../models/rateStep";

@autoinject
export class NewContract {
    contractVo: ContractVo;
    contractTypes = [{"name": "客户仓储", "type": 1}, {"name": "装卸单位", "type": 2}, {"name": "库区租赁", "type": 3}];
    warehouses: WorkInfo;

    customerGrid: any;
    datasource;

    /**
     * 基础费率
     */
    baseRateAndSteps: Rate[];

    /**
     * 基础阶梯费率
     */
    baseRateStep: RateStep[];

    constructor(private router: Router,
                private contractService: ContractService,
                @newInstance() private validationController: ValidationController,
                private messageDialogService: MessageDialogService) {
        this.datasource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.baseRateAndSteps);
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

    async activate() {
        this.warehouses = await this.contractService.getWarehouses();
        this.baseRateAndSteps = await this.contractService.getBaseRate();
        this.baseRateStep = await this.contractService.getBaseRateStep();
    }


    contractTypeChanged() {
        let type = this.contractVo.contract.contractType;
        if (type) {
            this.datasource.filter({field: 'customerCategory', operator: 'eq', value: type});
        }
    }



    async save() {
        this.customerGrid.saveChanges();
        let rateList = this.baseRateAndSteps
            .filter(x => x.customerCategory == this.contractVo.contract.contractType);

        rateList.forEach(r => {
                let id = r.id;
                let rateSteps = this.baseRateStep.filter(res => res.rateId == id);
                r.rateStep = rateSteps;

            })
        this.contractVo.rateVos = rateList;
        try {
          await this.contractService.saveContract(this.contractVo);
          await this.messageDialogService.alert({ title: "新增成功" });
          this.router.navigateToRoute("list");
        } catch (err) {
          await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
        }
    }

    updateProp(item, property) {
        item.trigger('change', {field: property});
        item.dirty = true;
    }

    cancel() {
        this.router.navigateToRoute("list");
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
                            stepNum: {editable: false},
                            stepStart: {editable: false},
                            stepEnd: {editable: false},
                            stepPrice: {editable: true, notify: true},
                            stepUnit: {editable: false},
                            remark: {editable: false}
                        }
                    }
                },
                filter: {field: 'rateId', operator: 'eq', value: e.data.id}
            },

            editable: true,
            columns: [
                {field: 'stepNum', title: '阶梯号'},
                {field: 'stepStart', title: '开始值'},
                {field: 'stepEnd', title: '结束值'},
                {
                    field: 'stepPrice',
                    title: '阶梯价'
                    //template: '<input type="text" value.bind=" stepPrice & validate & notify">'

                },
                {field: 'stepUnit', title: '单位'},
                {field: 'remark', title: '备注'}
            ],
            save: function (e) {
                e.sender.saveChanges();
            }
        });
    }

}