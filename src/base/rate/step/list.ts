import { inject } from "aurelia-dependency-injection";
import { DialogService, MessageDialogService } from "ui";
import { RateStepService } from "../../services/rate";
import { DataSourceFactory } from "../../../utils";
import { Rate } from "../../models/rate";
import { NewRateStep } from "./new";

export class RateStep {
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(@inject private rateStepService: RateStepService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dialogService: DialogService,
              @inject("rate") private rate: Rate,
              @inject private messageDialogService: MessageDialogService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.rateStepService.queryRateSteps(rate.id),
      pageSize: 10
    });
  }

   async add() {
    let result = await this.dialogService.open({ viewModel: NewRateStep, model: this.rate.id, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let rateStep = result.output;
    try {
      await this.rateStepService.saveRateStep(rateStep);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.rateStepService.deleteRateStep(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}