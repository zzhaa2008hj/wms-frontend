import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { OrderCriteria, OrderService, WorkOrderService } from '@app/outstock/services/order';
import * as moment from 'moment';
import { VerifyRecord } from '@app/common/models/verify-record';
import { VerifyBusinessDialogNew } from '@app/outstock/order/verify-business/new';
import { VerifyFeeDialogNew } from '@app/outstock/order/verify-fee/new';
import { VerifyCustomhouseDialogNew } from "@app/outstock/order/verify-customhouse/new";
import { CustomhouseClearanceVo } from "@app/base/models/customhouse";
import { CustomhouseClearanceService } from "@app/base/services/customhouse";
import { VerifyCustomhouseDialogEdit } from "@app/outstock/order/verify-customhouse/edit";
import { AppRouter } from "aurelia-router";
import { VerifyRecordCriteria } from '@app/common/services/verify-record';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { OutstockInventoryService } from "@app/outstock/services/inventory";

@autoinject
export class OrderList {
  orderCriteria: OrderCriteria;
  startDatePicker: any;
  endDatePicker: any;
  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private orderService: OrderService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private customhouseService: CustomhouseClearanceService,
              private workOrderService: WorkOrderService,
              private appRouter: AppRouter,
              private outstockInventoryService: OutstockInventoryService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderService.queryOrders(this.orderCriteria),
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
   * 商务审核
   */
  async verifyBusiness(id) {
    let result = await this.dialogService.open({ viewModel: VerifyBusinessDialogNew, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      let record = result.output as VerifyRecord;
      record.businessId = id;
      await this.orderService.auditBusiness(record.businessId, record.verifyStatus);
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
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
      if (!skipConformed) return;
      // 跳转 到出库单页面
      this.appRouter.navigateToRoute('outstock-orderItem');
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
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
   * 商务确认
   */
  async businessConfirm(id) {
    try {
      await this.orderService.businessConfirm(id);
      await this.dialogService.alert({ title: "提示", message: "确认成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 生成出库清单
   */
  async createOutstockInventory(batchNumber) {
    try {
      await this.outstockInventoryService.createOutstockInventory(batchNumber);
      let res = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库清单" });
      if (!res) {
        this.dataSource.read();
        return;
      }
      // 跳转 到出库清单页面
      this.appRouter.navigateToRoute('outstock-inventory');
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 生成出库作业指令单
   * @param id
   */
  async createOutstockWorkOrder(id) {
    try {
      await this.workOrderService.createOutstockWorkOrder(id);
      let skipConformed = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库作业指令单" });
      if (!skipConformed) return;
      // 跳转 到出库作业指令单页面
      this.appRouter.navigateToRoute('outstock-workOrder');
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }


}