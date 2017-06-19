import { autoinject, inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "../../utils";
import { ContractService } from "../services/contract";

@autoinject
export class CustomerList {
  searchName: string;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private router: Router,
              @inject private contractService: ContractService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.contractService.queryContracts({  name: this.searchName }),
      pageSize: 10
    });
  }

  /**
   * TODO refactor
   */
  /* tslint:disable */
  formatMethod(type: number) {
    return ['客户仓储', '装卸单位', '库区租赁', 'delete'][type - 1] || 'unknown';
  }
  // async changeStatus(id, status) {
  //   try {
  //     await this.contractService.changeStatus(id, status);
  //     this.dataSource.read();
  //   } catch (err) {
  //     await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
  //   }
  // }

  select() {

    this.dataSource.read();
  }

}