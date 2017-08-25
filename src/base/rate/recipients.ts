import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { RateStepService } from '@app/base/services/rate';
import { RateStep } from '@app/base/models/rate';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

@customElement('rate-recipients')
export class RateRecipients {

  @bindable
  @observable
  rateId: string;

  rateSteps = [] as RateStep[];
  unit = [] as DictionaryData[];

  dataSource = new kendo.data.DataSource({
    data: []
  });

  constructor(private rateStepService: RateStepService,
              private dictionaryDataService: DictionaryDataService) {
                
  }

  async rateIdChanged() {    
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");    
    this.rateSteps = await this.rateStepService.listRateStepByRateId(this.rateId);
    if (this.rateSteps.length > 0) {
      this.rateSteps.forEach(rs => {
        rs.stepUnitStr = this.unit.find(u => u.dictDataCode == rs.stepUnit).dictDataName;
      });

      this.dataSource.data(this.rateSteps);
    }
  }
}