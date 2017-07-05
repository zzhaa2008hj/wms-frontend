import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { Contract } from '@app/base/models/contract';
import { Organization } from '@app/base/models/organization';
import { NewCargoItem } from '@app/base/cargo-info/item-new';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class NewCargoInfo {
    //unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    agents: Organization[];
    customers: Organization[];
    cargoInfo = {} as CargoInfo;
    cargoItems = [] as CargoItem[];
    contract: Contract[];
    contractId = '';
    index = 1;

    datasource: kendo.data.DataSource;
    customerInfo: kendo.ui.DropDownList;
    agentInfo: kendo.ui.DropDownList;
    validationController: ValidationController;

    constructor(private router: Router,
        private cargoInfoService: CargoInfoService,
        private messageDialogService: MessageDialogService,
        private dialogService: DialogService,
        validationControllerFactory: ValidationControllerFactory, container: Container) {
        this.validationController = validationControllerFactory.create();
        this.validationController.addRenderer(formValidationRenderer);
        container.registerInstance(ValidationController, this.validationController);

        this.datasource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.cargoItems);
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
        this.validationController.addObject(this.cargoInfo, validationRules);

        let res = await this.cargoInfoService.getBatchNumber();
        this.cargoInfo.batchNumber = res.message;
        // 仓储代理商
        this.agents = await this.cargoInfoService.getCustomers(1);
        //仓储客户
        this.customers = await this.cargoInfoService.getCustomers(1);
        //仓储合同
        this.contract = await this.cargoInfoService.getContracts(1);
        //把没有仓储合同的客户排除掉
        let customersWithContract = [];
        this.customers.forEach(r => {
            this.contract.every(x => {
                if (r.id == x.customerId) {
                    customersWithContract.push(r);
                    return false;
                }
                return true;
            });

        });
        this.customers = customersWithContract;

        this.cargoInfo.warehouseType = 1;
        this.cargoInfo.cargoForm = 1;
        this.cargoInfo.cargoType = 1;

    }

    validateProperty(propertyName: string) {
        this.validationController.validate({ object: this.cargoInfo, propertyName });
    }

    async addCargoItem() {
        if (!this.contractId) {
            this.messageDialogService.alert({ title: '客户选择错误', message: '请选择客户后再新增货物！' });
            return;
        }
        let result = await this.dialogService.open({
            viewModel: NewCargoItem,
            model: { contractId: this.contractId, warehouseType: this.cargoInfo.warehouseType }, lock: true
        })
            .whenClosed();
        if (result.wasCancelled) return;
        //let workInfo = result.output;
        result.output.batchNumber = this.index;
        this.index++;
        this.cargoItems.push(result.output);
        this.datasource.read();

        this.orderNumChange();
    }


    customerChanged() {
        if(!this.cargoInfo.customerId){
            return;
        }
        let contractInfo = this.contract.filter(x => x.customerId == this.cargoInfo.customerId);
        if (contractInfo.length == 0) {
            this.contractId = "";
            this.messageDialogService.alert({ title: '客户选择错误', message: '该客户没有合同，请选择有合同的客户！不然无法新增货物' });
            return;
        }
        this.contractId = contractInfo[0].id;
    }

    async delete(batchNumber) {
        let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该货物吗？" });
        if (confirm) {
            this.cargoItems = this.cargoItems.filter(x => x.batchNumber != batchNumber);
            this.datasource.read();

            this.orderNumChange();
        }
    }

    async update(batchNumber) {
        let cargoItemList = this.cargoItems.filter(x => x.batchNumber == batchNumber);
        if (cargoItemList.length == 0) {
            this.messageDialogService.alert({ title: '错误', message: '该货物不存在！' });
            return;
        }
        let cargoItemInfo = cargoItemList[0];
        let result = await this.dialogService.open({
            viewModel: NewCargoItem,
            model: { contractId: this.contractId, warehouseType: this.cargoInfo.warehouseType, cargoItemInfo },
            lock: true
        }).whenClosed();
        if (result.wasCancelled) return;
        this.cargoItems = this.cargoItems.filter(x => x.batchNumber != batchNumber);
        this.cargoItems.push(result.output);
        this.datasource.read();

        this.orderNumChange();

    }
    async save() {
        if (this.cargoItems.length == 0) {
            this.messageDialogService.alert({ title: '货物明细错误', message: '货物明细列表不能为空！' });
            return;
        }

        this.cargoInfo.agentName = this.agentInfo.text();
        this.cargoInfo.customerName = this.customerInfo.text();
        // this.cargoInfoVo.cargoInfo = this.cargoInfo;
        this.cargoInfo.cargoItems = this.cargoItems;

        let { valid } = await this.validationController.validate();
        if (!valid) return;

        try {
            await this.cargoInfoService.saveCargoInfo(this.cargoInfo);
            await this.messageDialogService.alert({ title: "新增成功" });
            this.router.navigateToRoute("list");
        } catch (err) {
            await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
        }
    }

    orderNumChange() {
        this.cargoInfo.orderQuantity = 0;
        this.cargoInfo.orderNumber = 0;
        this.cargoItems.forEach(r => this.cargoInfo.orderQuantity += r.orderQuantity)
        this.cargoItems.forEach(r => this.cargoInfo.orderNumber += r.orderNumber)
    }
    cancel() {
        this.router.navigateToRoute("list");
    }

}
const validationRules = ValidationRules
    .ensure((cargoInfo: CargoInfo) => cargoInfo.agentId)
    .displayName('代理商名称')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((cargoInfo: CargoInfo) => cargoInfo.customerId)
    .displayName('客户名称')
    .required().withMessage(`\${$displayName} 不能为空`)

    .ensure((cargoInfo: CargoInfo) => cargoInfo.billLadingNumber)
    .displayName('提单号')
    .required().withMessage(`\${$displayName} 不能为空`)
    .maxLength(30).withMessage(`\${$displayName} 过长`)

    .ensure((cargoInfo: CargoInfo) => cargoInfo.remark)
    .displayName('备注')
    .maxLength(500).withMessage(`\${$displayName} 过长`)
    .rules;