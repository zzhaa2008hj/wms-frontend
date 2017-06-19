export interface RateStep {
  id?: string;
  orgId: string;
  remark: string;

  // RateStep
  rateId: string;
  stepNum: number;
  stepStart: number;
  stepEnd: number;
  stepPrice: number;
  stepUnit: string; //元/天、元/吨

}