/**
 * PUBG Lobby - Components
 * 所有 Angular 组件定义
 * 架构模式：Angular + ng-redux + RxJS
 */

(function() {
    'use strict';

    angular.module('lobbyApp')

    // ========== 连接屏幕组件 ==========
    .component('connectScreen', {
        template: [
            '<div id="connect-screen" ng-class="{hidden: !$ctrl.visible}">',
            '    <div class="connect-hint-text">',
            '        Attention!<br>',
            '        This project is completely open source and free to download and play. You can check Github for the source code.<br>',
            '        Project by OG:BG (PUBG2017PS).<br>',
            '        <a href="javascript:void(0)" ng-click="$ctrl.openGithub()">https://github.com/h4tiux/PUBG2017PS</a><br>',
            '        <a href="javascript:void(0)" ng-click="$ctrl.openWebsite()">https://ogbattlegrounds.ru</a><br><br>',
            '        If you would like to support this project, please consider sponsoring us.<br>',
            '        <a href="javascript:void(0)" ng-click="$ctrl.openSponsor()">https://xmrchat.com/h4tiux</a>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', 'EngineService', ConnectScreenController],
        bindings: {
            visible: '<'
        }
    })

    // ========== 加载屏幕组件 ==========
    .component('loadingScreen', {
        template: [
            '<div id="loading-screen" ng-class="{visible: $ctrl.visible, loaded: $ctrl.loaded}">',
            '    <div class="loading-content">',
            '        <img src="assets/images/icons/logo.svg" alt="Logo" class="loading-logo" id="loading-logo-img">',
            '        <div class="loading-text">{{ $ctrl.loadingText }}</div>',
            '        <div class="loading-progress-bar"></div>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$scope', '$interval', '$ngRedux', LoadingScreenController],
        bindings: {
            visible: '<',
            loaded: '<'
        }
    })

    // ========== 主导航栏组件 ==========
    .component('topNavigation', {
        template: [
            '<div class="top-navigation">',
            '    <div class="nav-item" ng-class="{active: $ctrl.activeTab === \'home\'}" ng-click="$ctrl.changeTab(\'home\')">HOME</div>',
            '    <div class="nav-item animate-item" ng-class="{active: $ctrl.activeTab === \'character\'}" ng-click="$ctrl.changeTab(\'character\')">CHARACTER</div>',
            '    <div class="nav-item animate-item" ng-class="{active: $ctrl.activeTab === \'rewards\'}" ng-click="$ctrl.changeTab(\'rewards\')">REWARDS</div>',
            '    <div class="nav-item animate-item" ng-class="{active: $ctrl.activeTab === \'statistics\'}" ng-click="$ctrl.changeTab(\'statistics\')">STATISTICS</div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', TopNavigationController]
    })

    // ========== 好友栏组件 ==========
    .component('friendsBar', {
        template: [
            '<div class="friends-bar" ng-if="$ctrl.visible" ng-class="{\'control-appear\': $ctrl.visible}" ng-click="$ctrl.toggleFriendsList()">',
            '    <img src="assets/images/icons/friend.png" class="friends-icon" alt="Friends">',
            '    <span class="friends-text">OG:BG Friends {{ $ctrl.onlineCount }} / {{ $ctrl.totalCount }}</span>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', FriendsBarController],
        bindings: {
            visible: '<'
        }
    })

    // ========== 好友列表面板组件 ==========
    .component('friendsListPanel', {
        template: [
            '<div class="friends-list-container" ng-class="{show: $ctrl.show}">',
            '    <div class="friends-list-header">',
            '        <span>OG:BG Friends</span>',
            '        <button class="refresh-button" ng-click="$ctrl.refresh()">Refresh</button>',
            '    </div>',
            '    <div class="friends-list">',
            '        <div class="friend-item" ng-repeat="friend in $ctrl.friendsList track by friend.name"',
            '             ng-click="$ctrl.selectFriend(friend)"',
            '             ng-class="{selected: $ctrl.selectedFriend && $ctrl.selectedFriend.name === friend.name}">',
            '            <img ng-src="{{ friend.avatar }}" class="friend-avatar" alt="Avatar">',
            '            <div class="friend-info">',
            '                <div class="friend-name">{{ friend.name }}</div>',
            '                <div class="friend-status" ng-class="friend.status">{{ friend.status }}</div>',
            '            </div>',
            '            <button class="invite-button" ng-if="friend.status === \'online\'" ng-click="$ctrl.inviteFriend(friend); $event.stopPropagation()">INVITE</button>',
            '        </div>',
            '    </div>',
            '    <div class="friend-action-dropdown" ng-if="$ctrl.selectedFriend" ng-class="{show: $ctrl.showFriendActions}">',
            '        <button class="friend-action-button view-button" ng-click="$ctrl.viewProfile()">VIEW PROFILE</button>',
            '        <button class="friend-action-button invite-button" ng-if="$ctrl.selectedFriend.status === \'online\'" ng-click="$ctrl.inviteSelectedFriend()">INVITE</button>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', 'FriendService', FriendsListPanelController],
        bindings: {
            show: '<'
        }
    })

    // ========== 播放按钮组件 ==========
    .component('playButton', {
        template: [
            '<div class="game-play-container-top-left" ng-if="$ctrl.visible" ng-class="{\'control-appear\': $ctrl.visible}">',
            '    <div class="button-container">',
            '        <div class="multi-layer-button"',
            '             id="join"',
            '             ng-class="{\'active-hover\': $ctrl.showDropdown, \'bro-loading\': $ctrl.isLoading, \'matching-state\': $ctrl.isMatching}"',
            '             ng-mouseenter="$ctrl.onMouseEnter()"',
            '             ng-mouseleave="$ctrl.onMouseLeave()"',
            '             ng-click="$ctrl.onClick()">',
            '            <img src="assets/images/buttons/btn_layer_1.png" alt="Button Layer 1" class="button-layer layer-1">',
            '            <img src="assets/images/buttons/btn_layer_2.png" alt="Button Layer 2" class="button-layer layer-2">',
            '            <img src="assets/images/buttons/btn_layer_3.png" alt="Button Layer 3" class="button-layer layer-3">',
            '            <div class="pubg-title-on-button">',
            '                <div class="play-text">{{ $ctrl.playText }}</div>',
            '                <div class="tips-text-container">',
            '                    <div class="tips-text default-text" ng-class="{\'matching-highlight\': $ctrl.isMatching}">{{ $ctrl.battlegroundsText }}</div>',
            '                    <div class="tips-text hover-text">{{ $ctrl.isMatching ? \'CLICK TO CANCEL\' : \'CLICK TO PLAY\' }}</div>',
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="join-server-container" id="server-dropdown" ng-class="{show: $ctrl.showDropdown}"',
            '         ng-mouseenter="$ctrl.onDropdownMouseEnter()"',
            '         ng-mouseleave="$ctrl.onDropdownMouseLeave()">',
            '        <div class="dropdown-section">',
            '            <div class="dropdown-header">REGION</div>',
            '            <button ng-repeat="server in $ctrl.serverList track by server.name"',
            '                    ng-class="{\'sel-server-button\': true, \'active\': $ctrl.currentServer.name === server.name}"',
            '                    ng-click="$ctrl.selectServer(server)">',
            '                <img class="checkmark" ng-if="$ctrl.currentServer.name === server.name" src="assets/images/icons/tick_mark_true.png" alt="Selected">',
            '                {{ server.name }}',
            '            </button>',
            '        </div>',
            '        <button class="custom-match-button" ng-click="$ctrl.joinCustomMatch()">',
            '            CUSTOM MATCH',
            '        </button>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$scope', '$ngRedux', 'EngineService', '$timeout', PlayButtonController],
        bindings: {
            visible: '<'
        }
    })

    // ========== 玩家信息组件 ==========
    .component('playerInfo', {
        template: [
            '<div class="player-info" ng-if="$ctrl.visible" ng-class="{\'control-appear\': $ctrl.visible}">',
            '    <div class="player-name">{{ $ctrl.playerName }}</div>',
            '    <div class="player-bp">',
            '        <img src="assets/images/icons/bp.png" class="bp-icon">',
            '        <span class="bp-amount">{{ $ctrl.bpAmount }}</span>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', PlayerInfoController],
        bindings: {
            visible: '<'
        }
    })

    // ========== 公告面板组件 ==========
    .component('announcementPanel', {
        template: [
            '<div class="announcement-panel" ng-if="$ctrl.visible" ng-class="{\'control-appear\': $ctrl.visible}">',
            '    <div class="announcement-header">SERVER STATUS</div>',
            '    <div class="announcement-content">',
            '        <div class="announcement-item">',
            '            <span class="status-dot online"></span>',
            '            <span class="status-text">AS Server - Online</span>',
            '        </div>',
            '        <div class="announcement-item">',
            '            <span class="status-dot offline"></span>',
            '            <span class="status-text">EU Server - Offline</span>',
            '        </div>',
            '        <div class="announcement-hint">',
            '            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '                <circle cx="12" cy="12" r="10" stroke="#E3B62F" stroke-width="2"/>',
            '                <line x1="12" y1="8" x2="12" y2="12" stroke="#E3B62F" stroke-width="2" stroke-linecap="round"/>',
            '                <circle cx="12" cy="16" r="1" fill="#E3B62F"/>',
            '            </svg>',
            '            <span>This is a free project. If anyone tries to resell it, please report them.</span>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: function() {},
        bindings: {
            visible: '<'
        }
    })

    // ========== 第三方链接组件 ==========
    .component('thirdLinks', {
        template: [
            '<div class="third-links-container" ng-if="$ctrl.visible" ng-class="{\'control-appear\': $ctrl.visible}">',
            '    <div class="third-link">',
            '        <div class="third-icon">',
            '            <img src="assets/images/icons/discord.svg" alt="Discord" width="24" height="24">',
            '        </div>',
            '        <div class="third-text">',
            '            <div class="third-title">JOIN OUR DISCORD</div>',
            '            <div class="third-link-text" ng-click="$ctrl.joinDiscord()">interact with the community</div>',
            '        </div>',
            '    </div>',
            '    <div class="third-link">',
            '        <div class="third-icon">',
            '            <img src="assets/images/icons/telegram.svg" alt="Telegram" width="24" height="24">',
            '        </div>',
            '        <div class="third-text">',
            '            <div class="third-title">JOIN OUR TELEGRAM</div>',
            '            <div class="third-link-text" ng-click="$ctrl.joinTelegram()">interact with the community</div>',
            '        </div>',
            '    </div>',
            '    <div class="third-link">',
            '        <div class="third-icon">',
            '            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#E3B62F" stroke-width="2"/>',
            '                <path d="M9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12Z" fill="#E3B62F"/>',
            '            </svg>',
            '        </div>',
            '        <div class="third-text">',
            '            <div class="third-title">SUPPORT US</div>',
            '            <div class="third-link-text" ng-click="$ctrl.openSponsor()">sponsor the project</div>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['EngineService', ThirdLinksController],
        bindings: {
            visible: '<'
        }
    })

    // ========== 接收邀请按钮组件 ==========
    .component('receiveInviteButton', {
        template: [
            '<button class="receive-invite-button" ng-click="$ctrl.toggle()">',
            '    <img ng-if="$ctrl.enabled" src="assets/images/icons/tick_mark_true.png" class="tick-mark" alt="Online">',
            '    <img ng-if="!$ctrl.enabled" src="assets/images/icons/tick_mark_false.png" class="tick-mark" alt="Offline">',
            '    RECEIVE INVITE',
            '</button>'
        ].join(''),
        controller: ['$ngRedux', ReceiveInviteButtonController]
    })

    // ========== 匹配通知组件 ==========
    .component('matchmakingNotice', {
        template: [
            '<div class="matchmaking-notice" ng-if="$ctrl.show && $ctrl.controlsVisible && $ctrl.isMatching">',
            '    Started matchmaking',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', MatchmakingNoticeController],
        bindings: {
            show: '<'
        }
    })

    // ========== Home Tab 组件 ==========
    .component('homeTab', {
        template: [
            '<div class="tab-content home-tab">',
            '    <friends-bar visible="$ctrl.controlsLoaded.friendsBar"></friends-bar>',
            '    <friends-list-panel show="$ctrl.showFriendsList"></friends-list-panel>',
            '    <receive-invite-button></receive-invite-button>',
            '    <play-button visible="$ctrl.controlsLoaded.multiButton"></play-button>',
            '    <matchmaking-notice show="$ctrl.showMatchmakingNotice"></matchmaking-notice>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', HomeTabController]
    })

    // ========== Character Tab 组件 ==========
    .component('characterTab', {
        template: [
            '<div class="tab-content">',
            '    <friends-bar visible="true"></friends-bar>',
            '    <friends-list-panel show="$ctrl.showFriendsList"></friends-list-panel>',
            '    <receive-invite-button></receive-invite-button>',
            '    <play-button visible="true"></play-button>',
            '    <div class="character-tab">',
            '        <h2>Character Management</h2>',
            '        <p>Character settings and customization options would go here.</p>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', CharacterTabController]
    })

    // ========== Rewards Tab 组件 ==========
    .component('rewardsTab', {
        template: [
            '<div class="tab-content">',
            '    <friends-bar visible="true"></friends-bar>',
            '    <friends-list-panel show="$ctrl.showFriendsList"></friends-list-panel>',
            '    <receive-invite-button></receive-invite-button>',
            '    <play-button visible="true"></play-button>',
            '    <div class="rewards-tab">',
            '        <h2>Rewards & Achievements</h2>',
            '        <p>Your rewards and achievements would be displayed here.</p>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', RewardsTabController]
    })

    // ========== Statistics Tab 组件 ==========
    .component('statisticsTab', {
        template: [
            '<div class="tab-content">',
            '    <friends-bar visible="true"></friends-bar>',
            '    <friends-list-panel show="$ctrl.showFriendsList"></friends-list-panel>',
            '    <receive-invite-button></receive-invite-button>',
            '    <play-button visible="true"></play-button>',
            '    <div class="statistics-tab">',
            '        <h2>Statistics</h2>',
            '        <p>Your game statistics would be displayed here.</p>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$ngRedux', StatisticsTabController]
    })

    // ========== 主大厅组件 ==========
    .component('lobbyApp', {
        template: [
            '<connect-screen visible="$ctrl.showConnectScreen"></connect-screen>',
            '<loading-screen visible="$ctrl.showLoadingScreen" loaded="$ctrl.loadingComplete"></loading-screen>',
            '<img id="preload-bg" src="assets/images/backgrounds/bg_intro_terms.jpg" style="display:none;">',
            '<div class="main">',
            '    <div id="app" ng-class="{\'animations-ready\': $ctrl.animationsReady, \'loaded\': $ctrl.lobbyVisible}">',
            '        <img class="title-image-bottom-right" src="assets/images/icons/logo.svg" alt="" ng-click="$ctrl.openWebsite()">',
            '        <p class="serial-text">Early Access v2.6.30.4</p>',
            '        <div class="top-right-area">',
            '            <div class="top-right-controls">',
            '                <top-navigation></top-navigation>',
            '                <div class="system-buttons-placeholder"></div>',
            '            </div>',
            '            <player-info visible="$ctrl.controlsLoaded.playerInfo"></player-info>',
            '            <announcement-panel visible="$ctrl.controlsLoaded.announcementPanel"></announcement-panel>',
            '            <third-links visible="$ctrl.controlsLoaded.thirdLinks"></third-links>',
            '        </div>',
            '        <div ng-switch="$ctrl.activeTab">',
            '            <home-tab ng-switch-when="home"></home-tab>',
            '            <character-tab ng-switch-when="character"></character-tab>',
            '            <rewards-tab ng-switch-when="rewards"></rewards-tab>',
            '            <statistics-tab ng-switch-when="statistics"></statistics-tab>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''),
        controller: ['$scope', '$ngRedux', '$timeout', 'EngineService', 'rx', LobbyAppController]
    });

    // ========== 控制器实现 ==========

    // ConnectScreen
    function ConnectScreenController($ngRedux, EngineService) {
        var ctrl = this;
        ctrl.openGithub = function() {
            EngineService.openExternalBrowser('https://github.com/h4tiux/PUBG2017PS');
        };
        ctrl.openWebsite = function() {
            EngineService.openExternalBrowser('https://ogbattlegrounds.ru');
        };
        ctrl.openSponsor = function() {
            EngineService.openExternalBrowser('https://xmrchat.com/h4tiux');
        };
    }

    // LoadingScreen
    function LoadingScreenController($scope, $interval, $ngRedux) {
        var ctrl = this;
        var texts = ['Loading resources...', 'Connected..Waiting for response...'];
        var index = 0;
        ctrl.loadingText = texts[0];

        var interval = $interval(function() {
            index = (index + 1) % texts.length;
            ctrl.loadingText = texts[index];
        }, 1500);

        $scope.$on('$destroy', function() {
            $interval.cancel(interval);
        });
    }

    // TopNavigation
    function TopNavigationController($ngRedux) {
        var ctrl = this;
        var actions = LobbyStore.actions;

        ctrl.changeTab = function(tabName) {
            $ngRedux.dispatch(actions.changeTab(tabName));
        };

        var unsubscribe = $ngRedux.connect(function(state) {
            return { activeTab: LobbyStore.selectors.getActiveTab(state) };
        })(ctrl);

        this.$onDestroy = function() { unsubscribe(); };
    }

    // FriendsBar
    function FriendsBarController($ngRedux) {
        var ctrl = this;
        var actions = LobbyStore.actions;

        ctrl.toggleFriendsList = function() {
            $ngRedux.dispatch(actions.toggleFriendsList(!ctrl.showFriendsList));
        };

        var unsubscribe = $ngRedux.connect(function(state) {
            var friends = LobbyStore.selectors.getFriendsList(state);
            var onlineCount = friends.filter(function(f) { return f.status === 'online'; }).length;
            return {
                showFriendsList: LobbyStore.selectors.showFriendsList(state),
                onlineCount: onlineCount,
                totalCount: friends.length
            };
        })(ctrl);

        this.$onDestroy = function() { unsubscribe(); };
    }

    // FriendsListPanel
    function FriendsListPanelController($ngRedux, FriendService) {
        var ctrl = this;
        var actions = LobbyStore.actions;

        ctrl.refresh = function() {
            FriendService.refreshFriendsList().then(function(list) {
                $ngRedux.dispatch(actions.setFriendsList(list));
            });
        };

        ctrl.selectFriend = function(friend) {
            $ngRedux.dispatch(actions.selectFriend(friend));
        };

        ctrl.inviteFriend = function(friend) {
            FriendService.inviteFriend(friend.name);
        };

        ctrl.inviteSelectedFriend = function() {
            if (ctrl.selectedFriend) {
                FriendService.inviteFriend(ctrl.selectedFriend.name);
                $ngRedux.dispatch(actions.toggleFriendActions(false));
            }
        };

        ctrl.viewProfile = function() {
            if (ctrl.selectedFriend) {
                FriendService.viewFriendProfile(ctrl.selectedFriend.name);
                $ngRedux.dispatch(actions.toggleFriendActions(false));
            }
        };

        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                friendsList: LobbyStore.selectors.getFriendsList(state),
                selectedFriend: LobbyStore.selectors.getSelectedFriend(state),
                showFriendActions: LobbyStore.selectors.showFriendActions(state)
            };
        })(ctrl);

        this.$onDestroy = function() { unsubscribe(); };
    }

    // PlayButton
    function PlayButtonController($scope, $ngRedux, EngineService, $timeout) {
        var ctrl = this;
        var actions = LobbyStore.actions;
        var matchingTimer = null;

        ctrl.onMouseEnter = function() {
            if (!ctrl.isMatching) {
                $ngRedux.dispatch(actions.toggleServerDropdown(true));
            }
        };

        ctrl.onMouseLeave = function() {
            if (!ctrl.isMatching) {
                $ngRedux.dispatch(actions.toggleServerDropdown(false));
            }
        };

        ctrl.onDropdownMouseEnter = function() {
            if (!ctrl.isMatching) {
                $ngRedux.dispatch(actions.toggleServerDropdown(true));
            }
        };

        ctrl.onDropdownMouseLeave = function() {
            if (!ctrl.isMatching) {
                $ngRedux.dispatch(actions.toggleServerDropdown(false));
            }
        };

        ctrl.onClick = function() {
            if (ctrl.isMatching) {
                ctrl.cancelMatching();
            } else {
                ctrl.joinServer();
            }
        };

        ctrl.selectServer = function(server) {
            $ngRedux.dispatch(actions.selectServer(server));
        };

        ctrl.joinServer = function() {
            if (ctrl.isMatching) return;

            $ngRedux.dispatch(actions.startMatching());
            $ngRedux.dispatch(actions.setMatchingNotice(true));

            $timeout(function() {
                $ngRedux.dispatch(actions.setMatchingNotice(false));
            }, 1000);

            var minWait = 5000;
            var maxWait = 35000;
            var randomWait = Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait;

            matchingTimer = $timeout(function() {
                var state = $ngRedux.getState();
                if (state.isMatching && state.currentServer) {
                    EngineService.joinToDedicatedServer(state.currentServer.ip);
                }
            }, randomWait);
        };

        ctrl.cancelMatching = function() {
            if (matchingTimer) {
                $timeout.cancel(matchingTimer);
                matchingTimer = null;
            }
            $ngRedux.dispatch(actions.cancelMatching());
        };

        ctrl.joinCustomMatch = function() {
            $ngRedux.dispatch(actions.setLoading(true));
            EngineService.openExternalBrowser('https://ogbattlegrounds.com');
            $timeout(function() {
                $ngRedux.dispatch(actions.setLoading(false));
            }, 500);
        };

        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                serverList: LobbyStore.selectors.getServerList(state),
                currentServer: LobbyStore.selectors.getCurrentServer(state),
                isMatching: LobbyStore.selectors.isMatching(state),
                isLoading: LobbyStore.selectors.isLoading(state),
                showDropdown: LobbyStore.selectors.showServerDropdown(state),
                playText: LobbyStore.selectors.getPlayText(state),
                battlegroundsText: LobbyStore.selectors.getBattlegroundsText(state)
            };
        })(ctrl);

        this.$onDestroy = function() {
            unsubscribe();
            if (matchingTimer) $timeout.cancel(matchingTimer);
        };
    }

    // PlayerInfo
    function PlayerInfoController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                playerName: LobbyStore.selectors.getPlayerName(state),
                bpAmount: LobbyStore.selectors.getBpAmount(state)
            };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // ThirdLinks
    function ThirdLinksController(EngineService) {
        var ctrl = this;
        ctrl.joinDiscord = function() {
            EngineService.openExternalBrowser('https://discord.gg/Q4pUgYwep5');
        };
        ctrl.joinTelegram = function() {
            EngineService.openExternalBrowser('https://t.me/ogbattlegrounds');
        };
        ctrl.openSponsor = function() {
            EngineService.openExternalBrowser('https://xmrchat.com/h4tiux');
        };
    }

    // ReceiveInviteButton
    function ReceiveInviteButtonController($ngRedux) {
        var ctrl = this;
        var actions = LobbyStore.actions;

        ctrl.toggle = function() {
            $ngRedux.dispatch(actions.toggleTickMark());
        };

        var unsubscribe = $ngRedux.connect(function(state) {
            return { enabled: LobbyStore.selectors.isTickMarkEnabled(state) };
        })(ctrl);

        this.$onDestroy = function() { unsubscribe(); };
    }

    // MatchmakingNotice
    function MatchmakingNoticeController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                isMatching: LobbyStore.selectors.isMatching(state),
                controlsVisible: LobbyStore.selectors.isControlsVisible(state),
                showMatchmakingNotice: LobbyStore.selectors.showMatchmakingNotice(state)
            };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // HomeTab
    function HomeTabController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                controlsLoaded: LobbyStore.selectors.getControlsLoaded(state),
                showFriendsList: LobbyStore.selectors.showFriendsList(state),
                showMatchmakingNotice: LobbyStore.selectors.showMatchmakingNotice(state)
            };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // CharacterTab
    function CharacterTabController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return { showFriendsList: LobbyStore.selectors.showFriendsList(state) };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // RewardsTab
    function RewardsTabController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return { showFriendsList: LobbyStore.selectors.showFriendsList(state) };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // StatisticsTab
    function StatisticsTabController($ngRedux) {
        var ctrl = this;
        var unsubscribe = $ngRedux.connect(function(state) {
            return { showFriendsList: LobbyStore.selectors.showFriendsList(state) };
        })(ctrl);
        this.$onDestroy = function() { unsubscribe(); };
    }

    // ========== LobbyApp 主控制器 ==========
    function LobbyAppController($scope, $ngRedux, $timeout, EngineService, rx) {
        var ctrl = this;
        var actions = LobbyStore.actions;

        ctrl.showConnectScreen = true;
        ctrl.showLoadingScreen = false;
        ctrl.loadingComplete = false;

        // 打开官网
        ctrl.openWebsite = function() {
            EngineService.openExternalBrowser('https://ogbattlegrounds.ru');
        };

        // 启动加载流程
        function startLoading() {
            ctrl.showConnectScreen = false;
            ctrl.showLoadingScreen = true;
            $scope.$applyAsync();

            // 检查背景图加载
            var preloadBg = document.getElementById('preload-bg');
            if (preloadBg) {
                if (preloadBg.complete && preloadBg.naturalWidth > 0) {
                    onResourceLoaded('bg');
                } else {
                    preloadBg.addEventListener('load', function() { onResourceLoaded('bg'); });
                    preloadBg.addEventListener('error', function() { onResourceLoaded('bg'); });
                }
            } else {
                onResourceLoaded('bg');
            }

            // 检查 Logo 加载
            var loadingLogo = document.querySelector('.loading-logo');
            if (loadingLogo && loadingLogo.complete && loadingLogo.naturalWidth > 0) {
                onResourceLoaded('logo');
            } else {
                // 延迟一下确保 DOM 渲染
                $timeout(function() {
                    var logo = document.querySelector('.loading-logo');
                    if (logo) {
                        if (logo.complete && logo.naturalWidth > 0) {
                            onResourceLoaded('logo');
                        } else {
                            logo.addEventListener('load', function() { onResourceLoaded('logo'); });
                            logo.addEventListener('error', function() { onResourceLoaded('logo'); });
                        }
                    } else {
                        onResourceLoaded('logo');
                    }
                }, 100);
            }
        }

        function onResourceLoaded(resource) {
            $ngRedux.dispatch(actions.setResourceLoaded(resource, true));
            var state = $ngRedux.getState();
            if (LobbyStore.selectors.areAllResourcesLoaded(state)) {
                onAllResourcesLoaded();
            }
        }

        function onAllResourcesLoaded() {
            $ngRedux.dispatch(actions.setLoadingStage('full'));
            $ngRedux.dispatch(actions.setAnimationsReady(true));

            $timeout(function() {
                $ngRedux.dispatch(actions.setLobbyVisible(true));
                ctrl.loadingComplete = true;
                ctrl.showLoadingScreen = false;

                $timeout(function() {
                    $ngRedux.dispatch(actions.setControlsVisible(true));
                    loadControlsSequentially(0);
                }, 500);
            }, 3000);
        }

        function loadControlsSequentially(index) {
            var order = LobbyStore.selectors.getControlLoadOrder($ngRedux.getState());
            if (index >= order.length) return;

            $ngRedux.dispatch(actions.setControlLoaded(order[index]));

            $timeout(function() {
                loadControlsSequentially(index + 1);
            }, 200);
        }

        // 初始化角色和玩家数据
        function initializeGameData() {
            // 创建角色
            EngineService.createDefaultCharacter();

            // 获取玩家数据
            EngineService.getClientAuthData().then(function(data) {
                if (data) {
                    var playerName = data.userSerial ? data.userSerial.toString().split('-')[0] : 'Player';
                    var randomChars = generateRandomChars();
                    $ngRedux.dispatch(actions.setPlayerData({
                        name: playerName,
                        userSerial: data.userSerial,
                        randomChars: randomChars
                    }));
                }
            });
        }

        function generateRandomChars() {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for (var i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // 使用 RxJS 监听加载完成状态
        var loadingComplete$ = rx.Observable.create(function(observer) {
            var unsubscribe = $ngRedux.subscribe(function() {
                var state = $ngRedux.getState();
                if (state.loadingStage === 'full') {
                    observer.next(true);
                    observer.complete();
                }
            });
            return function() { unsubscribe(); };
        });

        loadingComplete$.subscribe(function() {
            initializeGameData();
        });

        // 3秒后自动开始加载
        $timeout(startLoading, 3000);

        // 连接 Redux store
        var unsubscribe = $ngRedux.connect(function(state) {
            return {
                activeTab: LobbyStore.selectors.getActiveTab(state),
                animationsReady: LobbyStore.selectors.isAnimationsReady(state),
                lobbyVisible: LobbyStore.selectors.isLobbyVisible(state),
                controlsVisible: LobbyStore.selectors.isControlsVisible(state),
                controlsLoaded: LobbyStore.selectors.getControlsLoaded(state),
                showMatchmakingNotice: LobbyStore.selectors.showMatchmakingNotice(state),
                isMatching: LobbyStore.selectors.isMatching(state)
            };
        })(ctrl);

        this.$onDestroy = function() { unsubscribe(); };
    }

})();
