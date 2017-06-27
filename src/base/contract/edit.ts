import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { newInstance, inject } from 'aurelia-dependency-injection';
import { ContractVo } from "@app/base/models/contractVo";
import { ContractService } from "@app/base/services/contract";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { Contract } from '@app/base/models/contract';

export class EditContract {

    contractVo: ContractVo = {} as ContractVo;
    contractTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
    warehouses: WorkInfo[];
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

    constructor(@inject private router: Router,
        @inject private contractService: ContractService,
        @inject private messageDialogService: MessageDialogService,
        @newInstance() private validationController: ValidationController) {
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
        validationController.addRenderer(formValidationRenderer);        
    }

    /**
     * 初始化后自动执行
     */
    async activate({ id }) {
        this.contractVo = await this.contractService.getContract(id);
        this.contractVo.contract.contractTypeStr = this.contractTypes[this.contractVo.contract.contractType - 1].name;
        if (this.contractVo.contract.contractType == 3) {
            //库区信息
            this.warehouses = await this.contractService.getWarehouses();
        } else {
            this.baseRateAndSteps = this.contractVo.rateVos;
            this.baseRateStep = this.contractVo.rateStepVos;
        }
        this.validationController.addObject(this.contractVo, validationRules);
    }

    async update() {
        await this.datasource.sync();
        try {
            let info = this.contractVo;
            await this.contractService.updateContract(this.contractVo.contract.id, info);
            await this.messageDialogService.alert({ title: "编辑成功" });
            this.router.navigateToRoute("list");
        } catch (err) {
            await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
        }
    }

    updateProp(item, property) {
        item.trigger('change', { field: property });
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
                            stepNum: { editable: false },
                            stepStart: { editable: false },
                            stepEnd: { editable: false },
                            stepPrice: { editable: true, notify: true },
                            stepUnit: { editable: false },
                            remark: { editable: false }
                        }
                    }
                },
                filter: { field: 'rateId', operator: 'eq', value: e.data.id }
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
  .ensure((contract: Contract) => contract.contractName)
  .displayName('合同名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
