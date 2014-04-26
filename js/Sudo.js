/**
 * 数独游戏js版
 * 
 * @author:tiger
 * @email:lei2005826@126.com
 * @date:2013-4-13
 * 
 */
Sudoku = function(size) {
	this.size = size||9;
};

Sudoku.prototype = {
	usedTime : 0,		// 玩家所用的时间
	gameState : 'init',	// 游戏状态
	gameTimer : null,	// 计时器
	layout : [],		// 游戏局面
	answer : [],		// 答案
	answerPosition : [],// 答案的索引
	solving : [],		// 游戏时的待填局面
	resetData : [],	// 记录初始局面重置局面用
	editIndex: '',		//现在正在编辑id
	mask : null,		// 遮罩层


	// 初始化
	init : function() {
		this.usedTime = 0;
		for (var i = 0; i < this.size; i++) {
			for (var j = 0; j < this.size; j++) {
				this.layout[i * this.size + j] = 0;
				this.solving[i * this.size + j] = 0;
				this.answerPosition[i * this.size + j] = 0;
				for (var h = 0; h < this.size; h++) {
					this.answer[i * this.size * this.size + j * this.size + h] = 0;
				}
			}
		}
	},
	// 取指定行列的答案
	getAnswer : function(row, col) {
		for (var i = 1; i <= this.size; i++) {
			this.answer[row * this.size * this.size + col * this.size + i - 1] = i;// 假定包含所有解
		}
		// 去除已经包含的
		for (var i = 0; i < this.size; i++) {
			if (this.layout[i * this.size + col] != 0) {
				this.answer[row * this.size * this.size + col * this.size
						+ this.layout[i * this.size + col] - 1] = 0;// 去除列中包含的元素
			}
			if (this.layout[row * this.size + i] != 0) {
				this.answer[row * this.size * this.size + col * this.size
						+ this.layout[row * this.size + i] - 1] = 0;// 去除行中包含的元素
			}
		}
		var subnum = Math.floor(Math.sqrt(this.size));
		var x = Math.floor(row / subnum);
		var y = Math.floor(col / subnum);
		for (var i = x * subnum; i < subnum + x * subnum; i++) {
			for (var j = y * subnum; j < subnum + y * subnum; j++) {
				if (this.layout[i * this.size + j] != 0)
					this.answer[row * this.size * this.size + col * this.size
							+ this.layout[i * this.size + j] - 1] = 0;// 去小方格中包含的元素
			}
		}
		this.randomAnswer(row, col);
	},
	// 对指定行列的答案随机排序
	randomAnswer : function(row, col) {
		// 随机调整一下顺序
		var list = [];
		for (var i = 0; i < this.size; i++)
			list.push(this.answer[row * this.size * this.size + col * this.size
					+ i]);
		var rdm = 0, idx = 0;
		while (list.length != 0) {
			rdm = Math.floor(Math.random() * list.length);
			this.answer[row * this.size * this.size + col * this.size + idx] = list[rdm];
			list.splice(rdm, 1);
			idx++;
		}
	},
	// 计算指定行列可用解的数量
	getAnswerCount : function(row, col) {
		var count = 0;
		for (var i = 0; i < this.size; i++)
			if (this.answer[row * this.size * this.size + col * this.size + i] != 0)
				count++;
		return count;
	},
	// 返回指定行列在指定位置的解
	getAnswerNum : function(row, col, ansPos) {
		// 返回指定布局方格中指定位置的解
		var cnt = 0;
		for (var i = 0; i < this.size; i++) {
			// 找到指定位置的解，返回
			if (cnt == ansPos
					&& this.answer[row * this.size * this.size + col
							* this.size + i] != 0)
				return this.answer[row * this.size * this.size + col
						* this.size + i];
			if (this.answer[row * this.size * this.size + col * this.size + i] != 0)
				cnt++;// 是解，调整计数器
		}
		return 0;// 没有找到，逻辑没有问题的话，应该不会出现这个情况
	},
	// 生成游戏局面
	generate : function() {
		this.init();
		var curRow = 0, curCol = 0;
		while (curRow != this.size) {
			if (this.answerPosition[curRow * this.size + curCol] == 0)
				this.getAnswer(curRow, curCol);// 如果这个位置没有被回溯过，就不用重新计算解空间
			var ansCount = this.getAnswerCount(curRow, curCol);
			if (ansCount == this.answerPosition[curRow * this.size + curCol]
					&& curRow == 0 && curCol == 0)
				break;// 全部回溯完毕
			if (ansCount == 0) {
				this.answerPosition[curRow * this.size + curCol] = 0;// 无可用解，应该就是0
				// alert("无可用解，回溯！");
				if (curCol > 0) {
					curCol--;
				} else if (curCol == 0) {
					curCol = 8;
					curRow--;
				}
				this.layout[curRow * this.size + curCol] = 0;
				continue;
			}
			// 可用解用完
			else if (this.answerPosition[curRow * this.size + curCol] == ansCount) {
				// alert("可用解用完，回溯！");
				this.answerPosition[curRow * this.size + curCol] = 0;
				if (curCol > 0) {
					curCol--;
				} else if (curCol == 0) {
					curCol = 8;
					curRow--;
				}
				this.layout[curRow * this.size + curCol] = 0;
				continue;
			} else {
				// 返回指定格中，第几个解
				this.layout[curRow * this.size + curCol] = this.getAnswerNum(
						curRow, curCol, this.answerPosition[curRow * this.size
								+ curCol]);
				// alert("位置：(" + curRow + ", " + curCol + ")="
				// + layout[curRow][curCol]);
				this.answerPosition[curRow * this.size + curCol]++;
				if (curCol == 8) {
					curCol = 0;
					curRow++;
				} else if (curCol < 8) {
					curCol++;
				}
			}
		}
	},
	//绑定事件
	gameEvent : function() {
		var self=this;
		//按钮点击事件
		$("#btn input:button").click(function(eventObject){
			switch(eventObject.currentTarget.name){
				case "start":
					self.initLayout();
					break;
				case "pause":
					self.pause();
					break;
				case "showAnswer":
					self.showAnswer();
					break;
				case "reset":
					self.reset();
					break;
			}
		});
		//单击可编辑事件
		$("#gameBoard").click(function(eventObj){
			var $target = $(eventObj.target);
			var posi = $target.position();
			var gameBoardPos = $(this).position();
			var selectBoardPos = {top:gameBoardPos.top+posi.top,left:gameBoardPos.left+posi.left};
			var $selectBoard = $("#selectBoard");
			if($target.hasClass('editable')){
				if(posi.top+$selectBoard.height()>$(this).height()){
					selectBoardPos.top = selectBoardPos.top-$selectBoard.height()+$target.height();
				}
				if(posi.left+$selectBoard.width()>$(this).width()){
					selectBoardPos.left = selectBoardPos.left-$selectBoard.width()+$target.width();
				}
				$selectBoard.css({'top':selectBoardPos.top,'left':selectBoardPos.left,'display':'block'});
				self.editIndex = eventObj.target.id;
			}
		});
		//数字面板点击事件
		$('#selectBoard').click(function(eventObj){
			var $target = $(eventObj.target);
			var userNum = parseInt($target.text());
			self.tmpnum = parseInt($("#"+self.editIndex).text());
			$("#"+self.editIndex).text(userNum);
			self.solving[self.editIndex] = userNum;
			for(var i=0;i<self.size*self.size;i++)$("#"+i).removeClass('background0');
			self.check();
			$('#selectBoard').css({'display':'none'});
			var solveStr = self.solving.join();
			if(solveStr.indexOf('0')<0){self.checkAllAnswer();}//最后一个检查是否完成游戏			
		}).mouseleave(function(){
			$(this).css({'display':'none'});
		});;

	},
	// 初始化游戏局面
	initLayout : function() {
		var checkedIndex = this.getLevel()||1;	// 游戏难度级别
		var layoutStr = "";//游戏局面html
		var selectTable = "";//数字选择框
		this.gameState = "start";
		$('#btn input[name="pause"]').val('暂停游戏');
		this.generate(this.size);
		$("#gameBoard").html("");
		$('#selectBoard').html("");
		for (var i = 0; i < this.size; i++) {
			for (var j = 0; j < this.size; j++) {
				var rdm;
				if(checkedIndex<4){
					rdm = Math.floor(Math.random() * 4+1);//12345  1/5 2/5 3/5 3/4
				}else{
					rdm = Math.floor(Math.random() * 4+2);
				}
				if( ((i<3||i>5) && (j<3||j>5)) || ((i>=3&&i<=5) && (j>=3&&j<=5)) ){
					background = "background1";
				}else{
					background = "background2";
				}
				if( checkedIndex < rdm){
					layoutStr += '<div class="block radius '+background+'" id="'+(i*this.size+j)+'" name="blank">'+this.layout[i*this.size+j]+'</div>'
					this.solving[i * this.size + j] = this.layout[i * this.size
							+ j];	
				}else{
					console.log("==");
					layoutStr += '<div class="block radius editable '+background+'" id="'+(i*this.size+j)+'" name="blank">'+""+'</div>'
				}
			}
		}
		$("#gameBoard").html(layoutStr);
		// 消除可能存在的多解情形
		var isUnique = this.checkUnique();
		if(isUnique){
			this.regenerate(isUnique);
		}
		this.resetData = this.solving.concat();
		//数字选择表初始化
		for(var i=1 ; i<10 ; i++){
			selectTable += '<div name="selectDiv" class="selectDiv font block color radius">'+ i +'</div>';
		}
		$('#selectBoard').html(selectTable);
		//生成成功计时开始
		var self = this;
		clearInterval(this.gameTimer);
		this.gameTimer = null;
		this.gameTimer = setInterval(function(){
			self.showTime()
		},1000);
	},
	// 检查玩家的答案是否正确
	checkAllAnswer : function() {
		var flag = 0;
		for (var i = 0; i < this.size; i++) {
			for (var j = 0; j < this.size; j++) {
				if (this.solving[i * this.size + j] != this.layout[i
						* this.size + j]) {
					flag++;
					$('#'+(i*this.size+j)).css("color",'red');
					this.showTips("有错误哦！");
				}
			}
		}
		if (flag == 0 && this.gameState != 'init') {
			clearInterval(this.gameTimer);
			//console.log("完全正确！");
			this.showTips("你太棒了");
		}
	},
	// 判断生成的游戏局面是否只有一种答案
	checkUnique : function() {
		var res = [];
		for (var r1 = 0; r1 < this.size - 1; r1++) {
			for (var r2 = r1 + 1; r2 < this.size; r2++) {
				for (var c1 = 0; c1 < this.size - 1; c1++) {
					for (var c2 = c1 + 1; c2 < this.size; c2++) {
						if (this.layout[r1 * this.size + c1] == this.layout[r2
								* this.size + c2]
								&& this.layout[r1 * this.size + c2] == this.layout[r2
										* this.size + c1]) {
							res.push([r1, r2, c1, c2]);
						}
					}
				}
			}
		}
		return res;
	},
	regenerate:function(isUnique){
		for (i = 0; i < isUnique.length; i++) {
			var r1 = isUnique[i][0];
			var r2 = isUnique[i][1];
			var c1 = isUnique[i][2];
			var c2 = isUnique[i][3];
			// 如果多解的四个格子都为空
			if (this.solving[r1 * this.size + c1] == 0
					&& this.solving[r1 * this.size + c2] == 0
					&& this.solving[r2 * this.size + c1] == 0
					&& this.solving[r2 * this.size + c2] == 0) {
				// 四个空中，随机填上一个
				var rdm = Math.floor(Math.random() * 4);
				var r = isUnique[i][Math.floor(rdm / 2)];
				var c = isUnique[i][rdm % 2 + 2];
				$('#'+(r * this.size + c)).text(this.layout[r * this.size + c]).removeClass('editable');
				this.solving[r * this.size + c] = this.layout[r * this.size + c];
			}
		}
		//console.log(this.solving+"\n"+this.layout+"\n"+this.answerPosition)
		},
	showAnswer:function(){
		this.reset(1);
		for(var i = 0; i<this.size; i++){
			for(var j = 0;j <this.size; j++){
				$('#'+(i * this.size + j)).text(this.layout[i * this.size + j]);
			}
		}
	},
	// 当输入答案时，检查是否有冲突
	check : function() {
		for(var _index =0;_index<this.size*this.size;_index++){
			if($("#"+_index).hasClass('editable') && this.solving[_index]){
				var row = parseInt(parseInt(_index)/9);
				var col = parseInt(parseInt(_index)%9);
				var tabX = parseInt(row/3);
				var tabY = parseInt(col/3);
				for (var i=0 ; i<9 ; i++){
					for (var j=0 ; j<9 ; j++){
						if(i==row || j==col || (parseInt(i/3)==tabX && parseInt(j/3)==tabY)){//与被检查元素相关
							if(this.solving[i*9+j] == this.solving[parseInt(_index) ]&& parseInt(_index) != i*9+j){
								$("#"+(i*9+j)).addClass('background0');
								$("#"+parseInt(_index)).addClass('background0');
							}
						}
					}
				}
			}
		}
	},
	// 游戏暂停或继续
	pause : function() {
		// 当继续时，重新开始计时
		if (this.gameState == 'pause') {
			var self = this;
			this.gameTimer = setInterval(function(){
				self.showTime()
			},1000);
			$('#btn input[name="pause"]').val('暂停游戏');
			this.gameState = 'continue';
		} else {// 暂停时，停止计时
			clearInterval(this.gameTimer);
			$('#btn input[name="pause"]').val('继续游戏');
			this.gameState = 'pause';
		}
	},
	// 取得游戏难度等级
	getLevel : function() {
		var level = $("input[name='cd-dropdown']").val();
		return level<0?1:level;
	},
	// 重新填写答案
	reset : function(_showAnswer) {
		for(var i = 0; i<Math.pow(this.size,2);i++){
			if(this.resetData[i]){
				$("#"+i).text(this.resetData[i]).removeClass('background0');
			}else{
				$("#"+i).text('').removeClass('background0');
			}
		}
		this.gameState = "start";
		$('#btn input[name="pause"]').val('暂停游戏');
		var self = this;
		clearInterval(this.gameTimer);
		if(!_showAnswer){
			this.gameTimer = null;
			this.usedTime = 0;
			this.gameTimer = setInterval(function(){
				self.showTime();
			},1000);
		}
	},
	// 将时间间隔转换为时间字符串，如90秒转化为：00:01:30
	changeTimeToString : function(time) {
		var res = '';
		var h = Math.floor(time / 3600);
		if (h < 10) {
			h = '0' + h;
		}
		var m = time % 3600;
		m = Math.floor(m / 60);
		if (m < 10) {
			m = '0' + m;
		}
		var s = time % 60;
		if (s < 10) {
			s = '0' + s;
		}
		res = h + ':' + m + ':' + s;
		return res;
	},
	//显示时间
	showTime : function(){
		this.usedTime++;
		$("#time").text(this.changeTimeToString(this.usedTime));
	},
	showTips : function(_msg){
		$("#tips").html(_msg).css({"opacity":1});
		setTimeout(function(){$('#tips').css({'opacity':0})},2000);
	}
};

jQuery(function($){
	//难度选择下拉列表创建
	$( '#cd-dropdown' ).dropdown();
	var sudoku = new Sudoku(9);
	sudoku.initLayout();
	sudoku.gameEvent()//绑定游戏面板事件
});
