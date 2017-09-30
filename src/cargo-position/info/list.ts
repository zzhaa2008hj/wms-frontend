import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import { DictionaryData } from "@app/base/models/dictionary";
import { StatisticsCriteria, PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { Router } from "aurelia-router";
import { VerifyRecord } from '@app/common/models/verify-record';
import { DialogService, MessageDialogService } from 'ui';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { VerifyRecordService } from '@app/common/services/verify-record';
import { UploadConfirm } from "@app/cargo-position/confirm/upload-confirm";
import { WorkOrderItemService } from "@app/instock/services/work-order";

@autoinject
export class PositionTransferInfoList {
  criteria: StatisticsCriteria = {};
  dataSource: kendo.data.DataSource;
  units: DictionaryData[] = [] as DictionaryData[];
  id: string = '';

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private positionTransferInfoService: PositionTransferInfoService,
              private router: Router,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private workOrderItemService: WorkOrderItemService,
              private verifyRecordService: VerifyRecordService) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.positionTransferInfoService.page(this.criteria),
      pageSize: 10
    });
  }

  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    let dataItem = grid.dataItem(selectedRow);
    this.id = dataItem.id;
  }

  async changeHistory() {
    if (!this.id) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择指令单', icon: "error" });
      return;
    }
    this.router.navigateToRoute("changeHistory", { id: this.id });
  }

  select() {
    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.dataSource.read();
  }

  //撤回
  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.transferNumber;
    verifyRecord.businessType = 4;
    verifyRecord.stageBeforeVerify = item.stage;
    verifyRecord.batchNumber = item.batchNumber;
    let result = await this.dialogService
      .open({ viewModel: NewVerifyRecord, model: verifyRecord, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let res = result.output;
    try {
      let conformed = await this.messageDialogService.confirm({ title: "撤回成功", message: "确认提交撤回的审批请求？" });
      if (!conformed) {
        return;
      }
      await this.verifyRecordService.addVerifyRecord(res);
      await this.messageDialogService.alert({ title: "撤回成功", message: "撤回成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "撤回失败", message: err.message, icon: "error" });
    }
  }

  //上传客户/领导签字确认单
  async uploadConfirm(e) {
    let result = await this.dialogService.open({ viewModel: UploadConfirm, model: e, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.positionTransferInfoService.updateConfirm(e.id, result.output);
      await this.dialogService.alert({ title: "提示", message: "客户/领导签字确认成功" });
      this.dataSource.read();
    } catch (err) {
      this.dialogService.alert({ title: "错误", message: err.message });
    }
  }

  //开始作业
  async startWork(id) {
    let confirm = await this.dialogService.confirm({ title: "提示", message: "是否确认开始作业;" });
    if (!confirm) return;
    try {
      await this.positionTransferInfoService.updateStartWork(id);
      await this.dialogService.alert({ title: "提示", message: "成功开始作业！" });
      this.dataSource.read();
    } catch (err) {
      this.dialogService.alert({ title: "错误", message: err.message });
    }
  }

  //作业完成
  async endWork(id) {
    let res = await this.workOrderItemService.getTransferWorkDetails(id);
    if (res == null || res.length == 0) {
      await this.dialogService.alert({ title: "提示", message: "没有作业内容！" })
      return;
    }
    let confirm = await this.dialogService.confirm({ title: "提示", message: "是否确认完成作业;" });
    if (!confirm) return;
    try {
      await this.positionTransferInfoService.updateEndWork(id);
      await this.dialogService.alert({ title: "提示", message: "作业完成！" });
      this.dataSource.read();
    } catch (err) {
      this.dialogService.alert({ title: "错误", message: err.message });
    }
  }
}