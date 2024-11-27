const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

// Load sunglasses image
const sunglassesImage = new Image();
sunglassesImage.src = 'assets/sunglasses.png';

// Initialize Mediapipe FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults(onResults);

// Initialize Camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();

// Handle FaceMesh Results
function onResults(results) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    drawSunglasses(landmarks, canvasCtx);
  }
}

// Draw Sunglasses on Detected Face
function drawSunglasses(landmarks, ctx) {
  // Key landmarks for eyes and nose
  const leftEye = landmarks[33];
  const rightEye = landmarks[362];
  const noseBridge = landmarks[1];

  // Calculate dimensions for the sunglasses
  const eyeWidth = Math.abs(rightEye.x - leftEye.x) * ctx.canvas.width;
  const sunglassesWidth = eyeWidth * 1.8; // Scale for proper fit
  const sunglassesHeight = sunglassesWidth / 2; // Proportional height

  // Position sunglasses centered on the nose bridge
  const centerX = noseBridge.x * ctx.canvas.width;
  const centerY = noseBridge.y * ctx.canvas.height;

  // Draw the sunglasses image
  ctx.drawImage(
    sunglassesImage,                 // Image source
    centerX - sunglassesWidth / 2,  // Top-left X
    centerY - sunglassesHeight / 2, // Top-left Y
    sunglassesWidth,                 // Width
    sunglassesHeight                 // Height
  );
}
