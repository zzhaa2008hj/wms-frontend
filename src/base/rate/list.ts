import { RateService } from "../services/rate";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "../../utils";
@autoinject
export class Rate {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(private rateService: RateService,
              private dataSourceFactory: DataSourceFactory,
              private messageDialogService: MessageDialogService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.rateService.queryRates({ name: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  async changeState(id) {
    try {
      await this.rateService.updateState(id);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async delete(id) {
    try {
      if (confirm("删除后无法恢复" )) {
        await this.rateService.deleteRate(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

}