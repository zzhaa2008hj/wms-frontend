import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "@app/utils";
import { OrderCriteria, OrderService } from "@app/outstock/services/order";
import * as moment from 'moment';
import { AppRouter } from "aurelia-router";

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
              private appRouter: AppRouter,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory) {

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
   * 生成出库单
   * @returns {Promise<void>}
   */
  async createOutstockOrder(id) {
    try {
      let conformed = await this.messageDialogService.confirm({ title: "提示", message: "确认生成出库单？" });
      if (!conformed) return;
      await this.orderService.createOutstockOrder(id);
      let skipConformed = await this.messageDialogService.confirm({ title: "提示", message: "生成成功！是否要查看出库单" });
      if (!skipConformed) return;
      // 跳转 到出库单页面
      this.appRouter.navigateToRoute('outstock-order');
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}