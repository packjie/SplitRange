var penCutout = function () {

    this.defaults = {
        drawPanel: "drawPanel",
        canvasId: "canvas",
        imgId: "imgCut",
        width: 400,
        height: 400,
        imgSrc: "file/target.jpg",
        penColor: "#0087C4",
        defaultPointList: new Array(),
        currentArea: 0, //当前是第几个区域
        showTip: function (msg) {
            alert(msg);
        }
    };
    this.init = function (options) {
        if (this.notEmptyObj(options)) {
            this.defaults = $.extend(this.defaults, options);
        }
        this.initElement();
        this.iniData();
        this.eventBind();
    };
    this.initElement = function () {
        $("#drawPanel").append('<img id="' + this.defaults.imgId + '"/><canvas id="' + this.defaults.canvasId + '"/>');
    };
    this.eventBind = function () {
        //初始化事件：
        var a = this;
        $("#" + a.can.id).mousemove(function (e) {
            var p = a.can.pointList;
            if (a.can.paint) {//是不是按下了鼠标
                a.roundIn(e.offsetX, e.offsetY);
            }
            //判断是否在点上
            a.AddNewNode(e.offsetX, e.offsetY);
            //添加动态线：
            a.draAllMove(e.offsetX, e.offsetY);
        });
        $("#" + a.can.id).mousedown(function (e) {
            var p = a.can.pointList;
            a.can.paint = true;
        });
        $("#" + a.can.id).mouseup(function (e) {
            var p = a.can.pointList;
            //拖动结束
            a.can.paint = false;
            //拖动结束；
            if (a.can.juPull) {
                a.can.juPull = false;
                a.can.curPointIndex = 0;
                //验证抠图是否闭合：闭合，让结束点=开始点；添加标记
                if(!a.can.IsClose){
                    a.equalStartPoint(p[p.length - 1].pointx, p[p.length - 1].pointy);
                }
            } else {
                //如果闭合：禁止添加新的点；
                if (!a.can.IsClose) {//没有闭合
                    //验证抠图是否闭合：闭合，让结束点=开始点；添加标记
                    // 并且判断是否需要添加点重新画点
                    a.equalStartPoint(e.offsetX, e.offsetY);
                } else {
                    //闭合
                }
            }
        });
        $("#" + a.can.id).mouseleave(function (e) {
            a.can.paint = false;
        });
    };
    this.iniData = function (options) {
        if (this.notEmptyObj(options)) {
            this.defaults = $.extend(this.defaults, options);
        }
        this.can.id = this.defaults.canvasId;
        this.can.roundr = 8;
        this.can.roundrr = 3;
        this.can.penColor = this.defaults.penColor;
        this.can.canvas = document.getElementById(this.can.id).getContext("2d");
        this.can.w = this.defaults.width;
        this.can.h = this.defaults.height;
        $("#" + this.defaults.drawPanel + ",#" + this.can.id + ",#" + this.defaults.imgId).attr({
            "width": this.defaults.width,
            "height": this.defaults.height
        }).css({
            "position": "absolute",
            "width": this.defaults.width,
            "height": this.defaults.height
        });
        $("#" + this.defaults.drawPanel).css("z-index", 0);
        $("#" + this.defaults.imgId).css("z-index", 1);
        $("#" + this.can.id).css("z-index", 2);
        this.can.curPointIndex = 0;
        //图片
        this.img.w = this.can.w;
        this.img.h = this.can.h;
        this.img.image.src = this.defaults.imgSrc;
        $("#" + this.defaults.imgId).attr({"src": this.img.image.src})
        //加载事件：
        this.ReDo();
        if (this.notEmptyObj(this.defaults.defaultPointList) && this.defaults.defaultPointList.length > 0) {
            this.setOriPoints(this.defaults.defaultPointList);
        }
    };
    this.point = function (x, y) {
        this.pointx = x;
        this.pointy = y;
    };
    //设置初始坐标点
    this.setOriPoints = function (pointObj) {
        this.clearCan();
        if (pointObj != null && pointObj.length > 0) {
            this.can.pointList = pointObj.concat();
            if (pointObj.length > 1 && pointObj[pointObj.length - 1].pointx == pointObj[0].pointx) {
                this.can.IsClose = true;
                // this.fillBackColor();
            } else {
                this.drawAllLine();
            }
        }
    };
    //图片
    this.img = {
        image: new Image(),
        id: "",
        w: 0,
        h: 0
    };
    //画布；
    this.can = {
        canvas: new Object(),
        id: "",
        w: 0,
        h: 0,
        //区域点集合
        areaList: [],
        //当前选择的区域
        currentArea: 0, 
        //坐标点集合
        pointList: new Array(),
        //圆点的触发半径：
        roundr: 7,
        //圆点的显示半径：
        roundrr: 7,
        //当前拖动点的索引值；
        curPointIndex: 0,
        //判断是否点击拖动
        paint: false,
        //判断是否点圆点拖动，并瞬间离开,是否拖动点；
        juPull: false,
        //判断是否闭合
        IsClose: false,
        // imgBack: new Image(),
        penColor: "#0087C4"
    };
    //函数：重做，清空
    this.ReDo = function () {
        this.clearCan();
        //清空历史区域
        this.can.areaList.length = 0;
        //充值区域
        this.currentArea = 0;
        //清空listPoint();
        this.can.pointList.length = 0;
        //IsClose闭合重新设为false;
        this.can.IsClose = false;
    };
    //函数：下一个区域
    this.nextArea = function () {
        if(this.can.pointList && this.can.pointList.length && this.can.IsClose){
            this.can.areaList.push(JSON.parse(JSON.stringify(this.can.pointList)));
            this.currentArea++;
            this.can.pointList.length = 0;
            this.drawAllLine();
            this.can.juPull= false;
            //IsClose闭合重新设为false;
            this.can.IsClose = false;
            //处理数据
            this.handleData();
        }else{
            this.defaults.showTip('请先绘制闭合的区域');
        }
    };
    //函数：上一个区域
    this.backArea = function () {
        if(this.can.pointList && this.can.pointList.length){
            this.can.pointList.length = 0;
            //重画
            this.clearCan();
            this.drawAllLine();
            if(this.can.areaList&&this.can.areaList.length){
                //上一个区域为闭合状态;
                this.can.IsClose = true;
            }else{
                this.draAllMove();
            }
        }else{
            if(this.can.areaList&&this.can.areaList.length){
                this.currentArea--;
                this.can.pointList = this.can.areaList[this.currentArea];
                //重画
                this.clearCan();
                this.drawAllLine();
                //上一个区域为闭合状态;
                this.can.IsClose = true;
            }
        }
    };
    this.handleData = function () {
        var imgName = $('#imgName').val();
        var sub_polys = [];
        if(this.can.areaList && this.can.areaList.length){
            for (var areaIndex = 0; areaIndex < this.can.areaList.length; areaIndex++) {
                var pointLIst = this.can.areaList[areaIndex];
                var points = [];
                if(pointLIst && pointLIst.length){
                    pointLIst.forEach(element => {
                        points.push({
                            X: element.pointx,
                            Y: element.pointy
                        });
                    });
                }
                sub_polys.push({
                    poly_id: imgName + areaIndex,
                    points: points
                });
            }
        }
        var text = '"sub_polys"'+':' +JSON.stringify(sub_polys);
        $('#textarea').val(text);
        $("#textarea").css("height", $('#textarea')[0].scrollHeight);
    };
    //保存：返回所有点的数组：
    this.SaveCut = function () {
        return this.can.pointList();
    };
    //更新区域画线
    this.drawAreaLine = function () {
        if(this.can.areaList&&this.can.areaList.length){
            this.can.areaList.forEach(area => {
                var len = area.length;
                //一个区域后则首尾元素要连线
                this.drawLine(area[0].pointx, area[0].pointy, area[len-1].pointx, area[len-1].pointy);
                for (var i = 0; i < area.length - 1; i++) {
                    this.drawLine(area[i].pointx, area[i].pointy, area[i + 1].pointx, area[i + 1].pointy);
                    //画圈
                    this.drawArc(area[i].pointx, area[i].pointy);
                    if (i == area.length - 2) {
                        this.drawArc(area[i + 1].pointx, area[i + 1].pointy);
                    }
                }
            });
        }
    };
    
    //更新画线
    this.drawAllLine = function () {
        //画线
        var p = this.can.pointList;
        var len = this.can.pointList.length;
        if(this.can.IsClose&&len){ //如果选定完一个区域后则首尾元素要连线
            this.drawLine(p[0].pointx, p[0].pointy, p[len-1].pointx, p[len-1].pointy);
        }
        for (var i = 0; i < this.can.pointList.length - 1; i++) {
            this.drawLine(p[i].pointx, p[i].pointy, p[i + 1].pointx, p[i + 1].pointy);
            //画圈
            this.drawArc(p[i].pointx, p[i].pointy);
            if (i == this.can.pointList.length - 2) {
                this.drawArc(p[i + 1].pointx, p[i + 1].pointy);
            }
        }
        //更新区域画线
        this.drawAreaLine();
    };
    //动态线针：(光标的x,y)
    this.draAllMove = function (x, y) {
        if (!this.can.IsClose) {
            if (this.can.pointList.length >= 1) {
                //重画：
                this.clearCan();
                var p = this.can.pointList;
                for (var i = 0; i < this.can.pointList.length - 1; i++) {
                    //画线
                    this.drawLine(p[i].pointx, p[i].pointy, p[i + 1].pointx, p[i + 1].pointy);
                    ////画圈
                    this.drawArc(p[i].pointx, p[i].pointy);
                    if (i == this.can.pointList.length - 2) {
                        this.drawArc(p[i + 1].pointx, p[i + 1].pointy);
                    }
                }
                if (p.length == 1) {
                    this.drawArc(p[0].pointx, p[0].pointy);
                }
                this.drawArcSmall(x, y);
                this.drawLine(p[this.can.pointList.length - 1].pointx, p[this.can.pointList.length - 1].pointy, x, y);
            }
        }
        //更新区域画线
        this.drawAreaLine();
    };
    //画线
    this.drawLine = function (startX, startY, endX, endY) {
        this.can.canvas.strokeStyle = this.can.penColor;
        this.can.canvas.lineWidth = 1;
        this.can.canvas.moveTo(startX, startY);
        this.can.canvas.lineTo(endX, endY);
        this.can.canvas.stroke();
    };
    //画圈：
    this.drawArc = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, this.can.roundrr, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    };
    //画圈：
    this.drawArcSmall = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, 0.1, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    };
    //光标移到线上画大圈：
    this.drawArcBig = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, this.can.roundr + 2, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    };
    //渲染图片往画布上
    this.showImg = function () {
        this.img.image.onload = function () {
            this.can.canvas.drawImage(this.img.image, 0, 0, this.img.w, this.img.h);
        };
    };
    //去掉pointlist最后一个坐标点：
    this.clearLastPoint = function () {
        if(this.can.pointList&&this.can.pointList.length>1){
            this.can.pointList.pop();
            //重画：
            this.clearCan();
            this.drawAllLine();
        }
    };
    //判断鼠标点是否在一个点的区域范围内
    this.judgeRange = function (x, y, point,round) {
        var flag = false;
        var absX = Math.abs((x - point.pointx));
        var absY = Math.abs((y - point.pointy));
        if(absX <= round && absY<=round){
            flag = true; 
        }
        return flag;
    };
    //判断结束点是否与起始点重合；
    this.equalStartPoint = function (x, y) {
        var p = this.can.pointList;
        if (p.length > 2 && this.judgeRange(x, y, p[0], this.can.roundr)) {
            //如果闭合
            this.can.IsClose = true;
        } else {
            // 处理边缘数据让靠近边缘的数据回归边缘
            if(Math.abs(x-0) <= this.can.roundr){
                x = 0;
            }
            if(Math.abs(x-960) <= this.can.roundr){
                x = 960;
            }
            if(Math.abs(y-0) <= this.can.roundr){
                y = 0;
            }
            if(Math.abs(y-540) <= this.can.roundr){
                y = 540;
            }
            //防止太相近的点添加到数组中
            var flag = false;
            for (var index = 0; index < p.length; index++) {
                flag = this.judgeRange(x, y, p[index], this.can.roundr);
                if(flag){
                    return;
                }
            }
            var cashP;
            // 如果和其他区域内的点重合，就取其他区域内的点
            if(this.can.areaList && this.can.areaList.length){
                this.can.areaList.forEach(element => {
                    if(element && element.length){
                        element.forEach(item => {
                            flag = this.judgeRange(x, y, item, this.can.roundr);
                            if(flag){
                                cashP = item;
                            }
                        });
                    }
                });
            }
            if(!flag) {
                if(cashP){
                    p.push(cashP);
                }else{
                    p.push(new this.point(x, y));
                }
            }
            this.can.IsClose = false;
        }
    };
    //清空画布
    this.clearCan = function () {
        this.can.canvas.clearRect(0, 0, this.can.w, this.can.h);
    };
    //判断鼠标点是不是在圆的内部：
    this.roundIn = function (x, y) {
        //刚开始拖动
        var p = this.can.pointList;
        if (!this.can.juPull) {
            for (var i = 0; i < p.length; i++) {
                if (this.judgeRange(x, y, p[i], this.can.roundr)) {
                    //说明点击圆点拖动了；
                    this.can.juPull = true;//拖动
                    this.can.curPointIndex = i;
                    p[i].pointx = x;
                    p[i].pointy = y;
                    //重画：
                    this.clearCan();
                    this.drawAllLine();
                    return;
                }
            }
        } else {//拖动中
            p[this.can.curPointIndex].pointx = x;
            p[this.can.curPointIndex].pointy = y;
            //重画：
            this.clearCan();
            this.drawAllLine();
        }
    };
    //光标移到点上
    this.AddNewNode = function (newx, newy) {
        //如果闭合
        var p = this.can.pointList;
        if (this.can.IsClose) {
            //判断光标是否在点上
            for (var i = 0; i < p.length; i++) {
                if (this.judgeRange(newx, newy, p[i], this.can.roundr)) {
                    //重画：
                    this.clearCan();
                    this.drawAllLine();
                    this.drawArcBig(p[i].pointx, p[i].pointy);
                    return;
                } else {
                    // do somthing
                }
            }
        } else {
            // 判断点是否在和已经存在的点重合
            var flag = false;
            var cashP;
            if(this.can.areaList && this.can.areaList.length){
                this.can.areaList.forEach(element => {
                    if(element && element.length){
                        element.forEach(item => {
                            flag = this.judgeRange(newx, newy, item, this.can.roundr);
                            if(flag){
                                cashP = item;
                            }
                        });
                    }
                });
            }
            for (var index = 0; index < p.length; index++) {
                flag = this.judgeRange(newx, newy, p[index], this.can.roundr);
                if(flag){
                    cashP = p[index];
                }
            }
            if(cashP) {
                this.clearCan();
                this.drawAllLine();
                this.drawArcBig(cashP.pointx, cashP.pointy);
            }
            return;
        }
    };
    this.notEmptyObj = function (obj) {
        if (obj != null && obj != undefined && obj != "") {
            return true;
        }
        return false;
    };
};