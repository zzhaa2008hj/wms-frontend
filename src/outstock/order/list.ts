import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { OrderCriteria, OrderService } from '@app/outstock/services/order';
import * as moment from 'moment';
import { VerifyFeeDialogNew } from '@app/outstock/order/verify-fee/new';
import { VerifyCustomhouseDialogNew } from "@app/outstock/order/verify-customhouse/new";
import { CustomhouseClearanceVo } from "@app/base/models/customhouse";
import { CustomhouseClearanceService } from "@app/base/services/customhouse";
import { VerifyCustomhouseDialogEdit } from "@app/outstock/order/verify-customhouse/edit";
import { Router } from "aurelia-router";
import { VerifyRecordCriteria, VerifyRecordService } from '@app/common/services/verify-record';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { ConstantValues } from "@app/common/models/constant-values";
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';

@autoinject
export class OrderList {
  orderCriteria: OrderCriteria = {};
  startDatePicker: any;
  endDatePicker: any;
  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  outstockStages: any[] = ConstantValues.OutstockStages;

  constructor(private orderService: OrderService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private customhouseService: CustomhouseClearanceService,
              private router: Router,
              private verifyRecordService: VerifyRecordService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderService.queryOrders(this.orderCriteria)
        .map(res => {
          if (res.cargoType == 1) {
            res.clearanceStatus = true;
          }
          res.outstockStageName = this.outstockStages.find(r => r.stage == res.stage).title;
          let lastStage = this.outstockStages.find(r => r.stage == res.lastStage);
          if (lastStage) {
            res.outstockLastStageName = lastStage.title;
          }
          return res;
        }),
      pageSize: 10
    });
  }

  async delete(id) {
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该出库指令吗？" });
    if (confirm) {
      try {
        await this.orderService.delete(id);
        await this.messageDialogService.alert({ title: "", message: "删除成功！" });
        this.dataSource.read();
      } catch (err) {
        await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
      }
    }
  }

  select() {
    if (this.orderCriteria.beginDate) {
      this.orderCriteria.beginDate = this.orderCriteria.beginDate ? moment(this.orderCriteria.beginDate)
        .format("YYYY-MM-DD") : '';
    }
    if (this.orderCriteria.endDate) {
      this.orderCriteria.endDate = this.orderCriteria.endDate ? moment(this.orderCriteria.endDate)
        .format("YYYY-MM-DD") : '';
    }
    this.dataSource.read();
  }

  reset() {
    this.orderCriteria = {} as OrderCriteria;
    this.dataSource.read();
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


  /**
   * 费收审核
   */
  async verifyFee(id) {
    let result = await this.dialogService.open({ viewModel: VerifyFeeDialogNew, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.orderService.auditFee(id, result.output);
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
    let customhouseClearance = await this.customhouseService.getCustomhouseClearanceByType(2, id);
    // 修改
    if (customhouseClearance) {
      let result = await this.dialogService.open({
        viewModel: VerifyCustomhouseDialogEdit,
        model: customhouseClearance,
        lock: true
      }).whenClosed();
      if (result.wasCancelled) return;
      try {
        let customhouse = result.output as CustomhouseClearanceVo;
        customhouse.flowId = id;
        customhouse.type = 2;
        await this.customhouseService.updateCustomhouseClearance(customhouseClearance.id, customhouse);
        await this.dialogService.alert({ title: "提示", message: "修改审核成功！" });
        this.dataSource.read();
        return;
      } catch (err) {
        await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
        return;
      }
    }
    // 新增
    let result = await this.dialogService.open({
      viewModel: VerifyCustomhouseDialogNew,
      model: {},
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    try {
      let customhouse = result.output as CustomhouseClearanceVo;
      customhouse.flowId = id;
      customhouse.type = 2;
      await this.customhouseService.saveCustomhouseClearance(customhouse);
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 生成出库单
   * @returns {Promise<void>}
   */
  async createOutstockOrder(id) {
    try {
      await this.orderService.createOutstockOrder(id);
      let skipConformed = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库单" });
      if (!skipConformed) {
        this.dataSource.read();
        return;
      }
      // 跳转 到出库单页面
      this.goStockOut();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  goStockOut() {
    this.router.navigateToRoute('outstock-orderItem');
  }

  /**
   * 审核记录
   */
  async verifyHistory(id) {
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 2;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  /**
   * 作业开始
   */
  async changeStage(params) {
    let mess1 = "确认开始作业？";
    let mess2 = "开始作业！";
    if (params.stage == 14) {
      mess1 = "确认完成作业？";
      mess2 = "完成作业！";
    }
    try {
      let confirmed = await this.messageDialogService.confirm({ title: "提示", message: mess1 });
      if (!confirmed) return;
      await this.orderService.updateStage(params.id, params.stage);
      await this.messageDialogService.alert({ title: "提示", message: mess2 });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async uploadInfo(id) {
    await this.orderService.updateStage(id, 9);
    this.dataSource.read();
  }
  /**
   * 撤回
   */
  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.outstockOrderNumber;
    verifyRecord.businessType = 2;
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
}