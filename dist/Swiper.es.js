function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".Swiper-dots{\n    width: 1rem;\n    height: auto;\n    position: fixed;\n    z-index: 99999;\n    right: 1.5rem;\n    top: 50%;\n    transform: translateY(-50%);\n}\n\n.Swiper-dot{\n    width: .1rem;\n    height: .1rem;\n    border-radius: 50%;\n    background-color: #FFF;\n    margin-top: .3rem;\n}\n.Swiper-dot.active{\n    width: .1rem;\n    height: .1rem;\n    background-color: aqua;\n}";
styleInject(css);

var utils = {
    //判断对象
    isObject: function isObject(obj) {
        //{},[],null 用typeof检测不出来
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isString: function isString(val) {
        return typeof val === 'string';
    },
    isNumber: function isNumber(val) {
        //isFinite 检测是否为无穷大
        //isNumber(parseInt(a))   // true
        // 第一种写法
        return typeof val === 'number' && isFinite(val);
        //第二种写法
        // return typeof val === 'number' && !isNaN(val)
    },
    $: function $(ele, type) {
        if (document.querySelector) {
            return type === '1' ? document.querySelectorAll(ele) : document.querySelector(ele);
        } else {
            if (ele.indexOf('#') > -1) {
                return document.getElementById(ele.replace('#', ''));
            } else if (ele.indexOf('.') > -1) {
                return type === '1' ? document.getElementsByClassName(ele.replace('.', '')) : document.getElementsByClassName(ele.replace('.', ''))[0];
            } else {
                return type === '1' ? document.getElementsByTagName(ele) : document.getElementsByTagName(ele)[0];
            }
        }
    },
    isMobile: function isMobile() {
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        } else {
            return false;
        }
    },
    isFullPageV: function isFullPageV(type, direction) {
        return type.toLowerCase() === 'fullpage' && (direction.toLowerCase() === 'vertical' || direction.toLowerCase() === 'v');
    },
    isFullPageH: function isFullPageH(type, direction) {
        return type.toLowerCase() === 'fullpage' && (direction.toLowerCase() === 'vertical' || direction.toLowerCase() === 'v');
    }
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function Swiper() {
    for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
        options[_key] = arguments[_key];
    }

    if (!(this instanceof Swiper)) return new Swiper(options);

    this.init(options);
    console.log('options', options);
}

Swiper.prototype = {
    init: function init(options) {
        var _this = this;

        if (!options[0] && !options[1] && !utils.$(options[1], '1').length) return new Error('this container and this items are necessary');

        this.container = utils.$(options[0]);
        this.items = utils.$(options[1], '1');
        this.itemsLength = this.items.length;

        this.defaultConfigOptions = {
            type: 'v',
            initIndex: 0,
            itemOut: function itemOut() {},
            itemIn: function itemIn() {},

            dots: false
        };

        this.configOptions = Object.assign(this.defaultConfigOptions, options[2]);

        this.startPoint = {};
        this.endPoint = {};

        this.distance = 200;
        this.current = this.configOptions.current;

        this.windowW = window.innerWidth;
        this.windowH = window.innerHeight;

        this.isBegin = false;
        this.isScrolling = false;
        this.scrollTimer = null;

        this.initStyle().drawDot().then(function () {
            return _this.bind();
        });
    },
    initStyle: function initStyle() {
        var _this2 = this;

        if (utils.isFullPageV(this.configOptions.type, this.configOptions.direction)) {
            this.container.style.height = this.itemsLength * this.windowH + 'px';
        } else if (utils.isFullPageH(this.configOptions.type, this.configOptions.direction)) {
            this.container.style.width = this.itemsLength * this.windowW + 'px';
        }
        [].concat(_toConsumableArray(this.items)).map(function (item, index) {
            item.style.width = '100%';
            item.style.height = _this2.windowH + 'px';
        });

        return this;
    },
    drawDot: function drawDot() {
        if (!this.configOptions.dots) return Promise.resolve();
        var dotsDom = document.createElement('div');
        dotsDom.classList.add('Swiper-dots');
        document.body.appendChild(dotsDom);

        var dotTemplate = '';
        for (var i = 0; i < this.itemsLength; i++) {
            dotTemplate += '<div class="Swiper-dot"></div>';
        }
        dotsDom.innerHTML = dotTemplate;
        return Promise.resolve();
    },
    bind: function bind() {
        var _this3 = this;

        var self = this;
        var isTouch = utils.isMobile();
        var touchStart = isTouch ? 'touchstart' : 'mousedown';
        var touchMove = isTouch ? 'touchmove' : 'mousemove';
        var touchEnd = isTouch ? 'touchend' : 'mouseup';
        var mousewheel = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 'DOMMouseScroll' : 'mousewheel';

        function getPoint(event) {
            var myEvent = event || window.event;
            myEvent = isTouch ? myEvent.changedTouches[0] : myEvent;

            return {
                x: myEvent.pageX,
                y: myEvent.pageY
            };
        }

        document.addEventListener(mousewheel, function (event) {
            if (_this3.isScrolling) return;
            clearInterval(_this3.scrollTimer);
            //event.detail 火狐
            var deltaY = event.detail || -event.wheelDelta || event.deltaY;
            _this3.direction = deltaY > 0 ? 1 : -1;

            _this3.isScrolling = true;
            _this3.moveByDirection(_this3.direction);
        });

        this.items.forEach(function (item, index) {
            (function (item, index) {
                item.addEventListener(touchStart, function (event) {
                    self.touchStart && self.touchStart(getPoint(event));
                }, false);
                item.addEventListener(touchMove, function (event) {
                    self.touchMove && self.touchMove(getPoint(event));
                }, false);
                item.addEventListener(touchEnd, function (event) {
                    self.touchEnd && self.touchEnd(getPoint(event));
                });
            })(item, index);
        });

        if (this.configOptions.dots) {
            utils.$('.Swiper-dot', '1').forEach(function (item, index) {
                (function (item, index) {
                    item.addEventListener('click', function (event) {
                        console.log('click event', event);
                    }, false);
                })(item, index);
            });
        }
    },
    touchStart: function touchStart(point) {
        this.startPoint.x = point.x;
        this.startPoint.y = point.y;

        this.isBegin = true;
    },
    touchMove: function touchMove(point) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isBegin) return;

        this.endPoint.x = point.x;
        this.endPoint.y = point.y;

        this.disX = this.endPoint.x - this.startPoint.x;
        this.disY = this.endPoint.y - this.startPoint.y;

        this.container.style.webkitTransform = 'translate3D(0, ' + (this.disY + this.windowH * this.current * -1) + 'px,0)';
        this.container.style.transform = 'translate3D(0, ' + (this.disY + this.windowH * this.current * -1) + 'px,0)';

        // this.items[this.current].style.webkitTransformOrigin = '50% 100%';
    },
    touchEnd: function touchEnd(point) {
        this.isBegin = false;

        this.endPoint.x = point.x;
        this.endPoint.y = point.y;

        this.disX = this.endPoint.x - this.startPoint.x;
        this.disY = this.endPoint.y - this.startPoint.y;

        // 1 向下 -1向上 0不变
        this.direction = Math.abs(this.disY) < this.distance ? 0 : this.disY < 0 ? 1 : -1;

        this.moveByDirection(this.direction);
    },
    moveByDirection: function moveByDirection(direction) {
        var _this4 = this;

        this.current += direction;
        this.current = this.current < 0 ? this.itemsLength - 1 : this.current > this.itemsLength - 1 ? 0 : this.current;

        this.container.style.webkitTransform = 'translate3D(0, ' + this.windowH * -1 * this.current + 'px,0)';
        this.container.style.transform = 'translate3D(0, ' + this.windowH * -1 * this.current + 'px,0)';

        if (this.current === this.itemsLength - 1 && direction === -1 || this.current === 0 && direction === 1) {
            this.container.style.transition = 'none';
        } else {
            this.container.style.transition = 'all 1s';
        }

        this.scrollTimer = setTimeout(function () {
            _this4.isScrolling = false;
        }, 1000);
    }
};

export default Swiper;
