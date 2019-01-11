var websocket = null;
var pluginUUID = null;
var settingsCache = {};

var DestinationEnum = Object.freeze({"HARDWARE_AND_SOFTWARE":0, "HARDWARE_ONLY":1, "SOFTWARE_ONLY":2})

var webhookAction = {

    type : "de.tobimori.streamdeckifttt.action",

    onKeyDown : function(context, settings, coordinates, userDesiredState) {
    },

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
        settingsCache[context] = settings;
        var eventname = "";
        if(settings != null && settings.hasOwnProperty('eventname')){
            eventname = settings["eventname"];
        }
        var makerkey = "";
        if(settings != null && settings.hasOwnProperty('makerkey')){
            makerkey = settings["makerkey"];
        }
        if(eventname == "") {
            this.ShowReaction(context, "Alert");
        } else if(makerkey == "") {
            this.ShowReaction(context, "Alert");
        } else {
            const request = new XMLHttpRequest();
            request.open("GET", 'https://maker.ifttt.com/trigger/' + eventname + '/with/key/' + makerkey);
            request.send();
        }

    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
        var eventname = "";
        if(settings != null && settings.hasOwnProperty('eventname')){
            eventname = settings["eventname"];
        }
        var makerkey = "";
        if(settings != null && settings.hasOwnProperty('makerkey')){
            makerkey = settings["makerkey"];
        }
        if(eventname == "") {
            this.ShowReaction(context, "Alert");
        } else if(makerkey == "") {
            this.ShowReaction(context, "Alert");
        }
    },

    ShowReaction : function(context, type) {
        var json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        var json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };

        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        var json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

function connectSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID)
    {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function()
    {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = function (evt)
    {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'];

        if(event == "keyDown")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            console.log(settings);
            webhookAction.onKeyDown(context, settings, coordinates, userDesiredState);
        }
        else if(event == "keyUp")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyUp(context, settings, coordinates, userDesiredState);
        }
        else if(event == "willAppear")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            webhookAction.onWillAppear(context, settings, coordinates);
        }
        else if(event == "sendToPlugin") {

            if(jsonPayload['type'] == "updateSettings") {

                webhookAction.SetSettings(context, jsonPayload);
                settingsCache[context] = jsonPayload;

            } else if(jsonPayload['type'] == "requestSettings") {

                webhookAction.SendSettings(action, context);
            }
        }
    };

    websocket.onclose = function()
    {
        // Websocket is closed
    };
};