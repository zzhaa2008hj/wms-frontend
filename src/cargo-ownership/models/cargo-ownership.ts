export interface CargoownershipTransfer {
  id: string;
  orgId: string;
  remark: string;

  // 客户货物主键
  cargoInfoId: string;
  
  // 原批次号
  originalBatchNumber: string;
  
  // 原代理商主键
  originalAgentId: string;
  
  // 原代理商名称
  originalAgentName: string;
  
  // 原客户主键
  originalCustomerId: string;
  
  // 原客户名称
  originalCustomerName: string;
  
  // 新批次号
  newBatchNumber: string;
  
  // 新代理商主键
  newAgentId: string;
  
  // 新代理商名称
  newAgentName: string;
  
  // 新客户主键
  newCustomerId: string;
  
  // 新客户名称
  newCustomerName: string;
  
  // 转移日期
  transferDate: Date;
  
  // 仓储费结算至日期
  storageEndDate: Date;
  
  // 出库费承担方主键
  outstockChargePayerId: string;
  
  // 出库费承担方名称
  outstockChargePayerName: string;
  
  // 业务状态
  status: number;
  
  // 上一阶段号
  lastStage: number;
  
  // 当前阶段号
  stage: number;
  
  // 审核人主键
  auditorId: string;
  
  // 审核人名称
  auditorName: string;
  
  // 审核时间
  auditTime: Date;

  stageName: string;
  lastStageName: string;
}