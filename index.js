var matrix = require('@matrix-io/matrix-lite');
var mqtt = require('mqtt');

var hostname = "mqtt://localhost"; //"mqtt://raspberrypi.local";
var client  = mqtt.connect(hostname);

console.log("[Snips Log] begin");

console.log("This device has " + matrix.led.length + ' LEDs');

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

    if ((typeof intent.slots[0] === 'undefined') || (typeof intent.slots[1] === 'undefined')) {
        matrix.led.set("red");

        client.publish('hermes/dialogueManager/endSession', JSON.stringify({
            sessionId: intent.sessionId,
            text: "I'm afraid I didn't catch that?"
        }));
    } else {
        firstTerm = intent.slots[0].value.value;
        secondTerm = intent.slots[1].value.value;

        console.log("[Snips Log] firstTerm: " + firstTerm);
        console.log("[Snips Log] secondTerm: " + secondTerm);
        sum = firstTerm + secondTerm;
        console.log("[Snips Log] sum: " + sum);

        client.publish('hermes/dialogueManager/endSession', JSON.stringify({
            sessionId: intent.sessionId,
            text: firstTerm + " plus " + secondTerm + " is " + sum
        }));

        if (sum > matrix.led.length) {
            sum = matrix.led.length;
        }
        everloop = new Array(sum).fill({b:100});
        matrix.led.set(everloop);
    }
}

function onHotwordDetected() {
    console.log("[Snips Log] Hotword detected");
    matrix.led.set("teal");
}

function onListeningStateChanged(listening) {
    console.log("[Snips Log] " + (listening ? "Start" : "Stop") + " listening");
    if (listening) {
        matrix.led.set("green");
    }
}