import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { ContractService } from "@app/base/services/contract";

@autoinject
export class ContractList {
    searchName: string;

    dataSource: kendo.data.DataSource;
    pageable = {
        refresh: true,
        pageSizes: true,
        buttonCount: 10
    };
    contractTypes: string[] = ["客户仓储", "装卸单位", "库区租赁"];

    constructor(private contractService: ContractService,
        private messageDialogService: MessageDialogService,
        private dataSourceFactory: DataSourceFactory) {
        this.dataSource = this.dataSourceFactory.create({
            query: () => this.contractService.queryContracts({searchName: this.searchName}).map(res => {
                res.contractTypeStr = this.contractTypes[res.contractType - 1];
                return res;
            }),
            pageSize: 10
        });
    }
    
    async delete(id) {
        let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该角色！" });
        if (confirm) {
            try {
                await this.contractService.delete(id);
                await this.messageDialogService.alert({ title: "", message: "删除成功！" });
                this.dataSource.read();
            } catch (err) {
                await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
            }
        }
    }

    select() {
        this.dataSource.read();
    }

}