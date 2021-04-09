if (adapter.browserDetails.browser === 'firefox') {
    adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}

// Global variables
let mediaRecorder;
let recordedBlobs = [];

// Video elements
const liveVideo = document.getElementById('live')
const recedVideo = document.getElementById('reced');

// Button elements
const startButton = document.getElementById('start-record')
const stopButton = document.getElementById('stop-record')
const playButton = document.getElementById('playback')
const downloadButton = document.getElementById('dwnload')

// Recording element
const recIndicator = document.querySelector('.rec-ctn')


// Add event listener to start button
// initialize MediaStream
// initialize MediaRecorder and pass MediaStream
startButton.addEventListener('click', () => {
    recordedBlobs = []
    recedVideo.src = null
    recedVideo.srcObject = null
    navigator.mediaDevices.getDisplayMedia({ audio: true, video: { cursor: "always" } })
        .then(stream => {
            // const liveVideo = document.getElementById('live')
            liveVideo.srcObject = stream
            let options = { mimeType: "video/webm;codecs=vp8,opus", video: true, audio: true }
            try {
                mediaRecorder = new MediaRecorder(stream, options)

            } catch (error) {
                console.error('An error occurred while creating the MediaRecorder: ', error)
                return
            }
            mediaRecorder.start(100)
            recIndicator.style.display = 'flex'
            mediaRecorder.ondataavailable = function (e) {
                recordedBlobs.push(e.data)
            }
            console.log('mediaRecorder started: ', mediaRecorder)
        })
        .catch(error => console.log('There was an error', error))
})



stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    recIndicator.style.display = 'none'
    console.log('Recording stopped', recordedBlobs)
})

playButton.addEventListener('click', () => {
    const videoPlayback = new Blob(recordedBlobs, { type: 'video/webm' });
    liveVideo.src = null
    liveVideo.srcObject = null
    recedVideo.src = window.URL.createObjectURL(videoPlayback);
    recedVideo.controls = true;
    recedVideo.play()
})

downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click()
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100)
})

// Ensure that 'getDisplayMedia' is supported before allowing recording
if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    startButton.disabled = false;
} else {
    errorMsg('getDisplayMedia is not supported')
}