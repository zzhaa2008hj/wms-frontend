import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { DataSourceFactory } from "@app/utils";
import { VerifyRecordCriteria, VerifyRecordService } from '@app/common/services/verify-record';
import { DialogService, MessageDialogService } from 'ui';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { ConstantValues } from '@app/common/models/constant-values';
import { VerifyBusinessDialogNew } from "@app/instock/cargo-flow/verify-business/new";
import { VerifyCustomhouseDialogNew } from "@app/instock/cargo-flow/verify-customhouse/new";
import { CustomhouseClearanceVo } from "@app/base/models/customhouse";
import { CustomhouseClearanceService } from "@app/base/services/customhouse";
import { VerifyCustomhouseDialogEdit } from "@app/instock/cargo-flow/verify-customhouse/edit";
import { inject } from 'aurelia-framework';
import { RouterParams } from '@app/common/models/router-params';

export class CargoFlow {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  instockStages: string[] = ConstantValues.InstockStages;
  private dataSource: kendo.data.DataSource;

  constructor(@inject private cargoFlowService: CargoFlowService,
              @inject private dialogService: DialogService,
              @inject private verifyRecordService: VerifyRecordService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private customhouseService: CustomhouseClearanceService,
              @inject('routerParams') private routerParams: RouterParams) {

  }

  activate() {
    if (this.routerParams.infoId) {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.cargoFlowService
          .queryCargoFlows({ 
            infoId: this.routerParams.infoId, 
            keywords: this.searchName 
          }).map(res => {
            res.instockStageName = this.instockStages[res.stage + 1];
            return res;
          }),
        pageSize: 10
      });
    } else {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.cargoFlowService.queryCargoFlows({ keywords: this.searchName })
          .map(res => {
            res.instockStageName = this.instockStages[res.stage + 1];
            return res;
          }),
        pageSize: 10
      });
    }
  }

  select() {
    this.dataSource.read();
  }

  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.instockFlowNumber;
    verifyRecord.businessType = 1;
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

  async verifyHistory(id) {
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 1;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  /**
   * 商务审核
   */
  async verifyBusiness(id) {
    let result = await this.dialogService.open({ viewModel: VerifyBusinessDialogNew, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      let record = result.output as VerifyRecord;
      record.businessId = id;
      await this.cargoFlowService.audit(record.businessId, record.verifyStatus);
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 单证审核
   */
  async verifyCustomhouse(id) {
    let customhouseClearance = await this.customhouseService.getCustomhouseClearanceByType(1, id);
    // 修改
    if (customhouseClearance) {
      let result = await this.dialogService.open({ viewModel: VerifyCustomhouseDialogEdit, model: customhouseClearance, lock: true }).whenClosed();
      if (result.wasCancelled) return;
      try {
        let customhouse = result.output as CustomhouseClearanceVo;
        customhouse.flowId = id;
        customhouse.type = 1;
        await this.customhouseService.updateCustomhouseClearance(customhouseClearance.id, customhouse);
        await this.dialogService.alert({ title: "提示", message: "审核成功！" });
        this.dataSource.read();
        return;
      } catch (err) {
        await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
        return;
      }
    }
    // 新增
    let result = await this.dialogService.open({ viewModel: VerifyCustomhouseDialogNew, model: {}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    try {
      let customhouse = result.output as CustomhouseClearanceVo;
      customhouse.flowId = id;
      customhouse.type = 1;
      await this.customhouseService.saveCustomhouseClearance(customhouse);
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }


}