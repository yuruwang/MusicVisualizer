import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './mesh';
import mesh from './mesh';
import { loadavg, freemem } from 'os';

const THREE = require('three');
var fftSize = 128;
var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();
var audio = new THREE.Audio( listener );
let n: number;
var analyser: any;
var freqData : any;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const PI = 3.14159;

let square: Square;
let square2: Square;
let particle: Square;
let screenQuad: ScreenQuad;

let time: number = 4000.0;
let offsetsArray: Array<number>;
let colorsArray: Array<number>;
let instanceIdxArray: Array<number>;
let instanceIdxArray2: Array<number>;
let scaleFactorArray: Array<number>;

const controls = {
  song: ['Infinite.mp3', 'Rafrain.mp3', '静寂之空.mp3', 'あなたに出会わなければ~夏雪冬花~.mp3'],
};

var selectedSong = "Infinite.mp3";

// let n = 10;

function loadAudio(filename: String) {
  if (audio.isPlaying) {
    audio.stop();
  }
  time = 4000.0;
  var filePath = "./src/" + filename;
  audioLoader.load( filePath, function ( buffer: any ) {
    audio.setBuffer( buffer );
    audio.setLoop( true );
    audio.play();
  } );
  // console.log("audio: ", audio);
  analyser = new THREE.AudioAnalyser( audio, fftSize );
  freqData = analyser.getFrequencyData();  //--> an uint8array
  n = freqData.length;
  console.log("n:", n);
}

function loadScene() {
  // creat square drawable
  square = new Square();
  square.create();

  square2 = new Square();
  square2.create();

  particle = new Square();
  particle.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();
  
}

function updateScene(deltaT: number) {
  freqData = analyser.getFrequencyData(); 
  // console.log(freqData);
  // might be slow??
  offsetsArray = new Array<number>();
  colorsArray = new Array<number>();
  instanceIdxArray = new Array<number>();
  instanceIdxArray2 = new Array<number>();
  scaleFactorArray = new Array<number>();

  // left half
  for (let i = 0; i <= 2 * n; i++) {
    instanceIdxArray.push(-i);
    instanceIdxArray2.push(-i + n);


    offsetsArray.push(0.05 * freqData[50] / 255.0);

    if (i < n) {
      scaleFactorArray.push(freqData[i] / 255.0);
    } else {
      if (i == 2 * n) {
        scaleFactorArray.push(freqData[0] / 255.0);
      } else {
        scaleFactorArray.push(freqData[n - i % n] / 255.0);
      }

    }


    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
  }

  // right upper half
  for (let i = 1; i <= 2 * n; i++) {
    instanceIdxArray.push(i);
    if (i < n) {
      instanceIdxArray2.push(i + n);
    } else {
      instanceIdxArray2.push(i - 3 * n);
    }

    offsetsArray.push(0.05 * freqData[50] / 255.0);

    if (i <= n) {
      scaleFactorArray.push(freqData[i] / 255.0);
    } else {
      if (i == 2 * n) {
        scaleFactorArray.push(freqData[0] / 255.0);
      } else {
        scaleFactorArray.push(freqData[n - i % n] / 255.0);
      }
    }

    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
  }



  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let instanceIdx: Float32Array = new Float32Array(instanceIdxArray);
  let instanceIdx2: Float32Array = new Float32Array(instanceIdxArray2);
  let scaleFactors: Float32Array = new Float32Array(scaleFactorArray);
  square.setInstanceVBOs(offsets, colors, instanceIdx, scaleFactors);
  square.setNumInstances(n * 4);

  square2.setInstanceVBOs(offsets, colors, instanceIdx2, scaleFactors);
  square2.setNumInstances(n * 4);
  
}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var songControl = gui.add(controls, 'song', controls.song);
  songControl.onChange(function(value: string) {
    selectedSong = value;
    loadAudio(selectedSong);
    console.log("song changed to: " + selectedSong);
  });

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // load audio
  loadAudio(selectedSong);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 50), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  //================moved here=============
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  const flatShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const ringShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ring-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ring-frag.glsl')),
  ]);

  const skyShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);


  flatShader.setTotalBins(n * 2);
  ringShader.setTotalBins(n * 2);



  // This function will be called every frame
  function tick() {
    stats.begin();
    lambert.setTime(time++);
    flatShader.setTime(time++);
    ringShader.setTime(time++);
    skyShader.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    updateScene(1);

    renderer.render(camera, flatShader, [
      square,square2
    ]);
    renderer.render(camera, ringShader, [
      square,square2
    ]);

    skyShader.setDimension(vec2.fromValues(canvas.width, canvas.height));
    renderer.render(camera, skyShader, [
      screenQuad
    ]);


    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);


  // Start the render loop
  tick();
}

main();
