import * as moment from 'moment';
import { autoinject } from 'aurelia-dependency-injection';
import { CargoMortgageService } from '@app/cargo-mortgage/services/cargo-mortgage';
import { CargoMortgage } from '@app/cargo-mortgage/models/cargo-mortgage';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Router } from 'aurelia-router';
import { DialogService } from 'ui';

@autoinject
export class Audit {

  cargoMortgage = {} as CargoMortgage;
  units = [] as DictionaryData[];

  constructor(private cargoMortgageService: CargoMortgageService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private router: Router) {

  }

  async activate({ id }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.cargoMortgage = await this.cargoMortgageService.getCargoMortgage(id);
    this.cargoMortgage.pledgeStartDateStr = moment(this.cargoMortgage.pledgeStartDate).format('YYYY-MM-DD');
    this.cargoMortgage.pledgeEndDateStr = moment(this.cargoMortgage.pledgeEndDate).format('YYYY-MM-DD');
    if (this.cargoMortgage.cancelPledgeTime) {
      this.cargoMortgage.cancelPledgeTimeStr = moment(this.cargoMortgage.cancelPledgeTime)
        .format('YYYY-MM-DD HH:mm:ss');      
    }
    this.cargoMortgage.unitStr = this.units.find(d => d.dictDataCode == this.cargoMortgage.unit).dictDataName;
  }

  async audit(status) {
    let confirmed = await this.dialogService.confirm({title: "审核确认", message: '确认执行该操作？'});
    if (!confirmed) return;
    try {
      await this.cargoMortgageService.auditCargoMortgage(this.cargoMortgage.id, status);
      await this.dialogService.alert({title: "", message: '审核成功'});
      this.router.navigateToRoute('list');
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  cancel() {
    this.router.navigateToRoute('list');
  }
}