//---------------------------------------------------------------------------------------------------------------
// HELPER FUNCTIONS - Maybe add them in a different file and import them..

function exponentialMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, fac, val) {
    // map value between 0 1
    valueMapped = 0.0 + ((1.0 - 0.0) * (val - rangeIn_bottom) / (rangeIn_top - rangeIn_bottom));

    // map to an exponential curve between 0 and 1 with a factor fac
    mapToExp = (Math.exp(valueMapped * fac) - 1) / (Math.exp(fac) - 1);

    // map back to desired output range
    newValue = rangeOut_bottom + ((rangeOut_top - rangeOut_bottom) * (mapToExp - 0) / (1 - 0));

    return newValue;
}

function linearMapping(rangeOut_bottom, rangeOut_top, rangeIn_bottom, rangeIn_top, value) {
    newValue = rangeOut_bottom + ((rangeOut_top - rangeOut_bottom) * (value - rangeIn_bottom) / (rangeIn_top - rangeIn_bottom));
    return newValue;
}

function average(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total += array[i];
    }
    var avg = total / array.length;
    return avg;
}

function mag2db(value) {
    return 20 * Math.log10(value);
}

function db2mag(value) {
    return 10 ** (value / 20);
}

//---------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------
// TONE.JS PART

//attach a click listener to a play button
const button_1 = document.getElementById("button_1");
const button_2 = document.getElementById("button_2");

let flag_audio_on_off = false;


// // create a new synth with Tone.js
// const synth = new Tone.PolySynth(Tone.Synth, {
//     oscillator: {
//         type: "sawtooth"
//     }
// });

const synth = new Tone.Synth( {
    oscillator: {
        type: "sawtooth"
    }
});


// set the oscillator type to "triangle"
// synth.oscillator.type = "square";

// create a panner3D
const panner = new Tone.Panner3D();
panner.panningModel = 'HRTF';
// panner.panningModel = 'equalpower';

// connect synth to panner
synth.connect(panner);

// initialize panner
panner.setPosition(0, 0, 0);

// initialize Lisener
let xPos = 0.0;
let yPos = 0.0;
let zPos = 0.0;

// initialize detune
let detuneVal = 0;
document.getElementById('DetuneAmount').innerText = parseFloat(detuneVal).toFixed(4);

function updateListenerPos() {
    // Tone.Listener.positionX.value = -xPos;
    // Tone.Listener.positionY.value = yPos;
    // Tone.Listener.positionZ.value = -zPos;    
    Tone.Listener.positionX.rampTo(-xPos, 0.01);
    Tone.Listener.positionY.rampTo(yPos, 0.01);
    Tone.Listener.positionZ.rampTo(-zPos, 0.01);
    // console.log("working!")
};
updateListenerPos();

// create a freeverb node
const freeverb = new Tone.Freeverb(0.7, 5000);

// connect panner to freeverb¨
panner.connect(freeverb);
// document.getElementById('Dampening').innerText = parseFloat(5000.0).toFixed(4);
document.getElementById('RoomSize').innerText = parseFloat(0.70).toFixed(4);

// create a gain node
const gainNode = new Tone.Gain(0.0);
document.getElementById('Gain').innerText = parseFloat(0.0).toFixed(4);


//connect freeverb to gain
freeverb.connect(gainNode); // synth goes to gain !

// send gain to audio destination (audio out)
gainNode.toDestination();

let gainVal = 0.0;
gainNode.gain.value = gainVal;
// Initialize slider values -- make sure they are the same as in the function
document.getElementById('Gain').innerText = parseFloat(-30.0).toFixed(4);



// Clear console after load.. 
console.clear();

// // create a loop that plays a C4 note every quarter note
// const loop = new Tone.Loop(time => {
//     // trigger the synth to play a C4 note at the specified time
//     synth.triggerAttackRelease("C4", "8n", time);
//     console.log("happening!");
// }, '4n');

let bassFreq = 110; // A2
let notePattern = [bassFreq, bassFreq * 5 / 4, bassFreq * 3 / 2, bassFreq*2/1] // major third, perfect fifth, octave
// let notePattern = [bassFreq, bassFreq * 5 / 4, bassFreq * 3 / 2, [bassFreq, bassFreq * 5 / 4, bassFreq * 3 / 2]] // major third, perfect fifth, octave
// let notePattern = [bassFreq,bassFreq*5/4] // major third, perfect fifth, octave

const loop = new Tone.Pattern((time, note) => {
    // the order of the notes passed in depends on the pattern
    synth.triggerAttackRelease(note, "8n", time);
    // console.log("happening!");
    // console.log(note);
    // console.log(synth.activeVoices); 

}, notePattern, "upDown");

loop.interval = '4n';

loop.start(0);

button_1.addEventListener("click", async () => {
    await Tone.start();
    console.log("audio is ready");

    // start the transport (i.e. the "clock" that drives the loop)
    Tone.Transport.start();

    // SET THE GLOBAL BPM VAL !  
    // Tone.Transport.bpm.value = 240; // working with '4n', i.e. quarter notes afterwards.. so equivalent to '8n' eigth notes at 120 bpm
    Tone.Transport.bpm.value = 480; // working with '4n', i.e. quarter notes afterwards.. so equivalent to '8n' eigth notes at 120 bpm
    // Tone.Transport.bpm.value = 120; 


    flag_audio_on_off = true;
});




// var t = Tone.Time("4n");
// console.log(t);

let valPlayback = 0.1;
let valPlaybackPrev = 0.1;
function setLoopInterval(v) {

    // let valPlayback = linearMapping(0.0, 10.0, 0, 1000,  v); 
    // valPlayback = exponentialMapping(0.0, 4.0, 0, 1000, 3., v);

    if (v < 20) v = 20;
    if (v > 90) v = 90;

    // changing value only in steps of a certain percentage
    let rangeSize = 90 - 20;
    let perc_interval = 10;
    v = Math.floor(v / (perc_interval * rangeSize / 100)) * (perc_interval * rangeSize / 100);

    if (v < 20) v = 20;
    if (v > 90) v = 90;

    valDetune = linearMapping(1.0, 1 * 2 ** (1 / 12), 40, 90, v); // detuning to max 1 semitones ... 

    v = linearMapping(0.0, 1000.0, 20, 90, v);
    valPlayback = exponentialMapping(0.0, 4.0, 0, 1000, 3., v);


    // console.log(valPlayback);
    // console.log(valPlaybackPrev);

    let adjustedBPM = valPlaybackPrev * Tone.Transport.bpm.value;

    let prevTimeBetweenBeats = 60 / adjustedBPM / 4; // div by 4 cause I'm working with quarter notes

    let timeNow = Tone.now();

    // valPlayback = 1;

    //   console.log(prevTimeBetweenBeats);

    // Changing time at the next beep of the prev loop so as to not cause out of phase rhythms

    if (valPlayback !== valPlaybackPrev) {
        console.log(valPlayback);
        console.log(valPlaybackPrev);
        console.log('triggered outside scheduledOnce!');

        loop.playbackRate = valPlayback;

        notePattern[1] = bassFreq * 5 / 4 * valDetune;
        notePattern[2] = bassFreq * 3 / 2 * valDetune;
        notePattern[3] = bassFreq * 2 / 1 * valDetune;
        // notePattern[3] = bassFreq*2/1*valDetune;

        // // The schedule stuff behaves really badly. gets clogged up in the callback queue and sends multiple requests one after another.. 
        // Tone.Transport.schedule((time) => {
        //     console.log(valPlayback);
        //     console.log(valPlaybackPrev);
        //     console.log('triggered INSIDE scheduledOnce!');

        //     loop.playbackRate = valPlayback;
        //     console.log(timeNow, prevTimeBetweenBeats);
        // }, timeNow + prevTimeBetweenBeats);
    }
    // loop.interval.rampTo(valScaled,1); // NOT WORKING ! 

    // // Changing time at the next subdivision so as to not cause out of phase rhythms
    // let timeNextSubDiv = Tone.Transport.nextSubdivision("4n"); // must be same as the loop time..
    // Tone.Transport.schedule((time) => {
    //   loop.playbackRate = valPlayback;
    // }, timeNextSubDiv);

    valPlaybackPrev = valPlayback;

    // console.log(timeNow);
    // console.log(timeNextSubDiv);

    // loop.playbackRate = valPlayback;

    // document.getElementById('Interval').innerText = parseFloat(valPlayback).toFixed(4);

}

function setGain(v) {
    gainVal = linearMapping(-30.0, 10.0, 0, 10000, v); // db linear Scale
    let gainVal_amp = 10 ** (gainVal / 20);
    // Set the gain to 0 when at -30 dB
    if (gainVal_amp < 0.0316 + 0.0001) { // equivalent of -30 dB + 0.0001
        gainVal_amp = 0;
    }
    document.getElementById('Gain').innerText = parseFloat(gainVal).toFixed(4);
    // gainNode.gain.value = gainVal;
    gainNode.gain.rampTo(gainVal_amp, 0.1);
}

function setRoomSize(v) {
    let roomSizeVal = linearMapping(0.0, 1.0, 0, 10000, v); // db linear Scale
    freeverb.roomSize.value = roomSizeVal;
    document.getElementById('RoomSize').innerText = parseFloat(roomSizeVal).toFixed(4);
    // console.log(freeverb.roomSize.value );
}

function setDampening(v) {
    let dampSize = linearMapping(0.0, 10000.0, 0, 10000, v); // db linear Scale
    freeverb.dampening = dampSize;  // weird that it doesn't have .value ... 
    document.getElementById('Dampening').innerText = parseFloat(dampSize).toFixed(4);
    // console.log(freeverb.dampening);
}

function setDetune(v) {

}

function setXPos(v) {
    if (v > -10 && v < 10) {
        v = 0;
    }
    xPos = linearMapping(1, -1, -90, 90, v);

    // console.log(v,xPos);
    // updatePanner();
}

function setYPos(v) {
    if (v < -20) v = -20;
    if (v > 90) v = 90;
    yPos = linearMapping(3, 0, 20, 90, v);
}

function setZPos(v) {
    if (v < -20) v = -20;
    if (v > 20) v = 20;

    zPos = linearMapping(2, -2, -20, 20, v);
}


button_2.addEventListener("click", async () => {
    console.log("stopping audio!");
    Tone.Transport.stop();
});
//---------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------
// VIDEO PART

const video = document.getElementById("video");

let yawFromVideo = 0;
let rollFromVideo = 0;
let pitchFromVideo = 0;

let xPoint_30 = 0;
let yPoint_30 = 0;
let xPoint_27 = 0;
let yPoint_27 = 0;
let distance_points = 0;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

const lenMovAvg = 5;
let dist_points_array = new Array(lenMovAvg).fill(0.001);
let yaw_array = new Array(lenMovAvg).fill(0);
let pitch_array = new Array(lenMovAvg).fill(0);
// console.log(yaw_array);

let index = 0;

video.addEventListener('play', () => {
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        // console.log(detections);
        // console.log(Object.keys(detections));

        yawFromVideo = detections['0']['angle']['yaw'];
        rollFromVideo = detections['0']['angle']['roll'];
        pitchFromVideo = detections['0']['angle']['pitch'];

        xPoint_27 = detections['0']['landmarks']['_positions']['27']['_x'];
        yPoint_27 = detections['0']['landmarks']['_positions']['27']['_y'];
        xPoint_30 = detections['0']['landmarks']['_positions']['30']['_x'];
        yPoint_30 = detections['0']['landmarks']['_positions']['30']['_y'];

        // distance_points = Math.sqrt((xPoint_27 - xPoint_30)**2 + (yPoint_27 - yPoint_30)**2);
        distance_points = (yPoint_30 - yPoint_27);

        dist_points_array[index % lenMovAvg] = distance_points;
        yaw_array[index % lenMovAvg] = yawFromVideo;
        pitch_array[index % lenMovAvg] = pitchFromVideo;

        if (flag_audio_on_off) {
            setXPos(average(yaw_array));
            setYPos(average(dist_points_array));
            setZPos(average(pitch_array));

            setLoopInterval(average(dist_points_array));
            updateListenerPos()
        }
        index++;
    }, 50)
})
//---------------------------------------------------------------------------------------------------------------



