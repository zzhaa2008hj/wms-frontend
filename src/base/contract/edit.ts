import {Router} from "aurelia-router";
import {MessageDialogService} from "ui";
import {ValidationController} from "aurelia-validation";
import {autoinject, newInstance} from "aurelia-dependency-injection";
import {ContractVo} from "../models/contractVo";
import {ContractService} from "../services/contract";
import {Rate} from "../models/rate";
import {WorkInfo} from "../models/work-info";
import {RateStep} from "../models/rateStep";
import {Organization} from "../models/organization";

@autoinject
export class EditContract {

    contractVo: ContractVo;
    contractTypes = [{"name": "客户仓储", "type": 1}, {"name": "装卸单位", "type": 2}, {"name": "库区租赁", "type": 3}];
    warehouses: WorkInfo;
    customers: Organization;
    customerInfo: kendo.ui.DropDownList;
    datasource: kendo.data.DataSource;

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

    /**
     * 初始化后自动执行
     */
    async activate({id}) {
        this.customers = await  this.contractService.getCustomers();
        this.contractVo = await this.contractService.getContract(id);
        if (this.contractVo.contract.contractType == 3) {
            //库区信息
            this.warehouses = await this.contractService.getWarehouses();
        } else {
            this.baseRateAndSteps = this.contractVo.rateVos
            this.baseRateStep = this.contractVo.rateStepVos;
        }
    }

    formatMethod(type: number) {
        return ['客户仓储', '装卸单位', '库区租赁', 'delete'][type - 1] || 'unknown';
    }

    async update() {
        await this.datasource.sync();
        try {
            this.contractVo.contract.customerName = this.customerInfo.text();
            let info = this.contractVo;
            await this.contractService.updateContract(this.contractVo.contract.id, info);
            await this.messageDialogService.alert({title: "编辑成功"});
            this.router.navigateToRoute("list");
        } catch (err) {
            await this.messageDialogService.alert({title: "发生错误", message: err.message, icon: 'error'});
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
