const cameraSize = { w: 360, h: 240 };
const canvasSize = { w: 360, h: 240 };
const resolution = { w: 1080, h: 720 };
const minColor = { r: 108, g: 0, b: 0 };
const maxColor = { r: 255, g: 60, b: 60 };
let video;
let media;
let canvas;
let canvasCtx;
let cnt = 0;
var labels = [];
var rawData = [0];
var filData = [0];
var rawDiffData = [0];
var rawDiff2Data = [];
var hrData = [];
var index_last = 0;

for (let i = 0; i < 100; i++) {
  labels.push(i);
}

var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "赤色",
        data: [],
        borderColor: ["rgba(255,99,132,1)"],
        borderWidth: 1,
        showLine: true,
      },
    ],
  },
  options: {
    elements: {
      line: {
        tension: 0, // ベジェ曲線を無効にする
      },
    },
  },
});

// video要素をつくる
video = document.createElement("video");
video.id = "video";
video.width = cameraSize.w;
video.height = cameraSize.h;
video.autoplay = true;
document.getElementById("videoPreview").appendChild(video);

// video要素にWebカメラの映像を表示させる
media = navigator.mediaDevices
  .getUserMedia({
    audio: false,
    video: {
      width: { ideal: resolution.w },
      height: { ideal: resolution.h },
    },
  })
  .then(function (stream) {
    video.srcObject = stream;
  });

// canvas要素をつくる
canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = canvasSize.w;
canvas.height = canvasSize.h;
document.getElementById("canvasPreview").appendChild(canvas);

// コンテキストを取得する
canvasCtx = canvas.getContext("2d");

(function loop() {
  setTimeout(loop, 1000 / 20);
  canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let red = _getRedColor();
  rawData.push(red);
  if (rawData.length < 10) {
  } else {
    let tmp = 0;
    let tmp2 = 0; //基線
    for (let i = 1; i <= 10; i++) {
      tmp += rawData[rawData.length - i];
    }
    tmp /= 10.0;
    filData.push(tmp - tmp2);

    rawDiffData.push(filData[filData.length - 1] - rawData[filData.length - 2]);
    let val1 = rawDiffData[rawDiffData.length - 1];
    let val2 = rawDiffData[rawDiffData.length - 2];
    if (val1 < 0 && val2 >= 0) {
      hrData.push((20 / index_last) * 60);
      index_last = 0;
    } else {
      index_last += 1;
    }

    if (hrData.length > 100) hrData.shift();
    myChart.data.datasets[0].data = [...hrData];
    cnt++;
    myChart.update();
  }
})();

function _getRedColor() {
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // rgba、1バイト×4のデータ

  let red = 0;

  for (let i = 0, len = data.length; i < len; i += 4) {
    red += data[i];
  }
  //console.log(red / (data.length / 4));
  return red / (data.length / 4);
}
