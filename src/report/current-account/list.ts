import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import * as moment from 'moment';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { LedgerAccountService } from '@app/report/services/ledger-account';

export class CurrentAccountList {
  search = {
    beginDate: '',
    endDate: '',
    type: 2
  };
  dataSource: kendo.data.DataSource;

  startDatePicker: any;
  endDatePicker: any;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private dataSourceFactory: DataSourceFactory,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private ledgerAccountService: LedgerAccountService) {
  }

  async activate() {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.ledgerAccountService.page(this.search).map(res => {
        let dict = units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unit = dict.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.search.beginDate = this.search.beginDate ? moment(this.search.beginDate).format("YYYY-MM-DD") : '';
    this.search.endDate = this.search.endDate ? moment(this.search.endDate).format("YYYY-MM-DD") : '';
    this.dataSource.read();
  }

  // kendo controls aren't ready yet in the attached() callback
  // so we use the aurelia-after-attached-plugin which adds the afterAttached callback
  // https://github.com/aurelia-ui-toolkits/aurelia-after-attached-plugin
  afterAttached() {
    this.startDatePicker.max(this.endDatePicker.value());
    this.endDatePicker.min(this.startDatePicker.value());
  }

  startChange() {
    let startDate = this.startDatePicker.value();
    let endDate = this.endDatePicker.value();

    if (startDate) {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate());
      this.endDatePicker.min(startDate);
    } else if (endDate) {
      this.startDatePicker.max(new Date(endDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

  endChange() {
    let endDate = this.endDatePicker.value();
    let startDate = this.startDatePicker.value();

    if (endDate) {
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate());
      this.startDatePicker.max(endDate);
    } else if (startDate) {
      this.endDatePicker.min(new Date(startDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }
}