export class ConstantValues {

  static get BusinessTypes() {
    return ["入库", "出库", "货权转移", "货位转移", "货物质押", "合同"];
  }

  static get InstockStages() {
    return ["撤回中", "初始阶段", "待商务审核", "商务审核未通过", "商务审核通过", "已生成入库指令单", "入库作业中", 
      "作业完成（待审核）", "库场审核未通过", "库场审核通过", "已生成理货报告", "已生成入库单", "入库完成"];
  }
}