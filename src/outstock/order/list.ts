import { inject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { DataSourceFactory, requiredPermissionsAttributeResult } from '@app/utils';
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
import { RouterParams } from '@app/common/models/router-params';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { CargoInfo } from '@app/base/models/cargo-info';
import { UploadInfo } from "./upload-info";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { UserSession } from '@app/user';

export class OrderList {
  orderCriteria: OrderCriteria = {};
  startDatePicker: any;
  endDatePicker: any;
  dataSource: kendo.data.DataSource;
  id: string = '';
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  existEntering = false;
  outstockStages: any[] = ConstantValues.OutstockStages;
  userId:string ;

  constructor(@inject private orderService: OrderService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dialogService: DialogService,
              @inject private customhouseService: CustomhouseClearanceService,
              @inject private cargoInfoService: CargoInfoService,
              @inject private router: Router,
              @inject private user: UserSession,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private verifyRecordService: VerifyRecordService,
              @inject private workOrderItemService: WorkOrderItemService) {

  }

  async activate() {
    this.userId = this.user.userInfo.userId ;
    this.orderCriteria.infoId = this.routerParams.infoId;
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
    if (this.routerParams.infoId) {
      //查询该入库单的信息 判断是否是补录的入库单
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      if (cargoInfo.enteringMode && cargoInfo.enteringMode == 2) {
        this.existEntering = true;
      }
    }
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
    let confirm = await this.dialogService.confirm({ title: "提示", message: "确定生成出库单？" });
    if (!confirm) return;
    try {
      await this.orderService.createOutstockOrder(id);
      let skipConformed = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库单" });
      if (!skipConformed) {
        this.dataSource.read();
        return;
      }
      // 跳转 到出库单页面
      window.location.href = `#/outstock/order/item/${id}/view`;
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async add() {
    if (this.routerParams.infoId) {
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      if (cargoInfo.outstockStatus == 1) {
        await this.messageDialogService.alert({ title: "失败", message: "该批次货物已全部出完，无法新增出库", icon: 'error' });
        return;
      }
      if (cargoInfo.instockStatus != 1) {
        await this.messageDialogService.alert({ title: "失败", message: "该批次货物未有入库货物，无法进行出库操作", icon: 'error' });
        return;
      }
      this.router.navigateToRoute("new");
    } else {
      this.router.navigateToRoute("new");
    }
  }

  /**
   * 审核记录
   */
  async verifyHistory() {
    if (!this.id) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择指令单', icon: "error" });
      return;
    }
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = this.id;
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
    let checkConfirmed: boolean;
    if (params.stage == 14) {
      mess1 = "确认完成作业？";
      mess2 = "完成作业！";
      let arr = await this.workOrderItemService.getOutstockWorkDetails(params.id);
      if (arr == null || arr.length == 0) {
        await this.dialogService.alert({ title: "提示", message: "没有作业过程信息" });
        return;
      }
      try {
        await this.workOrderItemService.checkHasWorkItem(params.id, 2);
      } catch (err) {
        checkConfirmed = await this.dialogService.confirm({ title: "提示", message: err.message });
        if (!checkConfirmed) return;
      }
    }
    try {
      if (!checkConfirmed) {
        let confirmed = await this.messageDialogService.confirm({ title: "提示", message: mess1 });
        if (!confirmed) return;
      }
      await this.orderService.updateStage(params.id, params.stage);
      await this.messageDialogService.alert({ title: "提示", message: mess2 });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async uploadInfo(id, cargoInfoId) {
    let result = await this.dialogService.open({
      viewModel: UploadInfo,
      model: cargoInfoId,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    // await this.orderService.updateStage(id, 9);
    await this.orderService.uploadInfo(id, 9, result.output);
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

  requiredPermissions(sourceCode: string) {
    return requiredPermissionsAttributeResult(sourceCode, this.user.userInfo.menuVoList);
  }
}