import { autoinject, inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { DataSourceFactory } from "../../../utils";
import { OrganizationService } from "../../services/organization";
import { MessageDialogService } from "ui";

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
              @inject private orgService: OrganizationService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orgService.queryOrganizations({ customerType: "2", name: this.searchName }),
      pageSize: 10
    });
  }

  async changeStatus(id, status) {
    try {
      await this.orgService.changeStatus(id, status);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  select() {
    this.dataSource.read();
  }

}