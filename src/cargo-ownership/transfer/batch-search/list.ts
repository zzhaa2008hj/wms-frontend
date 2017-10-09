import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from "@app/common/models/constant-values";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { DialogService } from "ui";
import { BtnSearchView } from "@app/cargo-ownership/transfer/batch-search/view";

export class CargoownershipTransferList {
  btn = ""  ;
  show = 0 ;
  dataInSource: kendo.data.DataSource;
  dataOutSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };


  constructor(@inject private dataSourceFactory: DataSourceFactory,
              @inject private cargoService : CargoownershipTransferService,
              @inject private dialogService :DialogService) {

  }

  activate() {
    this.dataInSource = this.dataSourceFactory.create({
      query: () => this.cargoService.getTsfInHistory(this.btn)
        .map(res => {
          let stage = ConstantValues.ownerTsfStage.find(r => r.stage == res.stage);
          if (stage) {
            res.stageName = stage.title;
          }
          let lastStage = ConstantValues.ownerTsfStage.find(r => r.stage == res.lastStage);
          if (lastStage) {
            res.lastStageName = lastStage.title;
          }
          res.transferDate = new Date(res.transferDate);
          return res;
        }),

      pageSize: 10
    });

    this.dataOutSource = this.dataSourceFactory.create({
      query: () => this.cargoService.getTsfOutHistory(this.btn)
        .map(res => {
          let stage = ConstantValues.ownerTsfStage.find(r => r.stage == res.stage);
          if (stage) {
            res.stageName = stage.title;
          }
          let lastStage = ConstantValues.ownerTsfStage.find(r => r.stage == res.lastStage);
          if (lastStage) {
            res.lastStageName = lastStage.title;
          }
          res.transferDate = new Date(res.transferDate);
          return res;
        }),

      pageSize: 10
    });
  }

  select() {
    if(this.btn == "" || this.btn == null ){
      this.dialogService.alert({ title: "提示", message: "请输入批次号！" });
      return ;
    }
    this.dataInSource.read();
    this.dataOutSource.read();
    this.show = 1 ;
  }

  async showInfo(id){
    let result = await this.dialogService
      .open({ viewModel: BtnSearchView, model: { id: id }, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    this.dataInSource.read();
    this.dataOutSource.read();

  }






}