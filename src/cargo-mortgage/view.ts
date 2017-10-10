import * as moment from 'moment';
import { autoinject } from 'aurelia-dependency-injection';
import { CargoMortgageService } from '@app/cargo-mortgage/services/cargo-mortgage';
import { CargoMortgage } from '@app/cargo-mortgage/models/cargo-mortgage';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Router } from 'aurelia-router';

@autoinject
export class View {

  cargoMortgage = {} as CargoMortgage;
  units = [] as DictionaryData[];

  constructor(private cargoMortgageService: CargoMortgageService,
              private dictionaryDataService: DictionaryDataService,
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
    if (this.cargoMortgage.auditTime) {
      this.cargoMortgage.auditTimeStr = moment(this.cargoMortgage.auditTime).format('YYYY-MM-DD HH:mm:ss');
    }
    this.cargoMortgage.unitStr = this.units.find(d => d.dictDataCode == this.cargoMortgage.unit).dictDataName;
  }

  cancel() {
    this.router.navigateToRoute('list');
  }
}