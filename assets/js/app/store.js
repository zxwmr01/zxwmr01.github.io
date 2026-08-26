/**
 * PUBG Lobby - Redux Store
 * 遵循 Angular + Redux + RxJS 架构模式
 */

(function() {
    'use strict';

    // ========== Action Types ==========
    var ActionTypes = {
        // App state
        SET_LOADING_STAGE: 'SET_LOADING_STAGE',
        SET_ANIMATIONS_READY: 'SET_ANIMATIONS_READY',
        SET_LOBBY_VISIBLE: 'SET_LOBBY_VISIBLE',
        SET_CONTROLS_VISIBLE: 'SET_CONTROLS_VISIBLE',
        SET_CONTROL_LOADED: 'SET_CONTROL_LOADED',

        // Player
        SET_PLAYER_DATA: 'SET_PLAYER_DATA',
        SET_PLAYER_NAME: 'SET_PLAYER_NAME',
        SET_BP_AMOUNT: 'SET_BP_AMOUNT',

        // Server / Matchmaking
        SELECT_SERVER: 'SELECT_SERVER',
        SELECT_TEAM: 'SELECT_TEAM',
        START_MATCHING: 'START_MATCHING',
        CANCEL_MATCHING: 'CANCEL_MATCHING',
        SET_MATCHING_NOTICE: 'SET_MATCHING_NOTICE',
        SET_LOADING: 'SET_LOADING',

        // UI state
        CHANGE_TAB: 'CHANGE_TAB',
        TOGGLE_SERVER_DROPDOWN: 'TOGGLE_SERVER_DROPDOWN',
        TOGGLE_FRIENDS_LIST: 'TOGGLE_FRIENDS_LIST',
        TOGGLE_TICK_MARK: 'TOGGLE_TICK_MARK',
        SELECT_FRIEND: 'SELECT_FRIEND',
        TOGGLE_FRIEND_ACTIONS: 'TOGGLE_FRIEND_ACTIONS',

        // Friends
        SET_FRIENDS_LIST: 'SET_FRIENDS_LIST',

        // Resources
        SET_RESOURCE_LOADED: 'SET_RESOURCE_LOADED'
    };

    // ========== Action Creators ==========
    function createActions() {
        return {
            // App state
            setLoadingStage: function(stage) {
                return { type: ActionTypes.SET_LOADING_STAGE, payload: stage };
            },
            setAnimationsReady: function(ready) {
                return { type: ActionTypes.SET_ANIMATIONS_READY, payload: ready };
            },
            setLobbyVisible: function(visible) {
                return { type: ActionTypes.SET_LOBBY_VISIBLE, payload: visible };
            },
            setControlsVisible: function(visible) {
                return { type: ActionTypes.SET_CONTROLS_VISIBLE, payload: visible };
            },
            setControlLoaded: function(controlName) {
                return { type: ActionTypes.SET_CONTROL_LOADED, payload: controlName };
            },

            // Player
            setPlayerData: function(data) {
                return { type: ActionTypes.SET_PLAYER_DATA, payload: data };
            },
            setPlayerName: function(name) {
                return { type: ActionTypes.SET_PLAYER_NAME, payload: name };
            },
            setBpAmount: function(amount) {
                return { type: ActionTypes.SET_BP_AMOUNT, payload: amount };
            },

            // Server / Matchmaking
            selectServer: function(server) {
                return { type: ActionTypes.SELECT_SERVER, payload: server };
            },
            selectTeam: function(team) {
                return { type: ActionTypes.SELECT_TEAM, payload: team };
            },
            startMatching: function() {
                return { type: ActionTypes.START_MATCHING };
            },
            cancelMatching: function() {
                return { type: ActionTypes.CANCEL_MATCHING };
            },
            setMatchingNotice: function(show) {
                return { type: ActionTypes.SET_MATCHING_NOTICE, payload: show };
            },
            setLoading: function(loading) {
                return { type: ActionTypes.SET_LOADING, payload: loading };
            },

            // UI state
            changeTab: function(tabName) {
                return { type: ActionTypes.CHANGE_TAB, payload: tabName };
            },
            toggleServerDropdown: function(show) {
                return { type: ActionTypes.TOGGLE_SERVER_DROPDOWN, payload: show };
            },
            toggleFriendsList: function(show) {
                return { type: ActionTypes.TOGGLE_FRIENDS_LIST, payload: show };
            },
            toggleTickMark: function() {
                return { type: ActionTypes.TOGGLE_TICK_MARK };
            },
            selectFriend: function(friend) {
                return { type: ActionTypes.SELECT_FRIEND, payload: friend };
            },
            toggleFriendActions: function(show) {
                return { type: ActionTypes.TOGGLE_FRIEND_ACTIONS, payload: show };
            },

            // Friends
            setFriendsList: function(list) {
                return { type: ActionTypes.SET_FRIENDS_LIST, payload: list };
            },

            // Resources
            setResourceLoaded: function(resource, loaded) {
                return { type: ActionTypes.SET_RESOURCE_LOADED, payload: { resource: resource, loaded: loaded } };
            }
        };
    }

    // ========== Initial State ==========
    function getInitialState() {
        return {
            // App state
            loadingStage: 'connecting',
            animationsReady: false,
            lobbyVisible: false,
            controlsVisible: false,
            controlsLoaded: {
                friendsBar: false,
                multiButton: false,
                announcementPanel: false,
                thirdLinks: false,
                playerInfo: false
            },
            controlLoadOrder: ['friendsBar', 'multiButton', 'announcementPanel', 'thirdLinks', 'playerInfo'],

            // Player
            player: {
                name: 'player',
                userSerial: 'userSerial',
                bp: 1363,
                randomChars: ''
            },

            // Server / Matchmaking
            serverList: serverList || [],
            currentServer: (serverList && serverList[0]) || null,
            teamList: ['SOLO', 'DUO', 'SQUAD'],
            currentTeam: 'SOLO',
            isMatching: false,
            isLoading: false,
            showMatchmakingNotice: false,
            playText: 'PLAY',
            battlegroundsText: 'BATTLEGROUNDS',

            // UI state
            activeTab: 'home',
            showServerDropdown: false,
            showFriendsList: false,
            tickMarkEnabled: true,
            selectedFriend: null,
            showFriendActions: false,

            // Friends
            friendsList: [
                { name: 'H4TIUX', avatar: 'assets/images/avatars/h4tiux.jpg', status: 'online' },
                { name: 'xXMrYashXx', avatar: 'assets/images/avatars/yash.jpg', status: 'online' },
                { name: 'Kirito', avatar: 'assets/images/avatars/yash.jpg', status: 'offline' },
                { name: 'Land', avatar: 'assets/images/avatars/land.jpg', status: 'online' }
            ],

            // Resources
            resourcesLoaded: {
                bg: false,
                logo: false
            }
        };
    }

    // ========== Reducer ==========
    function lobbyReducer(state, action) {
        if (state === undefined) {
            state = getInitialState();
        }

        switch (action.type) {
            // App state
            case ActionTypes.SET_LOADING_STAGE:
                return Object.assign({}, state, { loadingStage: action.payload });

            case ActionTypes.SET_ANIMATIONS_READY:
                return Object.assign({}, state, { animationsReady: action.payload });

            case ActionTypes.SET_LOBBY_VISIBLE:
                return Object.assign({}, state, { lobbyVisible: action.payload });

            case ActionTypes.SET_CONTROLS_VISIBLE:
                return Object.assign({}, state, { controlsVisible: action.payload });

            case ActionTypes.SET_CONTROL_LOADED:
                var controlsLoaded = Object.assign({}, state.controlsLoaded);
                controlsLoaded[action.payload] = true;
                return Object.assign({}, state, { controlsLoaded: controlsLoaded });

            // Player
            case ActionTypes.SET_PLAYER_DATA:
                return Object.assign({}, state, {
                    player: Object.assign({}, state.player, action.payload)
                });

            case ActionTypes.SET_PLAYER_NAME:
                return Object.assign({}, state, {
                    player: Object.assign({}, state.player, { name: action.payload })
                });

            case ActionTypes.SET_BP_AMOUNT:
                return Object.assign({}, state, {
                    player: Object.assign({}, state.player, { bp: action.payload })
                });

            // Server / Matchmaking
            case ActionTypes.SELECT_SERVER:
                return Object.assign({}, state, { currentServer: action.payload });

            case ActionTypes.SELECT_TEAM:
                return Object.assign({}, state, { currentTeam: action.payload });

            case ActionTypes.START_MATCHING:
                return Object.assign({}, state, {
                    isMatching: true,
                    isLoading: true,
                    showServerDropdown: false,
                    playText: 'MATCHING',
                    battlegroundsText: state.currentServer.name + ' / ' + state.currentTeam
                });

            case ActionTypes.CANCEL_MATCHING:
                return Object.assign({}, state, {
                    isMatching: false,
                    isLoading: false,
                    playText: 'PLAY',
                    battlegroundsText: 'BATTLEGROUNDS'
                });

            case ActionTypes.SET_MATCHING_NOTICE:
                return Object.assign({}, state, { showMatchmakingNotice: action.payload });

            case ActionTypes.SET_LOADING:
                return Object.assign({}, state, { isLoading: action.payload });

            // UI state
            case ActionTypes.CHANGE_TAB:
                return Object.assign({}, state, { activeTab: action.payload });

            case ActionTypes.TOGGLE_SERVER_DROPDOWN:
                return Object.assign({}, state, { showServerDropdown: action.payload });

            case ActionTypes.TOGGLE_FRIENDS_LIST:
                var showFriends = action.payload;
                return Object.assign({}, state, {
                    showFriendsList: showFriends,
                    showFriendActions: showFriends ? state.showFriendActions : false,
                    selectedFriend: showFriends ? state.selectedFriend : null
                });

            case ActionTypes.TOGGLE_TICK_MARK:
                return Object.assign({}, state, { tickMarkEnabled: !state.tickMarkEnabled });

            case ActionTypes.SELECT_FRIEND:
                var isSameFriend = state.selectedFriend && state.selectedFriend.name === action.payload.name;
                return Object.assign({}, state, {
                    selectedFriend: action.payload,
                    showFriendActions: isSameFriend ? !state.showFriendActions : true
                });

            case ActionTypes.TOGGLE_FRIEND_ACTIONS:
                return Object.assign({}, state, { showFriendActions: action.payload });

            // Friends
            case ActionTypes.SET_FRIENDS_LIST:
                return Object.assign({}, state, { friendsList: action.payload });

            // Resources
            case ActionTypes.SET_RESOURCE_LOADED:
                var resourcesLoaded = Object.assign({}, state.resourcesLoaded);
                resourcesLoaded[action.payload.resource] = action.payload.loaded;
                return Object.assign({}, state, { resourcesLoaded: resourcesLoaded });

            default:
                return state;
        }
    }

    // ========== Selectors ==========
    var selectors = {
        getLoadingStage: function(state) { return state.loadingStage; },
        isAnimationsReady: function(state) { return state.animationsReady; },
        isLobbyVisible: function(state) { return state.lobbyVisible; },
        isControlsVisible: function(state) { return state.controlsVisible; },
        getControlsLoaded: function(state) { return state.controlsLoaded; },
        getControlLoadOrder: function(state) { return state.controlLoadOrder; },

        getPlayer: function(state) { return state.player; },
        getPlayerName: function(state) { return state.player.name; },
        getBpAmount: function(state) { return state.player.bp; },

        getServerList: function(state) { return state.serverList; },
        getCurrentServer: function(state) { return state.currentServer; },
        getTeamList: function(state) { return state.teamList; },
        getCurrentTeam: function(state) { return state.currentTeam; },
        isMatching: function(state) { return state.isMatching; },
        isLoading: function(state) { return state.isLoading; },
        showMatchmakingNotice: function(state) { return state.showMatchmakingNotice; },
        getPlayText: function(state) { return state.playText; },
        getBattlegroundsText: function(state) { return state.battlegroundsText; },

        getActiveTab: function(state) { return state.activeTab; },
        showServerDropdown: function(state) { return state.showServerDropdown; },
        showFriendsList: function(state) { return state.showFriendsList; },
        isTickMarkEnabled: function(state) { return state.tickMarkEnabled; },
        getSelectedFriend: function(state) { return state.selectedFriend; },
        showFriendActions: function(state) { return state.showFriendActions; },

        getFriendsList: function(state) { return state.friendsList; },

        getResourcesLoaded: function(state) { return state.resourcesLoaded; },
        areAllResourcesLoaded: function(state) {
            return state.resourcesLoaded.bg && state.resourcesLoaded.logo;
        }
    };

    // ========== Configure Store ==========
    function configureStore() {
        // Apply middleware if needed (thunk, logger, etc.)
        var enhancer = Redux.compose(
            window.devToolsExtension ? window.devToolsExtension() : function(f) { return f; }
        );

        return Redux.createStore(lobbyReducer, enhancer);
    }

    // Export to global scope
    window.LobbyStore = {
        ActionTypes: ActionTypes,
        actions: createActions(),
        reducer: lobbyReducer,
        selectors: selectors,
        configureStore: configureStore,
        getInitialState: getInitialState
    };

})();
