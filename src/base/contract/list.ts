import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from 'ui';
import { DataSourceFactory } from "@app/utils";
import { ContractService } from "@app/base/services/contract";
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { VerifyRecordService, VerifyRecordCriteria } from '@app/common/services/verify-record';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { ConstantValues } from '@app/common/models/constant-values';
import { Router } from 'aurelia-router';
import { Contract } from '@app/base/models/contract';

@autoinject
export class ContractList {
  searchName: string;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  contractId: string;
  contractTypes: any[] = ConstantValues.ContractTypes;
  contractStages = ConstantValues.ContractStage;

  constructor(private contractService: ContractService,
              private messageDialogService: MessageDialogService,
              private dialogService: DialogService,
              private verifyRecordService: VerifyRecordService,
              private router: Router,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.contractService.queryContracts({ searchName: this.searchName }).map(res => {
        res.contractTypeStr = this.contractTypes.find(r => r.type == res.contractType).name;
        res.statusTitle = this.contractStages.find(r => r.stage == res.status).title;
        return res;
      }),
      pageSize: 10
    });
  }

  async delete(id) {
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该合同！" });
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

  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.batchNumber = "";
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.contractNumber;
    verifyRecord.businessType = 6;
    verifyRecord.stageBeforeVerify = 3;
    let result = await this.dialogService
      .open({ viewModel: NewVerifyRecord, model: verifyRecord, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let res = result.output;
    try {
      await this.verifyRecordService.addVerifyRecord(res);
      await this.messageDialogService.alert({ title: "撤回成功", message: "撤回成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "撤回失败", message: err.message, icon: "error" });
    }
  }

  async verifyHistory() {
    if (!this.contractId) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择合同', icon: "error" });
      return;
    }
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = this.contractId;
    criteria.businessType = 6;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async changeHistory() {
    if (!this.contractId) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择合同', icon: "error" });
      return;
    }
    this.router.navigateToRoute('changeHistory', { id: this.contractId });
  }

  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    let dataItem = grid.dataItem(selectedRow);
    this.contractId = dataItem.id;
  }

  checkDate(dataItem) {
    let contract = dataItem as Contract;
    if (contract.startTime.getTime() <= new Date().getTime()) {
      return true;
    }
    return false;
  }

  async changeStatus(id, status) {
    let msg = "";
    if (status == 4) {
      msg = "确定使该合同生效吗？";
    } else {
      msg = "确定使该合同失效吗？";
    }
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: msg });
    if (confirm) {
      try {
        await this.contractService.changeStatus(id, status);
        this.dataSource.read();
      } catch (err) {
        await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
      }
    }
  }
}