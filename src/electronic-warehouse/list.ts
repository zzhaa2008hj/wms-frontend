import { autoinject, observable } from "aurelia-framework";
import * as Raphael from 'raphael';
import { MessageDialogService, } from "ui";
import { ElectronicWarehouseService } from "@app/electronic-warehouse/service/electronic-warehouse";
import { AttachmentService } from '@app/common/services/attachment';
import { StorageInfoItem } from '@app/base/models/storage';
import { DataSourceFactory } from "@app/utils";

const selectedItemKey = 'selected-item';
@autoinject
export class ElectronicWarehouse {

  @observable
  selectedItem: any;
  //raphael初始话数据
  warehouseCargoInfo: StorageInfoItem[];
  warehouses: any[];
  //库区数据统计
  dataSource: kendo.data.DataSource;
  selectedDataSource: kendo.data.DataSource;
  rectSelected = false;
  imageUrl = '';
  r: RaphaelPaper;
  rectId: string;
  positionInit = { "x": -20, "width": 90, "y": -20, "height": 120 };
  //缩放用矩形宽高
  scaling = 10;
  //矩形边框大小
  borderSize = 4;
  minSize = 20;
  //是否能出清 true：能出清
  clearing: boolean = true;
  constructor(private messageDialogService: MessageDialogService,
    private attachmentService: AttachmentService,
    private dataSourceFactory: DataSourceFactory,
    private electronicWarehouseService: ElectronicWarehouseService) {
    this.selectedDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          let data = [];
          if (this.warehouseCargoInfo) {
            data = this.warehouseCargoInfo.filter(x => x.id == this.rectId)
          }
          options.success(data);
        }
      }
    });
  }

  async activate() {
    this.warehouses = await this.electronicWarehouseService.listWarehouseTree();
    let selectedItemId = localStorage.getItem(selectedItemKey);
    if (selectedItemId) {
      this.selectedItem = this.warehouses.find(x => x.id == selectedItemId);
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.electronicWarehouseService.warehouseCargoInfoCollect(this.selectedItem.id),
        pageSize: 10
      });
    }
  }

  test(){
    if(this.r) this.r.remove();
    this.r = Raphael("holder", document.body.clientWidth * 0.7, 500);
  }

  //保存库存位置信息
  async savePosition() {
    let data = [];
    this.r.forEach(el => {
      if (el["type"] == 'rect' && el.id.split("_").length == 1) {
        let id = el.id;
        let x = el.attr("x");
        let y = el.attr("y");
        let width = el.attr("width");
        let height = el.attr("height");
        let position = { "x": x, "y": y, "width": width, "height": height };
        data.push({ "id": id, "position": JSON.stringify(position) });
      }
      return true;
    });
    // 调用后台方法 保存库存位置信息
    try {
      await this.electronicWarehouseService.savePosition(data);
      await this.messageDialogService.alert({ title: "", message: "保存成功" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "error", message: err.message, icon: 'error' });
    }
  };

  async clearingStorageItem() {
    if (this.rectId) {
      try {
        await this.electronicWarehouseService.clearing(this.rectId);
        this.initSvg();
        await this.messageDialogService.alert({ title: "", message: "出清成功" });
      } catch (err) {
        await this.messageDialogService.alert({ title: "error", message: err.message, icon: 'error' });
      }
    }
  }
  /**
   * 库区树节点选中事件
   */
  async selectedItemChanged() {
    if (this.selectedItem.selected) {
      this.rectSelected = false;
      localStorage.setItem(selectedItemKey, this.selectedItem.id);
      this.dataSource.read();
      if (this.selectedItem.parentId) {
        this.initSvg();
      } else {
        //该节点下是否有子节点 true：没有子节点 false：有子节点
        let result = this.warehouses.every(x => x.parentId != this.selectedItem.id);
        console.log(result);
        if (result) this.initSvg();
      }
    }
  }

  //初始化svg
  async initSvg() {
    if (this.r) await this.r.remove();
    this.warehouseCargoInfo = await this.electronicWarehouseService.warehouseCargoInfo(this.selectedItem.id);
    let path = '/' + this.selectedItem.parentId + '/' + this.selectedItem.attachmentUrl;
    let attachmentUrl = this.attachmentService.view(path);
    this.imageUrl = attachmentUrl;
    this.rectId = null;
    // this.r = Raphael("holder", 1000, 500);
    this.r = await Raphael("holder", document.body.clientWidth * 0.7, 500);
    //创建绘图对象
    this.drawSvg(this.warehouseCargoInfo, this.r);
  }

  drawSvg(dataPosition, r) {
    //创建绘图对象
    for (let i = 0; i < dataPosition.length; i++) {
      let d = dataPosition[i];
      let position = null;
      if (!d.position) {
        this.positionInit.x += 20;
        this.positionInit.y += 20;
        position = this.positionInit;
      } else {
        position = JSON.parse(d.position);
      }

      let x = position.x;
      let y = position.y;
      let width = position.width;
      let height = position.height;
      //先生成文本 再生成图形
      let text = '';
      let eleText = null;
      if (d.storageQuantity == 0 && d.storageNumber == 0) {
        // text = `(可出清)\n${d.batchNumber}\n${d.customerName}\n${d.cargoName}`;
        text = `(可出清)\n${d.batchNumber}`;
        eleText = r.text(x + width / 2, y + height / 2, text).attr("fill", "red");
      } else {
        // text = `${d.batchNumber}\n${d.customerName}\n${d.cargoName}`;
        text = `${d.batchNumber}`;
        eleText = r.text(x + width / 2, y + height / 2, text);
      }
      if (width < 70) {
        eleText.attr("text", "......");
      }
      //图形元素的id = uuid 
      //文本元素id = uuid + "_"
      //拖动矩形id = uuid + "_rigth_buttom" 
      //拖动矩形 位置： rigth_buttom rigth_top left_buttom left_top
      eleText.id = d.id + "_";

      let ele = r.rect(x, y, width, height, this.borderSize);
      ele.id = d.id;
      ele.attr({ fill: "grey", stroke: "grey", "fill-opacity": 0, cursor: "move", title: text })
        .drag(
        //拖动事件
        (dx: number, dy: number) => {
          let id = ele.id;
          let x = ele["ox"] + dx;
          let y = ele["oy"] + dy;
          let width = ele.attr("width");
          let height = ele.attr("height");
          let att = { x: x, y: y };
          ele.attr(att);
          //同时移动文本
          let textEle = this.r.getById(id + "_");
          textEle.attr({ x: x + width / 2, y: y + height / 2 });
          //移动缩放用矩形
          let scalingEle = this.r.getById(id + "_right_buttom");
          scalingEle.attr({ x: x + width - this.scaling + this.borderSize, y: y + height - this.scaling + this.borderSize });
        },
        //拖动节点开始时的事件
        () => {
          ele["ox"] = ele.attr("x");
          ele["oy"] = ele.attr("y");
          ele.animate({
            "fill-opacity": .2
          }, 500);
        },
        //拖动结束后的事件
        () => {
          ele.animate({
            "fill-opacity": 0
          }, 500);
        }).click(() => this.doClick(ele));

      //生成缩放用矩形
      // x, y, width, height
      let eleScaling = r.rect(x + width - this.scaling + this.borderSize, y + height - this.scaling + this.borderSize, this.scaling - this.borderSize, this.scaling - this.borderSize)
        .attr({ "fill": "white", "stroke": "#666", 'stroke-width': 'outBorderSize', "fill-opacity": 0, cursor: "nwse-resize", })
        .drag(
        //拖动事件，同时缩放堆位矩形
        (dx: number, dy: number) => {
          //缩放堆位矩形
          let rectEle = this.r.getById(eleScaling.id.split("_")[0]);
          if (rectEle["owidth"] + dx < this.minSize) {
            dx = this.minSize - rectEle["owidth"];
          }
          if (rectEle["oheight"] + dy < this.minSize) {
            dy = this.minSize - rectEle["oheight"];
          }
          rectEle.attr({
            'width': rectEle["owidth"] + dx,//拖动后的宽度 = 拖动前的宽度 + x轴的位移
            'height': rectEle["oheight"] + dy//拖动后的高度 = 拖动前的高度 + y轴的位移
          });
          //重新定位文字
          let textEle = this.r.getById(eleScaling.id.split("_")[0] + "_");
          textEle.attr({ x: rectEle.attr("x") + rectEle.attr("width") / 2, y: rectEle.attr("y") + rectEle.attr("height") / 2 });
          if (rectEle["owidth"] + dx < 70) {
            textEle.attr("text", "......");
          } else {
            let info = this.warehouseCargoInfo.find(x => x.id == eleScaling.id.split("_")[0]);
            let initText = "";
            if (info.storageQuantity == 0 && info.storageNumber == 0) {
              initText = `(可出清)\n${info.batchNumber}`;
            } else {
              initText = `${info.batchNumber}`;
            }
            textEle.attr("text", initText);
          }
          //自身重新定位
          let att = { x: eleScaling["ox"] + dx, y: eleScaling["oy"] + dy };
          eleScaling.attr(att);
        },
        //拖动节点开始时的事件
        () => {
          let rectEle = this.r.getById(eleScaling.id.split("_")[0]);
          rectEle["owidth"] = rectEle.attr("width");
          rectEle["oheight"] = rectEle.attr("height");

          eleScaling["ox"] = eleScaling.attr("x");
          eleScaling["oy"] = eleScaling.attr("y");
          eleScaling.animate({
            "fill-opacity": .2
          }, 500);
        },
        //拖动结束后的事件
        () => {
          eleScaling.animate({
            "fill-opacity": 0
          }, 500);
        });
      eleScaling.id = d.id + "_right_buttom";
    }
  }

  //图形的点击事件
  doClick(obj) {
    if (!this.rectId || this.rectId != obj.id) {
      if (this.rectId) {
        //先取消之前图形的选中状态
        this.removeRectSelect(this.r.getById(this.rectId));
      }
      //把图形变为选中状态
      this.addRectSelect(obj);
      this.rectId = obj.id;
      let info = this.warehouseCargoInfo.find(x => x.id == this.rectId);
      if (info.storageQuantity == 0 && info.storageNumber == 0) {
        this.clearing = true;
      } else {
        this.clearing = false;
      }
      this.selectedDataSource.read();
      this.rectSelected = true;
    }
  }

  unSelect(e) {
    if (e.target.nodeName != "rect") {
      //当有矩形被选中时,矩形选中状态取消
      if (this.rectId) {
        this.removeRectSelect(this.r.getById(this.rectId));
        this.rectSelected = false;
      }
      //清空记录当前选中图形id的input框的值
      this.rectId = null;
      this.clearing = false;
    }
  }

  //取消图形的选中状态
  removeRectSelect(obj) {
    obj.attr({
      fill: "grey",
      stroke: "grey",
      "stroke-width": 1,
    })
  }

  //为选中的图形添加选中状态
  addRectSelect(obj) {
    obj.attr({
      fill: "green",
      stroke: "green",
      "stroke-width": 2,
    })
  }



}