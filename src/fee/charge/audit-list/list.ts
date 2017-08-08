import { DataSourceFactory } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditListService, ChargeAuditCriteria } from "@app/fee/services/charge-audit";

@autoinject
export class ChargeAuditList {
  chargeAuditCriteria: ChargeAuditCriteria;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private chargeAuditListService: ChargeAuditListService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.chargeAuditListService.pageChargeAuditList(this.chargeAuditCriteria),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}