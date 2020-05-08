let websocket = null,
    pluginUUID = null;
makerkey = "";

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function () {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        console.log(jsonObj);

        if (jsonObj['event'] == "keyUp") {
            let eventname = "";
            if (jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('eventname')) {
                eventname = jsonObj.payload.settings["eventname"];
            }

            if (eventname == "" || makerkey == "") {
                const json = {
                    "event": "showAlert",
                    "context": jsonObj.context,
                };
                websocket.send(JSON.stringify(json));
            } else {
                const request = new XMLHttpRequest();
                request.open("GET", 'https://maker.ifttt.com/trigger/' + eventname + '/with/key/' + makerkey);
                request.send();
            };

        } else if (jsonObj['event'] == "didReceiveGlobalSettings") {
            if (jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('makerkey')) {
                makerkey = jsonObj.payload.settings["makerkey"];
            }

        } else if (jsonObj['event'] == "keyDown") {
            const json = {
                "event": "getGlobalSettings",
                "context": pluginUUID
            };

            websocket.send(JSON.stringify(json));
        }
    };
};