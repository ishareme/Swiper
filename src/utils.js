export default {
    //判断对象
    isObject: function (obj) {
        //{},[],null 用typeof检测不出来
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isString(val) {
        return typeof val === 'string';
    },
    isNumber(val) {
        //isFinite 检测是否为无穷大
        //isNumber(parseInt(a))   // true
        // 第一种写法
        return typeof val === 'number' && isFinite(val);
        //第二种写法
        // return typeof val === 'number' && !isNaN(val)
    },
    $(ele,type){
        if(document.querySelector){
            return type === '1' ? document.querySelectorAll(ele) : document.querySelector(ele);
        } else {
            if (ele.indexOf('#') > -1){
                return document.getElementById(ele.replace('#',''));
            } else if (ele.indexOf('.') > -1){
                return type === '1' ? document.getElementsByClassName(ele.replace('.','')) : document.getElementsByClassName(ele.replace('.',''))[0];
            } else {
                return type === '1' ? document.getElementsByTagName(ele) : document.getElementsByTagName(ele)[0];
            }
        }
    },

    isMobile(){
        if (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        } else {
            return false;
        }
    },

    isFullPageV(type, direction){
        return type.toLowerCase() === 'fullpage' && (direction.toLowerCase() === 'vertical' || direction.toLowerCase() === 'v')
    },
    isFullPageH(type, direction){
        return type.toLowerCase() === 'fullpage' && (direction.toLowerCase() === 'horizontal' || direction.toLowerCase() === 'h')
    },
    isBanner(type){
        return type.toLowerCase() === 'banner'
    }
}