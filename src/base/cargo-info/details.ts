import { DetailsCargoItem } from '@app/base/cargo-info/item-details';
import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';

@autoinject
export class DetailsCargoInfo {
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
                }
            }
        });
    }

    async activate({ id }) {
        this.cargoInfo = await this.cargoInfoService.getCargoInfo(id);
        this.cargoItems = await this.cargoInfoService.getCargoItems(id);
        //todo
        //获取出入库信息、货权转移、货位转移

    }

    async view(batchNumber) {
        let cargoItemList = this.cargoItems.filter(x => x.batchNumber == batchNumber);
        if (cargoItemList.length == 0) {
            this.messageDialogService.alert({ title: '错误', message: '该货物不存在！' });
            return;
        }
        let cargoItemInfo = cargoItemList[0];
        let result = await this.dialogService.open({
            viewModel: DetailsCargoItem,
            model: { cargoItemInfo },
            lock: true
        }).whenClosed();
        if (result.wasCancelled) return;

    }


    cancel() {
        this.router.navigateToRoute("list");
    }

}