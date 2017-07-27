import { inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { OrderService } from "@app/outstock/services/order";
import { Order } from "@app/outstock/models/order";
import * as moment from 'moment';
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkStatistics } from "@app/instock/models/work";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class VerifyWarehouse {
  datasource: kendo.data.DataSource;
  status: any[] = ConstantValues.WorkInfoCategory;
  workStatistics = {} as WorkStatistics;
  units = [] as DictionaryData[];
  //outstockStages: any[] = ConstantValues.OutstockStages;

  constructor(@inject private orderService: OrderService,
              @inject private router: Router,
              @inject private workStatisticsService: WorkStatisticsService,
              @inject("outstockOrder") private outstockOrder: Order,
              @inject private dialogService: DialogService,
              @inject private workOrderItemService: WorkOrderItemService,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.workStatistics = await this.workStatisticsService.getOutstockStatistics(this.outstockOrder.id);
    this.outstockOrder.outstockDateStr = moment(this.outstockOrder.outstockDate).format("YYYY-MM-DD");
    this.outstockOrder.statusStr = this.status.find(r => r.value == this.outstockOrder.status).text;

    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.workOrderItemService.getOutstockWorkDetails(this.outstockOrder.id)
            .then(res => {
              res.map(info => {
                if (info.unit) {
                  info.unit = this.units.find(r => r.dictDataCode == info.unit).dictDataName;
                }
              });
              options.success(res);
            })
            .catch(err => options.error("", "", err));
        }
      }
    });

    this.workStatistics.batchNumber = this.outstockOrder.batchNumber;
    this.workStatistics.unit = this.outstockOrder.unit;
    this.workStatistics.workOrderCategory = this.outstockOrder.status;
    this.workStatistics.businessId = this.outstockOrder.id;
  }

  async check(status) {
    // 生成作业统计 修改审核状态
    try {
      if (status == 1) {
        await this.workStatisticsService.saveStatistics(this.workStatistics);
      }
      await this.orderService.auditBusiness(this.outstockOrder.id, status);
      await this.dialogService.alert({ title: "提示", message: "操作成功！" });
      this.router.navigateBack();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}