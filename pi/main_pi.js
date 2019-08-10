let websocket = null,
    uuid = null,
    actionInfo = {};

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {

    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the Property Inspector
        let json = {
            "event": inRegisterEvent,
            "uuid": inPropertyInspectorUUID
        };
        websocket.send(JSON.stringify(json));

        json = {
            "event": "getSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));

        json = {
            "event": "getGlobalSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'didReceiveSettings') {
            const payload = jsonObj.payload.settings;

            document.getElementById('eventname').value = payload.eventname;

            if(document.getElementById('eventname').value == "undefined") {
                document.getElementById('eventname').value = "";
            }
        }
        if (jsonObj.event === 'didReceiveGlobalSettings') {
            const payload = jsonObj.payload.settings;

            document.getElementById('makerkey').value = payload.makerkey;

            if(document.getElementById('makerkey').value == "undefined") {
                document.getElementById('makerkey').value = "";
            }

            const el = document.querySelector('.sdpi-wrapper');
            el && el.classList.remove('hidden');
        }
    };

}

function updateEventName() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        payload.eventname = document.getElementById('eventname').value;
        const json = {
            "event": "setSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
        console.log(json)
    }    
}

function updateMakerKey() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        payload.makerkey = document.getElementById('makerkey').value;
        const json = {
            "event": "setGlobalSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
        console.log(json)
    }    
}

function openPage(site) {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
            'event': 'openUrl',
            'payload': {
                'url': 'https://' + site
            }
        };
        websocket.send(JSON.stringify(json));
    }
}