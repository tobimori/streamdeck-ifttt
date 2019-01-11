var websocket = null,
    uuid = null,
    actionInfo = {};

function connectSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;

    actionInfo = JSON.parse(inActionInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function () {
        var json = {
            event:  inRegisterEvent,
            uuid:   inUUID
        };

        websocket.send(JSON.stringify(json));
        requestSettings();


    }

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'sendToPropertyInspector') {
            var payload = jsonObj.payload;
            if (payload.error) {
                return;
            }

            var eventname = document.getElementById('eventname');
            eventname.value = payload.eventname;

            var makerkey = document.getElementById('makerkey');
            makerkey.value = payload.makerkey;

            if(makerkey.value == "undefined" && eventname.value == "undefined") {
                makerkey.value = "";
                eventname.value = "";
            }

            revealPropertyInspector()
        }
    };

}

function revealPropertyInspector() {
    const el = document.querySelector('.sdpi-wrapper');
    el && el.classList.remove('hidden');
}

function requestSettings() {
    if (websocket) {
        var payload = {};
        payload.type = "requestSettings";
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}

function updateSettings() {
    if (websocket) {
        var makerkey = document.getElementById('makerkey');
        var eventname = document.getElementById('eventname');

        var payload = {};
        payload.type = "updateSettings";
        payload.makerkey = makerkey.value;
        payload.eventname = eventname.value;
        console.log(payload);
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}
