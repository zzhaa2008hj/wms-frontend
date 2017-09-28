import { autoinject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { StorageBudgetItem } from "@app/fee/models/storage-budget";
import { StorageBudgeService } from "@app/fee/services/storage-budget";
import * as moment from 'moment';
import { Organization } from '@app/base/models/organization';
import { CargoInfoService } from "@app/base/services/cargo-info";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { StorageInfo } from "@app/base/models/storage";
@autoinject
export class StorageBudgetList {
  storageBudget = [] as StorageBudgetItem[];
  dataSource: kendo.data.DataSource;
  batchNumbersDataSource: kendo.data.DataSource;
  customerId: string;
  batchNumber: string;
  endDate: Date;
  endDatePicker: any;
  customers: Organization[];
  batchNumbers = [] as StorageInfo[];
  units = [] as DictionaryData[];
  totalCost = 0;
  constructor(private dialogService: DialogService,
    private storageBudgeService: StorageBudgeService,
    private dictionaryDataService: DictionaryDataService,
    private cargoInfoService: CargoInfoService) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.storageBudget);
        }
      }
    });

    this.batchNumbersDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.batchNumbers);
        }
      }
    });
  }

  async activate() {
    this.customers = await this.cargoInfoService.getCustomers(1);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }

  async select() {
    if (!this.endDate) {
      return this.dialogService.alert({ title: "提示", message: "请选择结束时间", icon: 'error' });
    }
    if (!this.customerId) {
      return this.dialogService.alert({ title: "提示", message: "请选择客户", icon: 'error' });
    }
    let budgetEndDate = moment(this.endDate).hour(23).minute(59).second(59).format("YYYY-MM-DD HH:mm:ss");
    this.storageBudget = await this.storageBudgeService.getStorageBudgetList(this.customerId, this.batchNumber, budgetEndDate);
    if (this.storageBudget.length == 0) {
      this.dataSource.read();
      return this.dialogService.alert({ title: "提示", message: "该客户暂无仓储预算", icon: 'error' });
    }
    this.storageBudget.map(x => {
      // if (x.startDate) x.startDate = new Date(x.startDate);
      // if (x.endDate) x.endDate = new Date(x.endDate);
      if (x.instockDate) x.instockDate = new Date(x.instockDate);
      let unit = this.units.find(r => r.dictDataCode == x.unit);
      if (unit) x.unitStr = unit.dictDataName;
      if (x.sumAmount) this.totalCost = x.sumAmount;
    });
    this.dataSource.read();
  }

  /**
 * 客户 -> 批次
 */
  async customerChanged() {
    if (this.customerId) {
      this.batchNumbers = await this.storageBudgeService.getBatchNumbers(this.customerId);
      this.batchNumbersDataSource.read();
    }
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    console.log(e.data.cargoRateStepList)
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            e.data.cargoRateStepList.map(x => {
              let unit = this.units.find(r => r.dictDataCode == x.stepUnit);
              if (unit) x.stepUnitStr = unit.dictDataName;
            });
            options.success(e.data.cargoRateStepList);
          }
        }
      },
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        { field: 'stepPrice', title: '阶梯价' },
        { field: 'actualStepPrice', title: '实际阶梯价' },
        { field: 'valuationDays', title: '计价天数' },
        { field: 'amount', title: '费用' },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ]
    });
  }
}
