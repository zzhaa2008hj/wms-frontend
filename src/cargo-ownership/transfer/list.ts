import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import * as moment from 'moment';
import { CargoownershipTransferCriteria, CargoownershipTransferService } from '@app/cargo-ownership/services/cargo-ownership';
// import { DictionaryDataService } from '@app/base/services/dictionary';
// import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from "@app/common/models/constant-values";
import { UserSession } from '@app/user';
import { DialogService } from "ui";
import { Router } from "aurelia-router";

export class CargoownershipTransferList {
  search: CargoownershipTransferCriteria = {};
  dataSource: kendo.data.DataSource;
  startDatePicker: any;
  endDatePicker: any;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  userId: string;
  selectedId: string;
  constructor(@inject private cargoownershipTransferService: CargoownershipTransferService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private user: UserSession,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              // @inject private dictionaryDataService: DictionaryDataService
            ) {
  }

  async activate() {
    this.userId = this.user.userInfo.userId;
    // let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoownershipTransferService.getPageList(this.search)
        .map(res => {
          let stage = ConstantValues.CargoOwnershipStage.find(r => r.stage == res.stage);
          if (stage) {
            res.stageName = stage.title;
          }
          let lastStage = ConstantValues.CargoOwnershipStage.find(r => r.stage == res.lastStage);
          if (lastStage) {
            res.lastStageName = lastStage.title;
          }
          res.transferDate = new Date(res.transferDate);
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

  reset() {
    this.search = {};
  }

  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    let dataItem = grid.dataItem(selectedRow);
    this.selectedId = dataItem.id;
  }
  /**
   * 查看修改历史
   */
  async changeHistory() {
    if (!this.selectedId) {
      await this.dialogService.alert({ title: "提示", message: '请选择货权转移单', icon: "error" });
      return;
    }
    this.router.navigateToRoute("changeHistory", { id: this.selectedId });
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