import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { DataSourceFactory } from "@app/utils";
import { VerifyRecordCriteria, VerifyRecordService } from '@app/common/services/verify-record';
import { DialogService, MessageDialogService } from 'ui';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { ConstantValues } from '@app/common/models/constant-values';
import { VerifyCustomhouseDialogNew } from "@app/instock/cargo-flow/verify-customhouse/new";
import { CustomhouseClearanceVo } from "@app/base/models/customhouse";
import { CustomhouseClearanceService } from "@app/base/services/customhouse";
import { VerifyCustomhouseDialogEdit } from "@app/instock/cargo-flow/verify-customhouse/edit";
import { inject } from 'aurelia-framework';
import { RouterParams } from '@app/common/models/router-params';
import { InstockOrderService } from "@app/instock/services/instock-order";
import { Router } from "aurelia-router";
import { OrderItemService } from "@app/instock/services/order-item";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { CargoInfo } from '@app/base/models/cargo-info';
import { WorkOrderItemService } from "@app/instock/services/work-order";

export class CargoFlow {
  selectedItem: any;
  searchName: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  instockStages: any[] = ConstantValues.InstockStages;
  units = [] as DictionaryData[];
  private dataSource: kendo.data.DataSource;

  constructor(@inject private cargoFlowService: CargoFlowService,
              @inject private dialogService: DialogService,
              @inject private cargoInfoService: CargoInfoService,
              @inject private verifyRecordService: VerifyRecordService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private customhouseService: CustomhouseClearanceService,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private instockOrderService: InstockOrderService,
              @inject private router: Router,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private orderItemService: OrderItemService,
              @inject private workOrderItemService: WorkOrderItemService) {

  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    if (this.routerParams.infoId) {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.cargoFlowService
          .queryCargoFlows({
            infoId: this.routerParams.infoId,
            keywords: this.searchName
          }).map(res => {
            res.instockStageName = this.instockStages.find(r => r.stage == res.stage).title;
            let lastStage = this.instockStages.find(r => r.stage == res.lastStage);
            if (lastStage) {
              res.instockLastStageName = lastStage.title;
            }
            if (res.unit) {
              res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
            }
            return res;
          }),
        pageSize: 10
      });
    } else {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.cargoFlowService.queryCargoFlows({ keywords: this.searchName })
          .map(res => {
            res.instockStageName = this.instockStages.find(r => r.stage == res.stage).title;
            let lastStage = this.instockStages.find(r => r.stage == res.lastStage);
            if (lastStage) {
              res.instockLastStageName = lastStage.title;
            }
            if (res.unit) {
              res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
            }
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

  async add() {
    if (this.routerParams.infoId) {
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      if (cargoInfo.instockStatus == 1) {
        await this.messageDialogService.alert({ title: "失败", message: "该批次货物已全部入完，无法新增入库", icon: 'error' });
        return;
      }
      //验证理货报告生成状态
      let cargoFlows: CargoFlow[] = await  this.cargoFlowService.getListByCargoInfoId(this.routerParams.infoId);
      if (cargoFlows) {
        let cfs = cargoFlows.filter(cf => cf.stage > 8);
        if (cfs.length > 0) {
          await this.messageDialogService.alert({ title: "失败", message: "该批次货物已生成理货报告，无法新增入库", icon: 'error' });
          return;
        }
      }
      this.router.navigateToRoute("new");
    } else {
      this.router.navigateToRoute("new");
    }
  }

  async verifyHistory() {
    if (!this.selectedItem) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择流水!" });
      return;
    }

    let id = this.selectedItem.id;
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 1;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async changeHistory() {
    if (!this.selectedItem) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择流水!" });
      return;
    }

    let id = this.selectedItem.id;
    this.router.navigateToRoute("changeHistory", { id: id });
  }

  /**
   * 单证审核
   */
  async verifyCustomhouse(id) {
    let customhouseClearance = await this.customhouseService.getCustomhouseClearanceByType(1, id);
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
    let result = await this.dialogService.open({
      viewModel: VerifyCustomhouseDialogNew,
      model: {},
      lock: true
    }).whenClosed();
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

  /**
   * 生成入库单
   */
  async createInstockOrder() {
    if (!this.selectedItem) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择流水!" });
      return;
    }
    let id = this.selectedItem.id;

    try {
      let conformed = await this.messageDialogService.confirm({ title: "提示", message: "确认生成入库单？" });
      if (!conformed) return;
      await this.instockOrderService.createInstockOrder(id);
      await this.messageDialogService.alert({ title: "提示", message: "生成成功！" });
      this.dataSource.read();
      // 跳转 到入库单页面
      //this.router.navigateToRoute('instockOrder');
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async separateHistory() {
    if (this.selectedItem) {
      this.router.navigateToRoute('separateHistory', { id: this.selectedItem.id });
    } else {
      this.router.navigateToRoute('separateHistory');
    }
  }

  /**
   * 生成理货报告
   */
  async createInstockOrderItem() {
    if (!this.selectedItem) {
      await this.messageDialogService.alert({ title: "提示", message: "请选择流水！" });
      return;
    }
    let ids = [this.selectedItem.id];
    try {
      let confirmed = await this.messageDialogService.confirm({ title: "提示", message: "确认生成理货报告？" });
      if (!confirmed) return;
      //生成理货报告
      await this.orderItemService.saveOrderItem(ids);
      await this.messageDialogService.alert({ title: "提示", message: "生成成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 作业开始
   */
  async changeStage(params) {
    let mess1 = "确认开始作业？";
    let mess2 = "开始作业！";
    let checkConfirmed: boolean;
    if (params.stage == 6) {
      mess1 = "确认完成作业？";
      mess2 = "完成作业！";
      let arr = await this.workOrderItemService.getWorkDetails(params.id);
      if (arr == null || arr.length == 0) {
        await this.dialogService.alert({ title: "提示", message: "没有作业过程信息" });
        return;
      }
      try {
        await this.workOrderItemService.checkHasWorkItem(params.id, 1);
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
      await this.cargoFlowService.updateFlowStage(params.id, params.stage);
      await this.messageDialogService.alert({ title: "提示", message: mess2 });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 单选数据
   */
  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    this.selectedItem = grid.dataItem(selectedRow);
  }
}