import './main.css';

import utils from './utils';

function Swiper(...options){
    if (!(this instanceof Swiper)) return new Swiper(options);

    this.init(options);
    console.log('options', options);
}

Swiper.prototype = {
    init(options){
        if (!options[0] && !options[1] && !utils.$(options[1],'1').length) return new Error('this container and this items are necessary');

        this.container = utils.$(options[0]);
        this.items = utils.$(options[1],'1');
        this.itemsLength = this.items.length;

        this.defaultConfigOptions = {
            type: 'v',
            initIndex: 0,
            itemOut(){},
            itemIn(){},
            dots: false,
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

        this.initStyle().drawDot().then(() => this.bind());

    },
    initStyle(){
        if (utils.isFullPageV(this.configOptions.type, this.configOptions.direction)){
            this.container.style.height = `${this.itemsLength * this.windowH}px`;
            [...this.items].map((item, index) => {
                item.style.width = `100%`;
                item.style.height = `${this.windowH}px`;
            });
        }
        else if (utils.isFullPageH(this.configOptions.type, this.configOptions.direction)) {
            this.container.style.width = `${this.itemsLength * this.windowW}px`;
            [...this.items].map((item, index) => {
                item.style.width = `${this.windowW}px`;
                item.style.height = `100%`;
            });
        }
        else if (utils.isBanner(this.configOptions.type){
            this.container.style.width = `${this.container.parent.innerWidth}px`;
        }
        [...this.items].map((item, index) => {
            item.style.width = '100%';
            item.style.height = `${this.windowH}px`;
        });

        return this;
    },
    drawDot(){
        if (!this.configOptions.dots) return Promise.resolve();
        let dotsDom = document.createElement('div');
        dotsDom.classList.add('Swiper-dots');
        document.body.appendChild(dotsDom);

        let  dotTemplate = '';
        for (let i = 0; i < this.itemsLength; i++){
            dotTemplate += `<div class="Swiper-dot"></div>`;
        }
        dotsDom.innerHTML = dotTemplate;
        return Promise.resolve();
    },
    bind(){
        let self = this;
        let isTouch = utils.isMobile();
        let touchStart = isTouch ? 'touchstart' : 'mousedown';
        let touchMove = isTouch ? 'touchmove' : 'mousemove';
        let touchEnd = isTouch ? 'touchend' : 'mouseup';
        let mousewheel = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 'DOMMouseScroll' : 'mousewheel';

        function getPoint(event) {
            let myEvent = event || window.event;
            myEvent = isTouch ? myEvent.changedTouches[0] : myEvent;

            return {
                x: myEvent.pageX ,
                y: myEvent.pageY ,
            };
        }

        document.addEventListener(mousewheel, (event) => {
            if (this.isScrolling) return;
            clearInterval(this.scrollTimer);
            //event.detail 火狐
            let deltaY = event.detail || -event.wheelDelta || event.deltaY;
            this.direction = deltaY > 0 ? 1 : -1;

            this.isScrolling = true;
            this.moveByDirection(this.direction);
        });

        this.items.forEach((item, index) => {
            (function (item,index) {
                item.addEventListener(touchStart, (event) => {
                    self.touchStart && self.touchStart(getPoint(event));
                }, false);
                item.addEventListener(touchMove, (event) => {
                    self.touchMove && self.touchMove(getPoint(event));
                }, false);
                item.addEventListener(touchEnd, (event) => {
                    self.touchEnd && self.touchEnd(getPoint(event));
                });
            })(item,index);
        });

        if (this.configOptions.dots){
            utils.$('.Swiper-dot', '1').forEach((item, index) => {
                (function (item,index) {
                    item.addEventListener('click', (event) => {
                        console.log('click event', event);
                    }, false);
                })(item,index);
            });
        }

    },

    touchStart(point) {
        this.startPoint.x = point.x;
        this.startPoint.y = point.y;

        this.isBegin = true;
    },
    touchMove(point) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isBegin) return;

        this.endPoint.x = point.x;
        this.endPoint.y = point.y;

        this.disX = this.endPoint.x - this.startPoint.x;
        this.disY = this.endPoint.y - this.startPoint.y;

        this.container.style.webkitTransform = `translate3D(0, ${this.disY +  this.windowH * this.current * -1}px,0)`;
        this.container.style.transform = `translate3D(0, ${this.disY + this.windowH * this.current * -1}px,0)`;

        // this.items[this.current].style.webkitTransformOrigin = '50% 100%';
    },
    touchEnd(point) {
        this.isBegin = false;

        this.endPoint.x = point.x;
        this.endPoint.y = point.y;

        this.disX = this.endPoint.x - this.startPoint.x;
        this.disY = this.endPoint.y - this.startPoint.y;

        // 1 向下 -1向上 0不变
        this.direction = Math.abs(this.disY) < this.distance ? 0 : (this.disY < 0 ? 1 : -1);

        this.moveByDirection(this.direction);
    },

    moveByDirection(direction){

        this.current += direction;
        this.current = this.current < 0 ? (this.itemsLength - 1) : (this.current > (this.itemsLength - 1) ? 0 : this.current);

        this.container.style.webkitTransform = `translate3D(0, ${this.windowH * (-1) * this.current}px,0)`;
        this.container.style.transform = `translate3D(0, ${this.windowH * (-1) * this.current}px,0)`;

        if((this.current === (this.itemsLength - 1) && (direction === -1)) || (this.current === 0 && direction === 1)){
            this.container.style.transition = `none`;
        } else {
            this.container.style.transition = `all 1s`;
        }

        this.scrollTimer = setTimeout(() =>{
            this.isScrolling = false;
        }, 1000);
    },
};

export default Swiper;
