import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoInfoVo, CargoItem } from '@app/base/models/cargo-info';
import { Contract } from '@app/base/models/contract';
import { Organization } from '@app/base/models/organization';
import { NewCargoItem } from '@app/base/cargo-info/item-new';

@autoinject
export class NewCargoInfo {
    // contractTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
    // warehouses: WorkInfo[];

    // customers: Organization[] = [];
    // handlingCustomers: Organization[];
    // wareHouseCustomer: Organization[];

    // customerInfo: kendo.ui.DropDownList;
    // datasource: kendo.data.DataSource;
    // customerDatasource: kendo.data.DataSource;

    // /**
    //  * 基础费率
    //  */
    // baseRateAndSteps: Rate[];

    // /**
    //  * 基础阶梯费率
    //  */
    // baseRateStep: RateStep[];
    unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    agents: Organization[];
    customers: Organization[];
    cargoInfoVo = {} as CargoInfoVo;
    cargoInfo = {} as CargoInfo;
    cargoItems = [] as CargoItem[];
    contract: Contract[];
    contractId = '';
    index = 1;

    datasource: kendo.data.DataSource;
    customerInfo: kendo.ui.DropDownList;
    agentInfo: kendo.ui.DropDownList;

    constructor(private router: Router,
        private cargoInfoService: CargoInfoService,
        private messageDialogService: MessageDialogService,
        private dialogService: DialogService) {
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
        // this.warehouses = await this.cargoInfoService.getWarehouses();
        // //装卸单位
        // this.handlingCustomers = await this.cargoInfoService.getCustomers(2);
        // //仓储客户
        // this.wareHouseCustomer = await this.cargoInfoService.getCustomers(1);
        // this.baseRateAndSteps = await this.cargoInfoService.getBaseRate();
        // this.baseRateStep = await this.cargoInfoService.getBaseRateStep();
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

        this.cargoInfo.warehouseType = "1";
        this.cargoInfo.cargoForm = "1";
        this.cargoInfo.cargoType = "1";

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
    }


    customerChanged() {
        let contractInfo = this.contract.filter(x => x.customerId == this.cargoInfo.customerId);
        if (contractInfo.length == 0) {
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

    }
    async save() {
        this.cargoInfo.agentName = this.agentInfo.text();
        this.cargoInfo.customerName = this.customerInfo.text();
        this.cargoInfoVo.cargoInfo = this.cargoInfo;
        this.cargoInfoVo.cargoItems = this.cargoItems;

        console.log(this.cargoInfoVo)
        // try {
        //     await this.cargoInfoService.saveCargoInfo(this.cargoInfoVo);
        //     await this.messageDialogService.alert({ title: "新增成功" });
        //     this.router.navigateToRoute("list");
        // } catch (err) {
        //     await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
        // }
    }

    updateProp(item, property) {
        item.trigger('change', { field: property });
        item.dirty = true;
    }

    cancel() {
        this.router.navigateToRoute("list");
    }

}