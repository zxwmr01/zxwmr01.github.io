/**
 * PUBG Lobby - Services
 * EngineService: Coherent UI 游戏引擎通信
 * FriendService: 好友数据服务
 */

(function() {
    'use strict';

    angular.module('lobbyApp')
        .factory('EngineService', ['$q', '$window', 'rx', EngineService])
        .factory('FriendService', ['$q', FriendService]);

    // ========== EngineService - Coherent UI 游戏引擎通信 ==========
    function EngineService($q, $window, rx) {
        var service = {};
        var engine = $window.engine;
        var eventSubjects = {};

        /**
         * 触发引擎事件
         */
        service.trigger = function(eventName) {
            var args = Array.prototype.slice.call(arguments, 1);
            try {
                if (engine && engine.trigger) {
                    engine.trigger.apply(engine, arguments);
                }
            } catch (e) {
                // trigger failed silently
            }
        };

        /**
         * 调用引擎方法并返回 Promise
         */
        service.call = function(methodName) {
            var deferred = $q.defer();
            try {
                if (engine && engine.call) {
                    var result = engine.call.apply(engine, arguments);
                    if (result && result.then) {
                        result.then(function(r) {
                            deferred.resolve(r);
                        }, function(err) {
                            deferred.reject(err);
                        });
                    } else {
                        deferred.resolve(result);
                    }
                } else {
                    // Mock mode
                    deferred.resolve({
                        userSerial: 'Player00001-abc123',
                        playerName: 'Player00001'
                    });
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        };

        /**
         * 监听引擎事件 (返回 RxJS Observable)
         */
        service.on = function(eventName) {
            if (!eventSubjects[eventName]) {
                eventSubjects[eventName] = new rx.Subject();
                try {
                    if (engine && engine.on) {
                        engine.on(eventName, function(data) {
                            eventSubjects[eventName].next(data);
                        });
                    }
                } catch (e) {
                    // on failed silently
                }
            }
            return eventSubjects[eventName].asObservable();
        };

        // ===== 封装常用的引擎调用 =====

        // 获取玩家认证数据
        service.getClientAuthData = function() {
            return service.call('GetClientAuthData');
        };

        // 加入专用服务器
        service.joinToDedicatedServer = function(ip) {
            service.trigger('JoinToDedicatedServer', ip);
        };

        // 打开外部浏览器
        service.openExternalBrowser = function(url) {
            service.trigger('OpenExternalBrowser', url);
        };

        // 设置大厅相机
        service.setLobbyCamera = function() {
            service.trigger('SetLobbyCamera');
        };

        // 销毁大厅角色
        service.destroyLobbyCharacter = function(index) {
            service.trigger('DestoryLobbyCharacter', index);
        };

        // 设置大厅角色角度
        service.setLobbyCharacterAngle = function(index, angle) {
            service.trigger('SetLobbyCharacterAngle', index, angle);
        };

        // 创建大厅角色
        service.createLobbyCharacter = function(index, isFemale, presetId, name) {
            service.trigger('CreateLobbyCharacter', index, isFemale, presetId, name);
        };

        // 更新大厅角色
        service.updateLobbyCharacter = function(index, characterData) {
            service.trigger('UpdateLobbyCharacter', index, characterData);
        };

        // 创建默认角色
        service.createDefaultCharacter = function() {
            service.setLobbyCamera();
            // 清理所有角色槽位
            for (var i = 0; i < 4; i++) {
                service.destroyLobbyCharacter(i);
            }
            service.setLobbyCharacterAngle(0, 90);
            service.createLobbyCharacter(0, false, '', 'Player');
            service.updateLobbyCharacter(0, {
                Gender: false,
                BoolOptions: [],
                FloatOptions: [],
                StringOptions: [
                    { First: 'Hair', Second: 'F_Hair_A_01' },
                    { First: 'Face', Second: 'F_Face_01' },
                    { First: 'NudeBody', Second: 'F_NudeBody_01' }
                ],
                ItemIds: []
            });
        };

        return service;
    }

    // ========== FriendService - 好友数据服务（纯前端 Mock） ==========
    function FriendService($q) {
        var service = {};

        // 模拟好友列表数据
        var mockFriends = [
            { name: 'H4TIUX', avatar: 'assets/images/avatars/h4tiux.jpg', status: 'online' },
            { name: 'xXMrYashXx', avatar: 'assets/images/avatars/yash.jpg', status: 'online' },
            { name: 'Kirito', avatar: 'assets/images/avatars/kirito.jpg', status: 'offline' },
            { name: 'Land', avatar: 'assets/images/avatars/land.jpg', status: 'online' }
        ];

        /**
         * 获取好友列表
         */
        service.getFriendsList = function() {
            var deferred = $q.defer();
            // 模拟网络延迟
            setTimeout(function() {
                deferred.resolve(mockFriends);
            }, 100);
            return deferred.promise;
        };

        /**
         * 刷新好友列表
         */
        service.refreshFriendsList = function() {
            return service.getFriendsList();
        };

        /**
         * 邀请好友
         */
        service.inviteFriend = function(friendName) {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve({ success: true });
            }, 200);
            return deferred.promise;
        };

        /**
         * 查看好友资料
         */
        service.viewFriendProfile = function(friendName) {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve({
                    name: friendName,
                    level: Math.floor(Math.random() * 100) + 1,
                    wins: Math.floor(Math.random() * 500),
                    kills: Math.floor(Math.random() * 5000)
                });
            }, 200);
            return deferred.promise;
        };

        /**
         * 获取在线好友数量
         */
        service.getOnlineCount = function(friendsList) {
            return friendsList.filter(function(f) { return f.status === 'online'; }).length;
        };

        return service;
    }

})();
