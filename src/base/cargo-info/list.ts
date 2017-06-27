import {autoinject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {MessageDialogService} from "ui";
import {DataSourceFactory} from "../../utils";
import {CargoInfoService} from "../services/cargo-info";

@autoinject
export class CargoInfoList {
    searchName: string;

    dataSource: kendo.data.DataSource;
    pageable = {
        refresh: true,
        pageSizes: true,
        buttonCount: 10
    };

    constructor(private router: Router,
                private cargoInfoService: CargoInfoService,
                private messageDialogService: MessageDialogService,
                private dataSourceFactory: DataSourceFactory) {
        this.dataSource = this.dataSourceFactory.create({
            query: () => this.cargoInfoService.queryCargoInfo({searchName: this.searchName}),
            pageSize: 10
        });
    }


    async delete(id) {
        let confirm = await this.messageDialogService.confirm({title: "提示", message: "确定删除该角色！"});
        if (confirm) {
            try {
                await this.cargoInfoService.delete(id);
                await this.messageDialogService.alert({title: "", message: "删除成功！"});
                this.dataSource.read();
            } catch (err) {
                await this.messageDialogService.alert({title: "错误:", message: err.message, icon: 'error'});
            }
        }
    }

    select() {
        this.dataSource.read();
    }

}