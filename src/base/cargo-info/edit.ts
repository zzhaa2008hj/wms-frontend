import { EditCargoItem } from '@app/base/cargo-info/item-edit';
import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';

@autoinject
export class EditCargoInfo {
    // unitDatasource = [{ dictName: "吨" }, { dictName: "根" }, { dictName: "立方" }];
    cargoInfo = {} as CargoInfo;
    cargoItems = [] as CargoItem[];
    cargoInfoId = '';
    datasource: kendo.data.DataSource;

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


    async activate({ id }) {
        this.cargoInfo = await this.cargoInfoService.getCargoInfo(id);
        this.cargoItems = await this.cargoInfoService.getCargoItems(id);
        this.cargoInfoId = id;
    }

    async update(id) {
        let cargoItemList = this.cargoItems.filter(x => x.id == id);
        if (cargoItemList.length == 0) {
            this.messageDialogService.alert({ title: '错误', message: '该货物不存在！' });
            return;
        }
        let cargoItemInfo = cargoItemList[0];
        let result = await this.dialogService.open({
            viewModel: EditCargoItem,
            model: { cargoItemInfo },
            lock: true
        }).whenClosed();
        if (result.wasCancelled) return;
        this.cargoItems = this.cargoItems.filter(x => x.id != id);
        this.cargoItems.push(result.output);
        this.datasource.read();

        this.orderNumChange();

    }
    async save() {

        // this.cargoInfoVo.cargoInfo = this.cargoInfo;
        this.cargoInfo.cargoItems = this.cargoItems;
        try {
            await this.cargoInfoService.updateCargoInfo(this.cargoInfo, this.cargoInfoId);
            await this.messageDialogService.alert({ title: "编辑成功" });
            this.router.navigateToRoute("list");
        } catch (err) {
            await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: 'error' });
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