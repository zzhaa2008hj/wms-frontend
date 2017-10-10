import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory, fixDate } from '@app/utils';
import { CargoMortgageService, SearchCriteria } from '@app/cargo-mortgage/services/cargo-mortgage';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { DialogService, MessageDialogService } from 'ui';
import { VerifyRecordCriteria } from '@app/common/services/verify-record';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { CancelMortgage } from '@app/cargo-mortgage/cancel-mortgage';

@autoinject
export class CargoMortgage {

  selectedItem: any;
  dataSource: kendo.data.DataSource;
  criteria = {} as SearchCriteria;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  units = [] as DictionaryData[];
  stages = ConstantValues.CargoMortgageStage;

  constructor(private dataSourceFactory: DataSourceFactory,
    private dictionaryDataService: DictionaryDataService,
    private cargoMortgageService: CargoMortgageService,
    private messageDialogService: MessageDialogService,
    private dialogService: DialogService) {

  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoMortgageService.queryCargoMortgagePage().map(res => {
        if (res.unit) {
          res.unitStr = this.units.find(d => d.dictDataCode == res.unit).dictDataName;
        }
        if (res.stage) {
          res.stageStr = this.stages.find(d => d.stage == res.stage).title;
        }
        fixDate(res, 'pledgeStartDate', 'pledgeEndDate', 'cancelPledgeTime');
        return res;
      }),
      pageSize: 10
    });
  }

  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    this.selectedItem = grid.dataItem(selectedRow);
  }

  async verifyHistory() {
    if (!this.selectedItem) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择质押单!" });
      return;
    }

    let id = this.selectedItem.id;
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 5;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async delete(id) {
    let confirmed = await this.dialogService.confirm({ title: "删除确认", message: '确认删除该质押需求？' });
    if (!confirmed) return;
    try {
      await this.cargoMortgageService.deleteCargoMortgage(id);
      await this.dialogService.alert({ title: "", message: '删除成功' });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "", message: err.message, icon: "error" });
    }
  }

  async updateStage(id, stage) {
    let confirmed = await this.dialogService.confirm({ title: "操作确认", message: '确认生效该质押单？' });
    if (!confirmed) return;
    try {
      await this.cargoMortgageService.updateStage(id, stage);
      await this.dialogService.alert({ title: "", message: '操作成功' });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "", message: err.message, icon: "error" });
    }
  }

  async cancelMortgage(id) {
    let cargoMortgage = await this.cargoMortgageService.getCargoMortgage(id);
    let result = await this.dialogService.open({ viewModel: CancelMortgage, model: cargoMortgage, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let output = result.output;
    try {
      await this.cargoMortgageService.cancelMortgage(id, output);
      await this.messageDialogService.alert({ title: "操作成功", message: "解押提交成功，待审核" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "操作失败", message: err.message, icon: "error" });
    }
  }
}