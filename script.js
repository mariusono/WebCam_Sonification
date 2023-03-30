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


//---------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------
// TONE.JS PART

//attach a click listener to a play button
const button_1 = document.getElementById("button_1");
const button_2 = document.getElementById("button_2");

let flag_audio_on_off = false;

// create an array of sawtooth oscillators with Tone.js
const oscillators = [];
const bassFreq = 24;

for (let i = 0; i < 15; i++) {
    oscillators.push(new Tone.Oscillator({
        frequency: bassFreq * i,
        type: "sine",
        volume: -Infinity,
        detune: Math.random() * 30 - 15,
    }));
}

// create a panner3D
const panner = new Tone.Panner3D();
panner.panningModel = 'HRTF';
// panner.panningModel = 'equalpower';

// initialize panner
panner.setPosition(0, 0, 0);

// initialize Lisener
let xPos = 0.0;
let yPos = 0.0;
let zPos = 0.0;

function updateListenerPos() {
    // Tone.Listener.positionX.value = -xPos;
    // Tone.Listener.positionY.value = yPos;
    // Tone.Listener.positionZ.value = -zPos;    
    Tone.Listener.positionX.rampTo(-xPos,0.01);
    Tone.Listener.positionY.rampTo(yPos,0.01);
    Tone.Listener.positionZ.rampTo(-zPos,0.01);
    // console.log("working!")
};
updateListenerPos();

// connect oscillators to panner
oscillators.forEach(o => {
    o.connect(panner);
});

// create a freeverb node
const freeverb = new Tone.Freeverb(0.7,5000);

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



button_1.addEventListener("click", async () => {
    await Tone.start();
    console.log("audio is ready");

    // start the transport (i.e. the "clock" that drives the loop)
    Tone.Transport.start();

    // SET THE GLOBAL BPM VAL !  
    // Tone.Transport.bpm.value = 240; // working with '4n', i.e. quarter notes afterwards.. so equivalent to '8n' eigth notes at 120 bpm
    // Tone.Transport.bpm.value = 480; // working with '4n', i.e. quarter notes afterwards.. so equivalent to '8n' eigth notes at 120 bpm
    // Tone.Transport.bpm.value = 120; 

    oscillators.forEach(o => {
        o.start();
        o.volume.rampTo(-25, 1);
    });

    flag_audio_on_off = true;
});


// Clear console after load.. 
console.clear();

// var t = Tone.Time("4n");
// console.log(t);

let valHarmonicity = 1.0;
let valHarmonicityPrev = 1.0;

function setHarmonicity(v) {


    if (v < 20) v = 20;
    if (v > 90) v = 90;

    let rangeSize = 90 - 20;
    let perc_interval = 5;
    v = Math.floor(v / (perc_interval * rangeSize / 100)) * (perc_interval * rangeSize / 100);
    if (v < 20) v = 20;
    if (v > 90) v = 90;

    valHarmonicity = linearMapping(0.5, 4.0, 20, 90, v);
    // valPlayback = exponentialMapping(0.0, 4.0, 0, 1000, 3., v);

    //   console.log(prevTimeBetweenBeats);

    // Changing time at the next beep of the prev loop so as to not cause out of phase rhythms

    if (valHarmonicity !== valHarmonicityPrev) {
        // console.log(valHarmonicity);
        // console.log(valHarmonicityPrev);
        // console.log('triggered!');

        // Change base freqs of oscillators
        oscillators.forEach((osc, i) => {
            osc.frequency.rampTo(bassFreq * i * valHarmonicity, 0.1);
        });
    }

    valHarmonicityPrev = valHarmonicity;

}

function setGain(v) {
    gainVal = linearMapping(-30.0, 10.0, 0, 10000, v); // db linear Scale
    let gainVal_amp = 10 ** (gainVal / 20);
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


// function t_stop() {
//     console.log("stopping");
//     console.log("why?");
//     Tone.Transport.stop();
// }

// button_2.addEventListener("click",t_stop);

button_2.addEventListener("click", async () => {
    console.log("stopping Oscillators!");

    oscillators.forEach(o => {
        o.stop("+1.2");
        o.volume.rampTo(-Infinity, 1);
    });

    flag_audio_on_off = false;
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

        if (flag_audio_on_off){
            setXPos(average(yaw_array));
            setYPos(average(dist_points_array));
            setZPos(average(pitch_array));

            setHarmonicity(average(dist_points_array));
            updateListenerPos()
        }
        index++;
    }, 50)
})
//---------------------------------------------------------------------------------------------------------------



