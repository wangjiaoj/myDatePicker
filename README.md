这是一个datepicker demo
目前在www/MyDatePicker文件夹中只完成了初版,待后续继续改进

主要功能简单描述：
可以设置最大和最小日期，关于超期控制:当所选日期超过最大日期时,选中日期将自动修正为最大日期

//设置
```javascript
defalutOptions={
         el: '', //显示选中日期的input输入框，类型是Jquery对象
         eCont: '', //单纯当做日历使用时,显示日历的元素，类型是jquery对象
         startDate: '', //'1980-05-01'日历展示的初始日期，也可以使用这样的格式'%y-%M-01 00:00:00',%y表示当前年份，暂不支持
         minDate: "1900-01-01 00:00:00",
         maxDate: "2099-12-31 23:59:59",
         isShowClear: true, //bool	true	 
         isShowOK: true, //bool	true	 
         isShowToday: true, //bool	true	 
         readOnly: false, //isShowClear false 和 readOnly true 最好同时使用,
         dateFmt: 'yyyy-MM-dd', // 格式:'yyyy-MM-dd HH:mm:ss :年月日时分秒   'yyyy-MM-dd':年月日      
         firstDayOfWeek: 0, //默认一周日开始,可设置 0 - 6 的任意一个数字,0:星期日 1:星期一 
         position: 'bottom', //自定义弹出位置top，left,right,bottom
         onpicked: function(date) {}, //选中日期时的回调函数,date是选中的日期，类型：Date
}
```
 
* 可以使用dom绑定

```javascript
       作为日期选择器：<input type="text" data-component="DatePicker">
       作为日历：<div data-component="canlendar"></div>
```


*  也可以使用new 来新建

```javascript
        new DatePicker({
           el: '#simple-calendar',
           minDate: "2016-12-01 00:00:00",
           maxDate: "2017-10-01 23:59:59",
           firstDayOfWeek: "1",
           onpicked: function(date) {
               alert("date" + date);
           }
      });
```






 