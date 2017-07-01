import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { MessageDialogService } from "ui";
import { ContractService } from "@app/base/services/contract";
import { ContractVo } from "@app/base/models/contractVo";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { Organization } from "@app/base/models/organization";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { Contract } from '@app/base/models/contract';

@autoinject
export class NewContract {
    validationController: ValidationController;

    contractVo = {} as ContractVo;
    contract = {} as Contract;

    contractTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
    warehouses: WorkInfo[];

    customers: Organization[] = [];
    handlingCustomers: Organization[];
    wareHouseCustomer: Organization[];

    customerInfo: kendo.ui.DropDownList;
    datasource: kendo.data.DataSource;
    customerDatasource: kendo.data.DataSource;

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
        private messageDialogService: MessageDialogService,
        validationControllerFactory: ValidationControllerFactory,
        container: Container) {
        this.validationController = validationControllerFactory.create();
        this.validationController.addRenderer(formValidationRenderer);
        container.registerInstance(ValidationController, this.validationController);

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

        this.customerDatasource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.customers);
                }
            }
        });
    }


    async activate() {
        //this.validationController.addObject(this.contractVo, validationRules);
        //this.validationController.addObject(this.contractVo.contract, validationRules);
        this.validationController.addObject(this.contract, validationRules);

        this.warehouses = await this.contractService.getWarehouses();
        //装卸单位
        this.handlingCustomers = await this.contractService.getCustomers(2);
        //仓储客户
        this.wareHouseCustomer = await this.contractService.getCustomers(1);
        this.baseRateAndSteps = await this.contractService.getBaseRate();
        this.baseRateStep = await this.contractService.getBaseRateStep();
    }


    contractTypeChanged() {
        // let contractType = this.contractVo.contract.contractType;
        let contractType = this.contract.contractType;
        this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: contractType });
        //1 :
        if (contractType == 2) {
            this.customers = this.handlingCustomers;

        } else {
            this.customers = this.wareHouseCustomer;
        }
        this.customerDatasource.read();
    }


    async save() {
        this.datasource.sync();
        let { valid } = await this.validationController.validate();
        if (!valid) return;
        let rateList = this.baseRateAndSteps
            .filter(x => x.customerCategory == this.contract.contractType);

        rateList.forEach(r => {
            let id = r.id;
            let rateSteps = this.baseRateStep.filter(res => res.rateId == id);
            r.rateStep = rateSteps;

        });
        this.contractVo.rateVos = rateList;
        // this.contractVo.contract.customerName = this.customerInfo.text();
        this.contract.customerName = this.customerInfo.text();
        this.contractVo.contract = this.contract;
        try {
            await this.contractService.saveContract(this.contractVo);
            await this.messageDialogService.alert({ title: "新增成功" });
            this.router.navigateToRoute("list");
        } catch (err) {
            await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
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
    .ensure((contract: Contract) => contract.contractType)
    .displayName('合同类型')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((contract: Contract) => contract.customerId)
    .displayName('客户名称')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((contract: Contract) => contract.contractNumber)
    .displayName('合同编号')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(50).withMessage(`\${$displayName} 过长`)

    .ensure((contract: Contract) => contract.contractName)
    .displayName('合同名称')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(50).withMessage(`\${$displayName} 过长`)

    .ensure((contract: Contract) => contract.contractAmount)
    .displayName('合同金额')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(17).withMessage(`\${$displayName} 过长`)

    .ensure((contract: Contract) => contract.startTime)
    .displayName('合同开始日期')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((contract: Contract) => contract.endTime)
    .displayName('合同结束日期')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((contract: Contract) => contract.signDate)
    .displayName('合同签订日期')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((contract: Contract) => contract.signer)
    .displayName('签订人')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(50).withMessage(`\${$displayName} 过长`)

    .ensure((contract: Contract) => contract.remark)
    .displayName('备注')
    .maxLength(500).withMessage(`\${$displayName} 过长`)
    .rules;
