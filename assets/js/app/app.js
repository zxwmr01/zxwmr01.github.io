/**
 * PUBG Lobby - Main Application Module
 * Angular + ng-redux + RxJS + Coherent UI
 */

(function() {
    'use strict';

    angular.module('lobbyApp', ['ngRedux'])

    .constant('rx', window.Rx)

    // 配置 Redux Store
    .config(['$ngReduxProvider', function($ngReduxProvider) {
        var store = LobbyStore.configureStore();
        $ngReduxProvider.provideStore(store);
    }])

    // 运行时初始化
    .run(['$rootScope', '$ngRedux', 'EngineService', function($rootScope, $ngRedux, EngineService) {
        // 监听引擎事件（通过 RxJS）
        if (window.engine && engine.on) {
            // 全局引擎事件监听
        }
    }]);

    // ========== 自定义过滤器 ==========
    angular.module('lobbyApp')
        .filter('statusClass', function() {
            return function(status) {
                return status || 'offline';
            };
        })
        .filter('formatNumber', function() {
            return function(num) {
                if (num == null) return '0';
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            };
        });

    // ========== 自定义指令 ==========
    angular.module('lobbyApp')
        // 背景图预加载指令
        .directive('preloadBg', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var img = new Image();
                    img.onload = function() {
                        $timeout(function() {
                            element.css('background-image', 'url(' + attrs.preloadBg + ')');
                        });
                    };
                    img.src = attrs.preloadBg;
                }
            };
        }])
        // 数字滚动动画指令
        .directive('animateNumber', ['$interval', function($interval) {
            return {
                restrict: 'A',
                scope: {
                    animateNumber: '=',
                    duration: '=?'
                },
                link: function(scope, element) {
                    var duration = scope.duration || 1000;
                    var currentValue = 0;
                    var interval = null;

                    function animate(targetValue) {
                        if (interval) $interval.cancel(interval);
                        currentValue = 0;
                        var steps = 30;
                        var stepValue = targetValue / steps;
                        var stepDuration = duration / steps;
                        var step = 0;

                        interval = $interval(function() {
                            step++;
                            currentValue = Math.min(Math.floor(stepValue * step), targetValue);
                            element.text(currentValue.toLocaleString());
                            if (step >= steps) {
                                element.text(targetValue.toLocaleString());
                                $interval.cancel(interval);
                            }
                        }, stepDuration);
                    }

                    scope.$watch('animateNumber', function(newVal) {
                        if (newVal != null) {
                            animate(newVal);
                        }
                    });

                    scope.$on('$destroy', function() {
                        if (interval) $interval.cancel(interval);
                    });
                }
            };
        }]);

})();
