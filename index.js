var mqtt = require('mqtt');

var hostname = "mqtt://localhost"; //"mqtt://raspberrypi.local";
var client  = mqtt.connect(hostname);

console.log("[Snips Log] begin");

client.on('connect', function () {
    console.log("[Snips Log] Connected to MQTT broker " + hostname);

    // subscribe to wildcard topic vs. individual intents!
    client.subscribe('hermes/#');
});

client.on('message', function (topic, message) {
    if (topic === "hermes/asr/startListening") {
        onListeningStateChanged(true);
    } else if (topic === "hermes/asr/stopListening") {
        onListeningStateChanged(false);
    } else if (topic.match(/hermes\/hotword\/.+\/detected/g) !== null) {
        onHotwordDetected()
    } else if (topic.match(/hermes\/intent\/.+/g) !== null) {
        onIntentDetected(JSON.parse(message));
    }
});

function onIntentDetected(intent) {
    console.log("[Snips Log] Intent detected: " + JSON.stringify(intent));

    // TODO: check it's for sure `ComputeSum`!!

    firstTerm = intent.slots[0].value.value;
    secondTerm = intent.slots[1].value.value;

    console.log("[Snips Log] firstTerm: " + firstTerm);
    console.log("[Snips Log] secondTerm: " + secondTerm);
    console.log("[Snips Log] sum: " + (firstTerm + secondTerm));

}

function onHotwordDetected() {
    console.log("[Snips Log] Hotword detected");
}

function onListeningStateChanged(listening) {
    console.log("[Snips Log] " + (listening ? "Start" : "Stop") + " listening");
}