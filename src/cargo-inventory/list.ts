import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory, fixDate } from '@app/utils';
import { CargoInventoryService } from '@app/cargo-inventory/services/cargo-inventory';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class CargoInventoryList {

  dataSource: kendo.data.DataSource;
  keywords: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  demandFrom = ConstantValues.DemandFrom;
  statusArr = ConstantValues.FeeStatus;

  constructor(private dataSourceFactory: DataSourceFactory,
              private cargoInventoryService: CargoInventoryService) {
    
  }

  activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoInventoryService.queryCargoInventoryPage(this.keywords).map(res => {
        res.demandFromStr = this.demandFrom.find(d => d.type == res.demandFrom).name;
        res.statusStr = this.statusArr.find(d => d.status == res.status).title;
        fixDate(res, 'startTime', 'endTime', 'createTime', 'inventoryCheckDate', 'actualCheckDate');
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  reset() {
    this.keywords = '';
    this.dataSource.read();
  }
}