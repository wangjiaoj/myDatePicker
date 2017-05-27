 (function (factory) {
     if (typeof define == 'function' && define.cmd) {
         define(function (require) {
             var $ = require('jquery');
             factory($, window, document);
         });
     } else {
         factory($, window, document);
     }
 }(function ($, window, document) {
     var cache = {};
     var $doc = $(document);
     var datepickerId = 0;

     var defaultOptions = {
         el: '',
         eCont: '',
         startDate: '', // '1980-05-01'日历展示的初始日期，也可以使用这样的格式'%y-%M-01 00:00:00',%y表示当前年份，暂不支持
         minDate: '1900-01-01 00:00:00',
         maxDate: '2099-12-31 23:59:59',
         isShowClear: true, // bool:true
         isShowOK: true, // bool:true
         isShowToday: true, // bool:true
         readOnly: false, // isShowClear false 和 readOnly true 最好同时使用,
         dateFmt: 'yyyy-MM-dd', // 格式:'yyyy-MM-dd HH:mm:ss   'H:mm:ss':时分秒   'yyyy-MM':年月 目前暂不支持'H:mm:ss':时分秒
         firstDayOfWeek: 0, // 默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一
         position: 'bottom', // 自定义弹出位置top，left,right,bottom
         calendars: 1, // 单日历还是双日历---待实现
         onpicked: function (date) {} // 选中日期时的回调函数,date是选中的日期，类型：Date
     };


     var tpl = {
         header: [
             '<div class="dpTitle">',
             '<div class="datepickerMonthMenu">',
             '<div class="navImg datepickerMonthGoPrev"><a></a></div>',
             '<div class="menuSel MMenu" style="left: 3px;"></div>',
             '<input class="datapickerinput month" readonly><label class="month"></label>',
             '<div class="navImg  datepickerMonthGoNext"><a></a></div>',
             '</div>',
             '<div class="datepickerYearMenu">',
             '<div class="navImg datepickerYearGoPrev"><a></a></div>',
             '<div class="menuSel YMenu"></div>',
             '<input class="datapickerinput year" readonly><label class="year"></label>',
             '<div class="navImg datepickerYearGoNext"><a></a></div>',
             '</div>',
             '</div>'
         ],
         time: ['<div class="dpTime" style="display: none;">',
             '<table cellspacing="0" cellpadding="0" border="0"><tbody>',
             '<tr><td rowspan="2"><span class="dpTimeStr">时间</span>&nbsp;<input class="tB inputHour inputTime" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE inputMinute inputTime" maxlength="2"><input value=":" class="tm" readonly=""><input class="tE inputSecond inputTime" maxlength="2"></td><td class="dptimeTd" ><span class="dpTimeUp"></span></td></tr>',
             '<tr><td class="dptimeTd" ><span class="dpTimeDown"></span></td></tr>',
             '</tbody></table>',
             '</div>'
         ],
         control: ['<div class="dpControl">',
             '<span class="dpButton datepickerClearInput">清空</span>',
             '<span class="dpButton datepickerToday" type="button" >今天</span>',
             '<span class="dpButton datepickerOk" type="button">确定</span>',
             '</div>'
         ],
         days: [
             '<table class="WdayTable" width="100%" border="0" cellspacing="0" cellpadding="0">',
             '<thead><tr align="center"><th><%=weekslist[0]%></th><th><%=weekslist[1]%></th><th><%=weekslist[2]%></th><th><%=weekslist[3]%></th><th><%=weekslist[4]%></th><th><%=weekslist[5]%></th><th><%=weekslist[6]%></th></tr></thead>',
             '<tbody><tr>',
             '<td class="<%=weeks[0].days[0].classname%>"><span><%=weeks[0].days[0].text%></span></td>',
             '<td class="<%=weeks[0].days[1].classname%>"><span><%=weeks[0].days[1].text%></span></td>',
             '<td class="<%=weeks[0].days[2].classname%>"><span><%=weeks[0].days[2].text%></span></td>',
             '<td class="<%=weeks[0].days[3].classname%>"><span><%=weeks[0].days[3].text%></span></td>',
             '<td class="<%=weeks[0].days[4].classname%>"><span><%=weeks[0].days[4].text%></span></td>',
             '<td class="<%=weeks[0].days[5].classname%>"><span><%=weeks[0].days[5].text%></span></td>',
             '<td class="<%=weeks[0].days[6].classname%>"><span><%=weeks[0].days[6].text%></span></td>',
             '</tr>',
             '<tr>',
             '<td class="<%=weeks[1].days[0].classname%>"><span><%=weeks[1].days[0].text%></span></a></td>',
             '<td class="<%=weeks[1].days[1].classname%>"><span><%=weeks[1].days[1].text%></span></a></td>',
             '<td class="<%=weeks[1].days[2].classname%>"><span><%=weeks[1].days[2].text%></span></a></td>',
             '<td class="<%=weeks[1].days[3].classname%>"><span><%=weeks[1].days[3].text%></span></a></td>',
             '<td class="<%=weeks[1].days[4].classname%>"><span><%=weeks[1].days[4].text%></span></a></td>',
             '<td class="<%=weeks[1].days[5].classname%>"><span><%=weeks[1].days[5].text%></span></a></td>',
             '<td class="<%=weeks[1].days[6].classname%>"><span><%=weeks[1].days[6].text%></span></a></td>',
             '</tr>',
             '<tr>',
             '<td class="<%=weeks[2].days[0].classname%>"><span><%=weeks[2].days[0].text%></span></a></td>',
             '<td class="<%=weeks[2].days[1].classname%>"><span><%=weeks[2].days[1].text%></span></a></td>',
             '<td class="<%=weeks[2].days[2].classname%>"><span><%=weeks[2].days[2].text%></span></a></td>',
             '<td class="<%=weeks[2].days[3].classname%>"><span><%=weeks[2].days[3].text%></span></a></td>',
             '<td class="<%=weeks[2].days[4].classname%>"><span><%=weeks[2].days[4].text%></span></a></td>',
             '<td class="<%=weeks[2].days[5].classname%>"><span><%=weeks[2].days[5].text%></span></a></td>',
             '<td class="<%=weeks[2].days[6].classname%>"><span><%=weeks[2].days[6].text%></span></a></td>',
             '</tr>',
             '<tr>',
             '<td class="<%=weeks[3].days[0].classname%>"><span><%=weeks[3].days[0].text%></span></a></td>',
             '<td class="<%=weeks[3].days[1].classname%>"><span><%=weeks[3].days[1].text%></span></a></td>',
             '<td class="<%=weeks[3].days[2].classname%>"><span><%=weeks[3].days[2].text%></span></a></td>',
             '<td class="<%=weeks[3].days[3].classname%>"><span><%=weeks[3].days[3].text%></span></a></td>',
             '<td class="<%=weeks[3].days[4].classname%>"><span><%=weeks[3].days[4].text%></span></a></td>',
             '<td class="<%=weeks[3].days[5].classname%>"><span><%=weeks[3].days[5].text%></span></a></td>',
             '<td class="<%=weeks[3].days[6].classname%>"><span><%=weeks[3].days[6].text%></span></a></td>',
             '</tr>',
             '<tr>',
             '<td class="<%=weeks[4].days[0].classname%>"><span><%=weeks[4].days[0].text%></span></a></td>',
             '<td class="<%=weeks[4].days[1].classname%>"><span><%=weeks[4].days[1].text%></span></a></td>',
             '<td class="<%=weeks[4].days[2].classname%>"><span><%=weeks[4].days[2].text%></span></a></td>',
             '<td class="<%=weeks[4].days[3].classname%>"><span><%=weeks[4].days[3].text%></span></a></td>',
             '<td class="<%=weeks[4].days[4].classname%>"><span><%=weeks[4].days[4].text%></span></a></td>',
             '<td class="<%=weeks[4].days[5].classname%>"><span><%=weeks[4].days[5].text%></span></a></td>',
             '<td class="<%=weeks[4].days[6].classname%>"><span><%=weeks[4].days[6].text%></span></a></td>',
             '</tr>',
             '<tr>',
             '<td class="<%=weeks[5].days[0].classname%>"><span><%=weeks[5].days[0].text%></span></a></td>',
             '<td class="<%=weeks[5].days[1].classname%>"><span><%=weeks[5].days[1].text%></span></a></td>',
             '<td class="<%=weeks[5].days[2].classname%>"><span><%=weeks[5].days[2].text%></span></a></td>',
             '<td class="<%=weeks[5].days[3].classname%>"><span><%=weeks[5].days[3].text%></span></a></td>',
             '<td class="<%=weeks[5].days[4].classname%>"><span><%=weeks[5].days[4].text%></span></a></td>',
             '<td class="<%=weeks[5].days[5].classname%>"><span><%=weeks[5].days[5].text%></span></a></td>',
             '<td class="<%=weeks[5].days[6].classname%>"><span><%=weeks[5].days[6].text%></span></a></td>',
             '</tr>',
             '</tbody></table>'
         ],
         yearMenu: [
             '<table class="year" cellspacing="0" cellpadding="3" border="0" nowrap="nowrap" data-year="<%=currentYear%>"><tbody>',
             '<tr><td                  class="<%=data[0].classname%>"><%=data[0].text%></td><td  class="<%=data[6].classname%>"><%=data[6].text%></td></tr>',
             '<tr nowrap="nowrap"><td  class="<%=data[1].classname%>"><%=data[1].text%></td><td  class="<%=data[7].classname%>"><%=data[7].text%></td></tr>',
             '<tr nowrap="nowrap"><td  class="<%=data[2].classname%>"><%=data[2].text%></td><td  class="<%=data[8].classname%>"><%=data[8].text%></td></tr>',
             '<tr nowrap="nowrap"><td  class="<%=data[3].classname%>"><%=data[3].text%></td><td  class="<%=data[9].classname%>"><%=data[9].text%> </td></tr>',
             '<tr nowrap="nowrap"><td  class="<%=data[4].classname%>"><%=data[4].text%></td><td  class="<%=data[10].classname%>"><%=data[10].text%></td></tr>',
             '<tr nowrap="nowrap"><td  class="<%=data[5].classname%>"><%=data[5].text%></td><td  class="<%=data[11].classname%>"><%=data[11].text%></td></tr>',
             '</tbody></table>',
             '<table cellspacing = "0" cellpadding = "3" border = "0" align = "center"> <tbody> <tr> <td class = "<%=prevClassName%>"> ← </td><td class="yearMenuClose yearMenuControl">×</td> <td class = "<%=nextClassName%>"> → </td></tr> </tbody></table > '
         ],
         monthMenu: [
             '<table cellspacing="0" cellpadding="3" border="0" nowrap="nowrap"><tbody>',
             '<tr nowrap="nowrap"><td data-month="1" class="<%=data[0].classname%>"><%=data[0].text%></td><td data-month="7" class="<%=data[6].classname%>"><%=data[6].text%></td></tr>',
             '<tr nowrap="nowrap"><td data-month="2" class="<%=data[1].classname%>"><%=data[1].text%></td><td data-month="8" class="<%=data[7].classname%>"><%=data[7].text%></td></tr>',
             '<tr nowrap="nowrap"><td data-month="3" class="<%=data[2].classname%>"><%=data[2].text%></td><td data-month="9" class="<%=data[8].classname%>"><%=data[8].text%></td></tr>',
             '<tr nowrap="nowrap"><td data-month="4" class="<%=data[3].classname%>"><%=data[3].text%></td><td data-month="10" class="<%=data[9].classname%>"><%=data[9].text%> </td></tr>',
             '<tr nowrap="nowrap"><td data-month="5" class="<%=data[4].classname%>"><%=data[4].text%></td><td data-month="11" class="<%=data[10].classname%>"><%=data[10].text%></td></tr>',
             '<tr nowrap="nowrap"><td data-month="6" class="<%=data[5].classname%>"><%=data[5].text%></td><td data-month="12" class="<%=data[11].classname%>"><%=data[11].text%></td></tr>',
             '</tbody></table>'
         ]

     };


     extendDate();


     /**
      * @constructor
      * @description 日期选择插件
      * @param {Object}   options -弹窗配置
      * @param {Node}     [options.el='']  -作为日期选择器插件使用时作为所选时间显示的元素，可以是inpout,div,span，数据类型可以是Jquery对象或者元素id均可
      * @param {Node}     [options.eCont=''] -单纯当做日历使用时,显示日历的元素，类型是jquery对象
      * @param {String}   [options.startDate=''] -'1980-05-01' 默认展示的初始日期，也可以在el元素中直接赋值作为初始日期(赋值优先)
      * @param {String}   [options.minDate="1900-01-01 00:00:00"] -日历可选的最小日期
      * @param {String}   [options.maxDate="2099-12-31 23:59:59"] -日历可选的最大日期
      * @param {Boolean}  [options.isShowClear=true] -是否显示清空按钮
      * @param {Boolean}  [options.isShowOK=true]    -是否显示确定按钮
      * @param {Boolean}  [options.isShowToday=true]	-是否显示今天按钮
      * @param {Boolean}  [options.readOnly=false] -false 和 readOnly true 最好同时使用,
      * @param {String}   [options.dateFmt='yyyy-MM-dd'] -格式:'yyyy-MM-dd HH:mm:ss   'H:mm:ss'只显示时分秒   'yyyy年MM月'年月
      * @param {Number}   [options.firstDayOfWeek=0] -默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一
      * @param {String}   [options.position='bottom'] - 自定义弹出位置top，left,right,bottom
      * @param {Number}   [options.calendars=1] -单日历还是双日历---待实现
      * @param {function} [options.onpicked=function(date){}]  //选中日期时的回调函数,date是选中的日期，类型：Date
      *
      * @example
      *  new DatePicker({
      *     el: '#simple-calendar',
      *     minDate: "2016-12-01 00:00:00",
      *     maxDate: "2017-10-01 23:59:59",
      *     firstDayOfWeek: "1",
      *     onpicked: function(date) {
      *         alert("date" + date);
      *     }
      * });
      * 作为日期选择器：<input type="text" data-component="DatePicker" data-min-Date="2017-01-05 00:00:00" data-max-Date="2017-10-03 23:59:59">
      * 作为日历：<div data-component="canlendar"></div>
      *
      * @tutorial datePicker
      */
     var DatePicker = function (options) {
         /*
            注意：一,IE下用yyyy/mm/dd的格式来new Date();二,赋值问题，注意时间类型是引用对象
            关于时间格式问题，有的时间包括时分秒，因此 currnet 和date保存数据时应该都是按照new Date()的格式保存
            date:  格式：new Date()   默认选中当前日期,用于保存实际上选中的日期
            current: 格式："yyyy-mm-dd" 不是当前实际选中的日期，是用于计算日历展示的时间参数,初始化时默认等于date
        */
         this.options = $.extend({}, defaultOptions, options || {});
         this.id = datepickerId++;
         // 处理el和eCont
         if (options.el && typeof options.el === 'string') {
             this.options.el = $(this.options.el);
         }
         if (options.eCont && typeof options.eCont === 'string') {
             this.options.eCont = $(this.options.eCont);
         }
         // 处理时间格式
         if (this.options.dateFmt === 'yyyy-MM-dd HH:mm:ss') {
             this.showHours = true;
         } else {
             this.showHours = false;
         }
         // 处理最大最小日期
         this.options.maxDate = (this.options.maxDate).replace(/-/g, '/');
         this.options.minDate = (this.options.minDate).replace(/-/g, '/');

         var current;
         // 初始日期处理，设置当前时间,如果未设定开始时间,则取当前日期为默认值
         if (this.options.el) {
             var val = this.getElVal();
             if (val) {
                 this.options.startDate = val;
             }
         }
         if (this.options.startDate) {
             if (typeof this.options.startDate === 'string') {
                 this.options.startDate = new Date(this.options.startDate);
             }
             current = this.options.startDate;
         } else {
             current = new Date();
         }
         this.current = new Date(current.getTime());

         // 如果起始时间大于最大时间或小于最小时间时
         if (new Date(this.options.maxDate) < this.current) {
             this.current = new Date(this.options.maxDate);
         } else if (new Date(this.options.minDate) > this.current) {
             this.current = new Date(this.options.minDate);
         }
         this.date = new Date(this.current.getTime());

         this.init();
     };

     var DatePickerfn = DatePicker.prototype;

     /**
      * 初始化
      * @private
      * @return {void}
      */
     DatePickerfn.init = function () {
         this.bulidCalender();
         if (!this.options.eCont) {
             this.offsetHeight = this.options.el.get(0).offsetHeight;
             this.offsetWidth = this.options.el.get(0).offsetWidth;
             this.bindEl();
         }
     };


     /**
      * 初始化日期选择器DOM结构
      * @private
      * @return {void}
      */
     DatePickerfn.bulidCalender = function () {
         var $WdateDiv = $('<div class="WdateDiv"></div>');
         $WdateDiv.append(tpl.header.join(''), '<div  class="datepickerDays"></div>', tpl.time.join(''), tpl.control.join(''));

         if (this.options.eCont) {
             this.options.eCont.empty().append($WdateDiv);
         } else {
             $('body').append($WdateDiv);
             $WdateDiv.css('visibility', 'hidden');
         }

         var date = new Date(this.current.getTime());
         $WdateDiv.find('.datapickerinput').eq(0).val((date.getMonth() + 1) + '月');
         $WdateDiv.find('.datapickerinput').eq(1).val(date.getFullYear());


         this.wrapper = $WdateDiv;
         this.yearMenuWrapper = this.wrapper.find('.YMenu');
         this.monthMenuWrapper = this.wrapper.find('.MMenu');
         this.wrapperHeader = this.wrapper.find('.dpTitle');
         var dpControl = $WdateDiv.find('.dpControl');

         if (!this.options.eCont) {
             if (this.showHours) {
                 var dpTime = $WdateDiv.find('.dpTime');
                 dpTime.css('display', 'block');
                 this.sethoursInput();
                 dpTime.find('input:eq(0)').addClass('active');
             }
             if (!this.options.isShowClear) {
                 dpControl.find('.datepickerClearInput').css('display', 'none');
             }
             if (!this.options.isShowOK) {
                 dpControl.find('.datepickerToday').css('display', 'none');
             }
             if (!this.options.isShowToday) {
                 dpControl.find('.datepickerOk').css('display', 'none');
             }
         } else {
             dpControl.css('display', 'none');
         }
         this.bulidDay();
         this.yearOrMonthButtonControl();
         this.bindCalender();
         if (!this.options.eCont) {
             this.bindControl();
         }
     };

     /**
      * 创建日期选择器中的日期部分DOM
      * @private
      * @return {void}
      */
     DatePickerfn.bulidDay = function () {
         var options = this.options;
         var cnt;
         var weekList = ['日', '一', '二', '三', '四', '五', '六'];

         for (var i = 0; i < options.calendars; i++) {
             var data = { weeks: [], weekslist: [] };
             for (var j = options.firstDayOfWeek; j < 7; j++) {
                 data.weekslist.push(weekList[j]);
             }
             for (j = 0; j < options.firstDayOfWeek; j++) {
                 data.weekslist.push(weekList[j]);
             }

             var date = new Date(this.current.getTime());
             date.setDate(1);

             var month = date.getMonth();
             var dow = (date.getDay() - options.firstDayOfWeek) % 7;
             date.addDays(-(dow + (dow < 0 ? 7 : 0)));
             cnt = 0;
             var curr = new Date(this.current.getTime());
             //  if (curr > new Date(options.maxDate)) {
             //      curr = new Date(options.maxDate);
             //      this.current = new Date(curr.getTime());
             //  } else if (curr < new Date(options.minDate)) {
             //      curr = new Date(options.minDate);
             //      this.current = new Date(curr.getTime());
             //  }
             while (cnt < 42) {
                 var indic = parseInt(cnt / 7);
                 var indic2 = cnt % 7;
                 if (!data.weeks[indic]) {
                     data.weeks[indic] = {
                         days: []
                     };
                 }
                 data.weeks[indic].days[indic2] = {
                     text: date.getDate(),
                     classname: []
                 };

                 var today = new Date();
                 if (today.getDate() === date.getDate() && today.getMonth() === date.getMonth() && today.getYear() === date.getYear()) {
                     data.weeks[indic].days[indic2].classname.push('datepickerToday');
                 }
                 if (date > today) {
                     // current month, date in future
                     data.weeks[indic].days[indic2].classname.push('datepickerFuture');
                 }

                 // 超过最大和最小日期限制的时间
                 if ((date > new Date(options.maxDate)) || (date < new Date(options.minDate))) {
                     data.weeks[indic].days[indic2].classname.push('datepickerInvalidDay');
                 } else {
                     data.weeks[indic].days[indic2].classname.push('datepickerValidDay');
                 }

                 if (month !== date.getMonth()) {
                     data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
                     if (this.current > date) {
                         // 用data比较会比较准确，因为会牵涉到最小2016-12-01 和2017-01-01单纯比较月份时 前面月份大于后面的
                         data.weeks[indic].days[indic2].classname.push('datepickerMonthprev');
                     } else {
                         data.weeks[indic].days[indic2].classname.push('datepickerMonthNext');
                     }
                     // disable clicking of the 'not in month' cells
                 } else {
                     data.weeks[indic].days[indic2].classname.push('datepickerInMonth');
                 }

                 if (date.getDay() === 0) {
                     data.weeks[indic].days[indic2].classname.push('datepickerSunday');
                 }
                 if (date.getDay() === 6) {
                     data.weeks[indic].days[indic2].classname.push('datepickerSaturday');
                 }
                 //  var fromUser = options.onRenderCell(date);

                 if (curr) {
                     if (curr.getDate() === date.getDate() && curr.getMonth() === date.getMonth() && curr.getYear() === date.getYear()) {
                         data.weeks[indic].days[indic2].classname.push('datepickerSelected');
                     }
                 }
                 //  if (fromUser.disabled) {
                 //      data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
                 //  }
                 //  if (fromUser.className) {
                 //      data.weeks[indic].days[indic2].classname.push(fromUser.className);
                 //  }
                 data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' ');
                 cnt++;
                 date.addDays(1);
             }
             // Fill the datepickerDays template with data
             var html = tmpl(tpl.days.join(''), data);
         }
         this.wrapper.find('.datepickerDays').empty().html(html);
     };

     /**
      * 创建日期选择器中的年份选择菜单DOM
      * @private
      * @param {Number} year 年份
      * @return {void}
      */
     DatePickerfn.bulidYearMenu = function (year) {
         var maxYear = new Date(this.options.maxDate).getFullYear();
         var minYear = new Date(this.options.minDate).getFullYear();
         var dow = year - 6;
         var data = {
             data: [],
             currentYear: year,
             prevClassName: '',
             nextClassname: ''
         };
         if (minYear >= dow) {
             data.prevClassName = 'invalidMenu';
         } else {
             data.prevClassName = 'yearMenuGoprev yearMenuControl';
         }
         for (var j = 0; j < 12; j++) {
             var yearInd = dow + j;
             data.data[j] = {
                 text: yearInd,
                 classname: ['yearMenu']
             };

             if ((maxYear >= yearInd) && (yearInd >= minYear)) {
                 data.data[j].classname.push('menu');
             } else {
                 data.data[j].classname.push('invalidMenu');
             }
             data.data[j].classname = data.data[j].classname.join(' ');
         }
         if (maxYear >= yearInd) {
             data.nextClassName = 'yearMenuGoNext yearMenuControl';
         } else {
             data.nextClassName = 'invalidMenu';
         }

         // datepickerYears template
         var html = tmpl(tpl.yearMenu.join(''), data);
         this.yearMenuWrapper.empty().append(html);
     };

     /**
      * 创建日期选择器中的月份选择菜单DOM
      * @private
      * @return {void}
      */
     DatePickerfn.bulidMonthMenu = function () {
         var months = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'];
         var maxDate = new Date(this.options.maxDate);
         var date = new Date(this.current.getTime());
         var minDate = new Date(this.options.minDate);
         var maxMonth = maxDate.getMonth();
         var minMonth = minDate.getMonth();
         var data = {
             data: [],
             prevClassName: ''
         };
         var j;
         if (date.getFullYear() === maxDate.getFullYear() || minDate.getFullYear() === date.getFullYear()) {
             for (j = 0; j < 12; j++) {
                 data.data[j] = {
                     text: months[j],
                     classname: ['monthMenu']
                 };
                 if (minDate.getFullYear() === maxDate.getFullYear()) {
                     if ((minMonth <= j) && (j <= maxMonth)) {
                         data.data[j].classname.push('menu');
                     } else {
                         data.data[j].classname.push('invalidMenu');
                     }
                 } else if (date.getFullYear() === maxDate.getFullYear()) {
                     if (j <= maxMonth) {
                         data.data[j].classname.push('menu');
                     } else {
                         data.data[j].classname.push('invalidMenu');
                     }
                 } else {
                     if (minMonth <= j) {
                         data.data[j].classname.push('menu');
                     } else {
                         data.data[j].classname.push('invalidMenu');
                     }
                 }
                 data.data[j].classname = data.data[j].classname.join(' ');
             }
         } else {
             for (j = 0; j < 12; j++) {
                 data.data[j] = {
                     text: months[j],
                     classname: 'monthMenu menu'
                 };
             }
         }
         var html = tmpl(tpl.monthMenu.join(''), data);
         this.monthMenuWrapper.empty().append(html);
     };

     /**
      * 绑定日期选择器中的事件
      * @private
      * @return {void}
      */
     DatePickerfn.bindCalender = function () {
         var datePickerWrapper = this.wrapper;
         var self = this;

         var wrapperHeader = self.wrapperHeader;
         wrapperHeader.on('click', '.navImg', function () {
             if ($(this).hasClass('invalid')) {
                 return false;
             }
             if ($(this).hasClass('datepickerYearGoPrev')) {
                 self.yearOrMonthChange(1, -1);
             } else if ($(this).hasClass('datepickerMonthGoPrev')) {
                 self.yearOrMonthChange(2, -1);
             } else if ($(this).hasClass('datepickerYearGoNext')) {
                 self.yearOrMonthChange(1, 1);
             } else if ($(this).hasClass('datepickerMonthGoNext')) {
                 self.yearOrMonthChange(2, 1);
             }
         });

         wrapperHeader.find('.menuSel').on('click', 'td.menu,td.yearMenuControl', $.proxy(this.menuClikHandler, this));
         var input = wrapperHeader.find('.datapickerinput');
         var lable = wrapperHeader.find('label');
         input.on('click', function () {
             var date;
             var year;
             if ($(this).hasClass('year')) {
                 if (!$(this).hasClass('active')) {
                     input.removeClass('active');
                     lable.removeClass('active');
                     self.monthMenuWrapper.removeClass('active');
                     date = new Date(self.current.getTime());
                     year = date.getFullYear();
                     self.bulidYearMenu(year);
                     $(this).addClass('active');
                     $(this).siblings('label').addClass('active');
                     self.yearMenuWrapper.addClass('active');
                 } else {
                     $(this).removeClass('active');
                     $(this).siblings('label').removeClass('active');
                     self.yearMenuWrapper.removeClass('active');
                 }
             } else {
                 if (!$(this).hasClass('active')) {
                     input.removeClass('active');
                     lable.removeClass('active');
                     self.yearMenuWrapper.removeClass('active');
                     self.bulidMonthMenu();
                     $(this).addClass('active');
                     $(this).siblings('label').addClass('active');
                     self.monthMenuWrapper.addClass('active');
                 } else {
                     $(this).removeClass('active');
                     $(this).siblings('label').removeClass('active');
                     self.monthMenuWrapper.removeClass('active');
                 }
             }
         });

         //  $('body').on('click.' + this.id + 'menuControl', function (e) {
         //      var ele = $(e.target);
         //      if (ele.hasClass('datapickerinput')) {
         //          return false;
         //      } else {
         //          self.monthMenuWrapper.css('display', 'none');
         //          self.yearMenuWrapper.css('display', 'none');
         //      }
         //  });

         // 绑定日期点击事件
         var dayWrapper = datePickerWrapper.find('.datepickerDays');
         dayWrapper.on('click', 'td.datepickerValidDay', $.proxy(this.dateselect, this));
     };

     /**
      * 绑定清空，今天，确定等按钮和时分秒输入框的事件控制
      * @private
      * @return {void}
      */
     DatePickerfn.bindControl = function () {
         var datePickerWrapper = this.wrapper;
         var self = this;
         var dpTime = datePickerWrapper.find('.dpTime');

         var dpControl = datePickerWrapper.find('.dpControl');


         // '清空','确认','今天' 按钮事件绑定
         dpControl.on('click', '.dpButton', function (e) {
             var ele = $(e.target);
             if (ele.hasClass('datepickerClearInput')) {
                 self.date = '';
             } else if (ele.hasClass('datepickerToday')) {
                 self.dateChange();
                 // 重新渲染tpl.day中的内容，并进行填充；
                 self.bulidDay();
                 self.options.onpicked.call(self, self.date);
             } else if (ele.hasClass('datepickerOk')) {
                 self.date = new Date(self.current.getTime());
             }
             self.elSetValue();
             // datapicker关闭
             self.hidden();
         });

         // 默认inputHour处于active状态 当点击inputMinute和inputSecond后，被点击的处于活跃状态
         dpTime.on('click', 'input.inputTime', function () {
             dpTime.find('input.inputTime').removeClass('active');
             $(this).addClass('active');
         });

         // 时分秒数值自动修正
         dpTime.on('blur', 'input.inputTime', function () {
             var val = parseInt($(this).val());
             if (!val || isNaN(val)) {
                 val = 0;
             } else {
                 if (val < 0) {
                     val = 0;
                 } else if (val > 59) {
                     val = 59;
                 }
                 if ($(this).hasClass('inputHour') && val > 23) {
                     val = 23;
                 }
             }
             $(this).val(val);
             self.hoursChange();
         });


         dpTime.on('click', '.dpTimeUp', function () {
             var input = dpTime.find('input.inputTime.active');
             var val;
             if (input.hasClass('inputHour')) {
                 val = parseInt(input.val());
                 if (val < 23) {
                     val++;
                     input.val(val);
                     self.hoursChange();
                 }
             } else {
                 val = parseInt(input.val());
                 if (val < 59) {
                     val++;
                     input.val(val);
                     self.hoursChange();
                 }
             }
         });

         dpTime.on('click', '.dpTimeDown', function () {
             var input = dpTime.find('input.inputTime.active');
             var val;
             if (input.hasClass('inputHour')) {
                 val = parseInt(input.val());
                 if (val > 0) {
                     val--;
                     input.val(val);
                     self.hoursChange();
                 }
             }
         });
     };

     /**
      * 绑定输入框el上的事件
      * @private
      * @return {void}
      */
     DatePickerfn.bindEl = function () {
         var self = this;
         var el = this.options.el;
         if (this.options.readOnly) {
             el.attr('readOnly', true);
         } else if (this.options.el[0] === 'INPUT') {
             el.on('blur', function () {
                 var val = $(this).val();
                 if (val) {
                     var result = self.valid(val);
                     if (result) {
                         self.elSetValue();
                         self.sethoursInput();
                     }
                 }
             });
         }
         el.on('click', function (e) {
             e.stopPropagation();
             self.show();
         });
     };


     /**
      * 处理年份和月份变化
      * @private
      * @param {Number} type 年份和月份变化类型
      * @param {Number} num 变化数量
      * @return {void}
      */
     DatePickerfn.yearOrMonthChange = function (type, num) {
         var date = new Date(this.current.getTime());
         var wrapperHeader = this.wrapperHeader;
         var input = wrapperHeader.find('.datapickerinput');
         var maxDate = new Date(this.options.maxDate);
         var minDate = new Date(this.options.minDate);
         /*
          * 1,2,为点击月份或年份增加或减少按钮
          * 3,4为点击月份或年份菜单
          */
         switch (type) {
             case 1:
                 date.addYears(num);
                 break;
             case 2:
                 date.addMonths(num);
                 break;
             case 3:
                 date.setYear(num);
                 break;
             case 4:
                 date.setMonth(num);
                 break;
             default:
                 break;
         }
         // 年份或月份变更后 经常会发生超出最大最小日期限制的情况，此时对current进行修正
         if (date > maxDate) {
             date = new Date(maxDate.getTime());
         } else if (date < minDate) {
             date = new Date(minDate.getTime());
         }

         this.current = new Date(date.getTime());
         this.sethoursInput();
         this.yearOrMonthButtonControl();
         // 重新渲染tpl.day中的内容，并进行填充；
         this.bulidDay();
         input.eq(0).val((date.getMonth() + 1) + '月');
         input.eq(1).val(date.getFullYear());
     };

     /**
      * 日期选择器中的年份月份增加或减少按钮可点击状态控制
      * @private
      * @return {void}
      */
     DatePickerfn.yearOrMonthButtonControl = function () {
         var date = new Date(this.current.getTime());
         var maxDate = new Date(this.options.maxDate);
         var minDate = new Date(this.options.minDate);
         var maxYear = maxDate.getFullYear();
         var minYear = minDate.getFullYear();
         var maxMonth = maxDate.getMonth();
         var minMonth = minDate.getMonth();
         var wrapperHeader = this.wrapperHeader;
         var YearGoPrev = wrapperHeader.find('.navImg.datepickerYearGoPrev');
         var MonthGoPrev = wrapperHeader.find('.navImg.datepickerMonthGoPrev');
         var YearGoNext = wrapperHeader.find('.navImg.datepickerYearGoNext');
         var MonthGoNext = wrapperHeader.find('.navImg.datepickerMonthGoNext');

         // 当前年份大于等于maxYear  或 当年年份+1时,月份也会超过最大限制
         if (date.getFullYear() >= maxYear || ((date.getFullYear() + 1) >= maxYear && date.getMonth() > maxMonth)) {
             YearGoNext.addClass('invalid');
             if (date.getFullYear() === maxYear && date.getMonth() >= maxMonth) {
                 MonthGoNext.addClass('invalid');
             } else {
                 MonthGoNext.removeClass('invalid');
             }
         } else {
             YearGoNext.removeClass('invalid');
         }

         if (date.getFullYear() <= minYear || ((date.getFullYear() - 1) <= minYear && date.getMonth() < minMonth)) {
             YearGoPrev.addClass('invalid');
             if (date.getFullYear() === minYear && date.getMonth() <= minMonth) {
                 MonthGoPrev.addClass('invalid');
             } else {
                 MonthGoPrev.removeClass('invalid');
             }
         } else {
             YearGoPrev.removeClass('invalid');
         }
     };

     /**
      * 年或月份选择菜单点击事件处理
      * @param {Event} e dom事件对象
      * @private
      * @return {void}
      */
     DatePickerfn.menuClikHandler = function (e) {
         e.stopPropagation();
         var self = this;
         var ele = $(e.target);
         var wrapperHeader = this.wrapperHeader;
         var input = wrapperHeader.find('input');
         var label = wrapperHeader.find('label');
         if (ele.hasClass('menu')) {
             if (ele.hasClass('monthMenu')) {
                 var monthSelect = parseInt(ele.data('month')) - 1;
                 self.yearOrMonthChange(4, monthSelect);
                 self.monthMenuWrapper.removeClass('active');
                 input.removeClass('active');
                 label.removeClass('active');
             } else {
                 var yearSelect = ele.text();
                 self.yearOrMonthChange(3, yearSelect);
                 self.yearMenuWrapper.removeClass('active');
                 input.removeClass('active');
                 label.removeClass('active');
             }
         } else {
             var year;
             var table;
             if (ele.hasClass('yearMenuGoprev')) {
                 table = ele.parents('table').siblings('table');
                 if (table.length) {
                     year = parseInt(table.attr('data-year')) - 12;
                 }
                 self.bulidYearMenu(year);
             } else if (ele.hasClass('yearMenuClose')) {
                 self.yearMenuWrapper.removeClass('active');
                 self.yearMenuWrapper.removeClass('active');
                 label.removeClass('active');
                 input.removeClass('active');
             } else if (ele.hasClass('yearMenuGoNext')) {
                 table = ele.parents('table').siblings('table');
                 if (table.length) {
                     year = parseInt(table.attr('data-year')) + 12;
                     self.bulidYearMenu(year);
                 }
             }
         }
     };

     /**
      * 日期选择器中的日期选中事件处理
      * @param {Event} e dom事件对象
      * @private
      * @return {void}
      */
     DatePickerfn.dateselect = function (e) {
         var ele = $(e.target);
         var day;
         if (ele.is('span')) {
             day = parseInt(ele.text());
             ele = ele.parents('td');
         } else {
             day = parseInt(ele.find('span').text());
         }
         if (ele.hasClass('datepickerInvalidDay')) {
             return false;
         }
         if (ele.hasClass('datepickerInMonth')) {
             this.dateChange(1, day);
         } else if (ele.hasClass('datepickerMonthprev')) {
             this.dateChange(3, day);
         } else {
             this.dateChange(2, day);
         }
         // ele.addClass("datepickerSelected");
         this.options.onpicked.call(this, this.date);
         this.elSetValue();
         console.log(this.current);
         return true;
     };

     /**
      * 处理日历主体部分点击带来的日期变化
      * @private
      * @param {Number} type 日期变化类型
      * @param {Number} num 变化数量
      * @return {void}
      */
     DatePickerfn.dateChange = function (type, num) {
         var input = this.wrapper.find('.datapickerinput');
         var maxDate = new Date(this.options.maxDate);
         var minDate = new Date(this.options.minDate);
         var date;
         /*
          * 1,2,3为点击日历上的日期，
          * 1是当前月日期，3是日历上前一个月的某天，2是日历上后一月的某天
          * type为空时，为点击当天
          */
         if (type) {
             date = new Date(this.current.getTime());
             switch (type) {
                 case 1:
                     date.setDate(num);
                     break;
                 case 2:
                     date.addMonths(1);
                     date.setDate(num);
                     break;
                 default:
                     date.addMonths(-1);
                     date.setDate(num);
             }
         } else {
             date = new Date();
         }
         // 日期选择后 经常会发生超出最大最小日期限制的情况，此时对current和date进行修正(此处主要是今天点击和时分秒容易超期)
         if (date > maxDate) {
             date = new Date(maxDate.getTime());
         } else if (date < minDate) {
             date = new Date(minDate.getTime());
         }
         this.date = date;
         this.current = new Date(date.getTime());
         this.sethoursInput();
         // 重新渲染tpl.day中的内容，并进行填充；
         this.bulidDay();
         input.eq(0).val((date.getMonth() + 1) + '月');
         input.eq(1).val(date.getFullYear());
     };

     /**
      * 处理时分秒变化后的current数据的维护
      * @private
      * @return {void}
      */
     DatePickerfn.hoursChange = function () {
         var maxDate = new Date(this.options.maxDate);
         var minDate = new Date(this.options.minDate);
         var cur = new Date(this.current.getTime());
         var dpTime = this.wrapper.find('.dpTime');
         var hour = dpTime.find('input:eq(0)').val();
         var min = dpTime.find('input:eq(2)').val();
         var sec = dpTime.find('input:eq(4)').val();
         cur = new Date(cur.setHours(hour, min, sec));
         if (cur > maxDate) {
             this.sethoursInput();
         } else if (cur < minDate) {
             this.sethoursInput();
         } else {
             this.current.setHours(hour, min, sec);
         }
     };

     /**
      * 修改时分秒input框的时间显示
      * @private
      * @param {Number} type 年份和月份变化类型
      * @param {Number} num 变化数量
      * @return {void}
      */
     DatePickerfn.sethoursInput = function () {
         if (this.showHours) {
             var dpTime = this.wrapper.find('.dpTime');
             var current = this.current;
             var hour = current.getHours();
             var min = current.getMinutes();
             var sec = current.getSeconds();
             dpTime.find('input:eq(0)').val(hour);
             dpTime.find('input:eq(2)').val(min);
             dpTime.find('input:eq(4)').val(sec);
         }
     };

     /**
      * 验证el元素中的日期
      * @private
      * @param {String} date -待验证的日期字符串
      * @return {void}
      */
     DatePickerfn.valid = function (date) {
         if (date) {
             var options = this.options;
             var reg = /^\d{4}-((0[1-9])|([0-9])|(1[0-2]))-((0[1-9])|([0-9])|([1-2][0-9])|(3[0-1]))$/;
             if (reg.test(date)) {
                 var formDate = new Date(date.replace(/-/g, '/'));
                 if ((new Date(options.minDate) <= formDate) || (formDate <= new Date(options.maxDate))) {
                     // 如果el中的数据超过最大或最小限制时
                     this.current = new Date(formDate.getTime());
                     this.date = new Date(formDate.getTime());
                 }
             }
             return true;
         }
         return false;
     };

     /**
      * el输入框日期赋值
      * @private
      * @return {void}
      */
     DatePickerfn.elSetValue = function () {
         var currnet = this.date;
         var val;
         var el = this.options.el;
         if (currnet && el && !this.options.eCont) {
             if (this.showHours) {
                 val = currnet.getFullYear() + '-' + (currnet.getMonth() + 1) + '-' + currnet.getDate() + ' ' + currnet.getHours() + ':' + currnet.getMinutes() + ':' + currnet.getSeconds();
             } else {
                 val = currnet.getFullYear() + '-' + (currnet.getMonth() + 1) + '-' + currnet.getDate();
             }
             if (el[0].nodeName === 'INPUT') {
                 el.val(val);
             } else {
                 el.html(val);
             }
         }
     };

     /**
      * el输入框日期赋值
      * @private
      * @return {String} 返回el元素取值
      */
     DatePickerfn.getElVal = function () {
         var el = this.options.el;
         var val;
         if (el[0].nodeName === 'INPUT') {
             val = el.val();
         } else {
             val = el.html();
         }
         return val;
     };

     /**
      * 日期选择器显示
      * @private
      * @return {void}
      */
     DatePickerfn.show = function () {
         var options = this.options;
         var self = this;
         var cal = this.wrapper;
         self.bulidDay();
         if (!(cal.css('visibility') === 'visible')) {
             var calEl = cal.get(0);

             var pos = options.el.offset();

             var top = pos.top;
             var left = pos.left;

             cal.css({
                 visibility: 'hidden',
                 display: 'block'
             });
             switch (options.position) {
                 case 'top':
                     top -= calEl.offsetHeight;
                     break;
                 case 'left':
                     left -= calEl.offsetWidth;
                     break;
                 case 'right':
                     left += this.offsetWidth;
                     break;
                 case 'bottom':
                     top += this.offsetHeight;
                     break;
                 default:
                     break;
             }
             cal.css({
                 visibility: 'visible',
                 display: 'block',
                 top: top + 'px',
                 left: left + 'px'
             });


             var clickHandler = function (ev) {
                 if ($(ev.target).parents('.WdateDiv').length === 0) {
                     self.hidden();
                 }
             };
             $(document).on('click.' + this.id, $.proxy(clickHandler, this));
         }
         return false;
     };

     /**
      * 日期选择器隐藏
      * @private
      * @return {void}
      */
     DatePickerfn.hidden = function () {
         var input = this.wrapperHeader.find('.datapickerinput');
         var lable = this.wrapperHeader.find('label');
         input.removeClass('active');
         lable.removeClass('active');
         this.monthMenuWrapper.removeClass('active');
         this.yearMenuWrapper.removeClass('active');
         this.options.el.removeClass('active');
         var cal = this.wrapper;
         cal.css({
             visibility: 'hidden',
             display: 'block'
         });
         $(document).off('click.' + this.id);
     };

     /**
      * 数据加载模板
      * @private
      * @param {String} str -模板
      * @param {String} data -模板中加载的数据
      * @return {void}
      */
     var tmpl = function tmpl(str, data) {
         // Figure out if we're getting a template, or if we need to
         // load the template - and be sure to cache the result.
         var fn = !/\W/.test(str) ?
             cache[str] = cache[str] ||
             tmpl(document.getElementById(str).innerHTML) :

             // Generate a reusable function that will serve as a template
             // generator (and which will be cached).
             new Function('obj',
                 'var p=[],print=function(){p.push.apply(p,arguments);};' +

                 // Introduce the data as local variables using with(){}
                 "with(obj){p.push('" +

                 // Convert the template into pure JavaScript
                 str
                 .replace(/[\r\t\n]/g, ' ')
                 .split('<%').join('\t')
                 .replace(/((^|%>)[^\t]*)'/g, '$1\r')
                 .replace(/\t=(.*?)%>/g, "',$1,'")
                 .split('\t').join("');")
                 .split('%>').join("p.push('")
                 .split('\r').join("\\'") +
                 "');}return p.join('');");

         // Provide some basic currying to the user
         return data ? fn(data) : fn;
     };

     /**
      * 扩展Date上的方法
      * @private
      * @return {void}
      */
     function extendDate() {
         if (Date.prototype.tempDate) {
             return;
         }
         Date.prototype.tempDate = null;

         Date.prototype.addDays = function (n) {
             this.setDate(this.getDate() + n);
             this.tempDate = this.getDate();
         };
         Date.prototype.addMonths = function (n) {
             if (this.tempDate === null) {
                 this.tempDate = this.getDate();
             }
             this.setDate(1);
             this.setMonth(this.getMonth() + n);
             this.setDate(Math.min(this.tempDate, this.getMaxDays()));
         };
         Date.prototype.addYears = function (n) {
             if (this.tempDate === null) {
                 this.tempDate = this.getDate();
             }
             this.setDate(1);
             this.setFullYear(this.getFullYear() + n);
             this.setDate(Math.min(this.tempDate, this.getMaxDays()));
         };
         Date.prototype.getMaxDays = function () {
             var tmpDate = new Date(Date.parse(this));
             var d = 28;
             var m;
             m = tmpDate.getMonth();
             d = 28;
             while (tmpDate.getMonth() === m) {
                 d++;
                 tmpDate.setDate(d);
             }
             return d - 1;
         };
     }


     function getCallback(func) {
         if ($.type(func) === 'string') {
             if (func.indexOf('.') === -1) {
                 return func = window[func];
             }
             var ns = func.split('.');
             var name = window[ns.shift()];
             while (ns.length) {
                 name = name[ns.shift()];
             }
             return name;
         }
         return func;
     }

     /**
      * 读取元素上的配置
      * @param {Object} el -Jquery对象
      * @return {Object} 返回元素上的配置信息
      */
     function readOptions(el) {
         var options = {};
         var config = [];
         for (var n in defaultOptions) {
             n = n.replace(/([A-Z])/g, '-$1').toLowerCase();
             config.push(n);
         }
         for (var i = 0, l = config.length; i < l; i++) {
             var n = config[i];
             var an = 'data-' + n;
             if (n.indexOf('-') != -1) {
                 n = (n.split('-')).map(function (v, i) {
                     if (i === 0) return v;
                     return v.charAt(0).toUpperCase() + v.substring(1, v.length);
                 }).join('');
             }
             var val = el.attr(an);
             if (val) {
                 if (val === 'false') {
                     val = false;
                 } else if (n.substr(0, 2) === 'on') {
                     val = getCallback(val);
                 }
                 options[n] = val;
             }
         }
         return options;
     }
     if (!Array.prototype.map) {
         Array.prototype.map = function (f, oThis) {
             if (!f || f.constructor != Function.toString()) return;
             oThis = oThis || window;
             var a = [];
             for (var i = 0, len = this.length; i < len; i++) {
                 a.push(f.call(oThis, this[i], i, this));
             }
             return a;
         };
     }

     /**
      * 对页面dom属性设置进行初始化
      * @param {Object} context -Jquery对象
      * @return {void}
      */
     function init(context) {
         var selector = '[data-component="DatePicker"]';
         context.find(selector).each(function () {
             var el = $(this);
             var options = readOptions(el);
             if (!options.eCont) {
                 options.el = el;
             }
             new DatePicker(options);
         });
         selector = '[data-component="canlendar"]';
         context.find(selector).each(function () {
             var el = $(this);
             var options = readOptions(el);
             if (!options.eCont) {
                 options.eCont = el;
             }
             new DatePicker(options);
         });
     }

     DatePicker.init = init;

     $(function () {
         init($doc);
     });


     window.DatePicker = DatePicker;
 }));