import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { loadavg, freemem } from 'os';
import Particle from './particle'
import ParticleSquare from './geometry/ParticleSquare';
import Mesh from './geometry/Mesh';
import Texture from './rendering/gl/Texture';

let tex0: Texture;

const THREE = require('three');
var fftSize = 128;
var fftSize2 = 512;
var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();
var audio = new THREE.Audio( listener );
let n: number;
var analyser: any;
var freqData : any;
var analyser2: any;
var freqData2 : any;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const PI = 3.14159;

let square: Square;
let square2: Square;
let square3: Square;
let particleSquare: ParticleSquare;
let screenQuad: ScreenQuad;
let particles: Array<Particle>;

let time: number = 4000.0;
let offsetsArray: Array<number>;
let colorsArray: Array<number>;
let instanceIdxArray: Array<number>;
let instanceIdxArray2: Array<number>;
let scaleFactorArray: Array<number>;

let wavArray = new Array<number>();
let row = 0;
let deltDist = 0.01;
let rows = 40;
let cols = 30;
let deltRadius = 0.05;
var offsetY = 0;

let ringObj: string;
let ringMesh: Mesh;
let ring2Mesh: Mesh;
let ring3Mesh: Mesh;
let ring4Mesh: Mesh;


function loadOBJText(dir: string) {
  return readTextFile(dir);
}

export function readTextFile(file: string): string
{
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

function loadScene() {
  // load texture
  tex0 = new Texture('../src/textures/texture.jpg')

  // load obj
  ringObj = loadOBJText('../src/obj/ring.obj');
  ringMesh = new Mesh(ringObj, vec3.fromValues(0, 0, 0));
  ringMesh.create();

  ringObj = loadOBJText('../src/obj/ring2.obj');
  ring2Mesh = new Mesh(ringObj, vec3.fromValues(0, 0, 0));
  ring2Mesh.create();

  ringObj = loadOBJText('../src/obj/ring3.obj');
  ring3Mesh = new Mesh(ringObj, vec3.fromValues(0, 0, 0));
  ring3Mesh.create();

  ringObj = loadOBJText('../src/obj/ring4.obj');
  ring4Mesh = new Mesh(ringObj, vec3.fromValues(0, 0, 0));
  ring4Mesh.create();

  // creat square drawable
  square = new Square();
  square.create();

  square2 = new Square();
  square2.create();

  square3 = new Square();
  square3.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  particleSquare = new ParticleSquare();
  particleSquare.create();
  particles = new Array<Particle>();
  for (let i = 0; i < rows; i++) {
    let radiusVec = vec3.fromValues(deltRadius * i, -0.4, 0);
    for (let j = 0; j < cols; j++) {
      let pos = vec3.fromValues(0, 0, 0);
      vec3.rotateY(pos, radiusVec, vec3.fromValues(0, -0.4, 0), PI * j / cols);
      let particelMass = 1.0;
      let particle = new Particle(particelMass, 
                                  pos,
                                  vec3.fromValues(0, 0, 0), 
                                  vec3.fromValues(0, 0, 0), 
                                  vec4.fromValues(0.1, 0.1, 1, 1));
      particles.push(particle);
    }

  }
  
}

const controls = {
  song: ['Infinite.mp3', 'Rafrain.mp3', '静寂之空.mp3', 'あなたに出会わなければ~夏雪冬花~.mp3'],
};

var selectedSong = "Rafrain.mp3";

// let n = 10


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

  // for particles
  analyser2 = new THREE.AudioAnalyser( audio, fftSize2 );
  freqData2 = analyser2.getFrequencyData();  //--> an uint8array

  n = freqData.length;
}



function updateScene(deltaT: number) {
  freqData = analyser.getFrequencyData(); 

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

  square3.setInstanceVBOs(offsets, colors, instanceIdx, scaleFactors);
  square3.setNumInstances(n * 4);
  
}

function updateParticels(deltaT: number) {

  offsetsArray = new Array<number>();
  colorsArray = new Array<number>();

  let averageF = freqData[30] - 255 / 2;
  if (row >= rows) {
    row -= rows;
  }
  wavArray[row] = 0.5 * averageF / 255 - 0.2;


  let idx = 0;
  for (let i = 0; i < rows; i++) {
    if (row - i < 0) {
      offsetY = wavArray[rows + (row - i)];
    } else {
      offsetY = wavArray[row - i];
    }

    for (let j = 0; j < cols; j++) {
      let particle = particles[idx++];


      offsetsArray.push(particle.pos[0]);
      offsetsArray.push(particle.pos[1] + offsetY);
      // offsetsArray.push(0.005 * (time % 20));
      // offsetsArray.push(particle.pos[1]);
      offsetsArray.push(particle.pos[2]);

      colorsArray.push(particle.col[0]);
      colorsArray.push(particle.col[1]);
      colorsArray.push(particle.col[2]);
      colorsArray.push(particle.col[3]);

      let offsets: Float32Array = new Float32Array(offsetsArray);
      let colors: Float32Array = new Float32Array(colorsArray);
      particleSquare.setInstanceVBOs(offsets, colors);
      particleSquare.setNumInstances(particles.length);
    }
  }
  row++;
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
  const camera2 = new Camera(vec3.fromValues(0, 50, 0), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  //================moved here=============
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  camera2.setAspectRatio(window.innerWidth / window.innerHeight);
  camera2.updateProjectionMatrix();

  const customShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  const flatShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const bottomRingShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/bottomRing-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/bottomRing-frag.glsl')),
  ]);

  const ringShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ring-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ring-frag.glsl')),
  ]);

  const skyShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);

  const lambertShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const cloudShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/cloud-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/cloud-frag.glsl')),
  ]);

  cloudShader.setupTexUnits(["tex_Color"]);


  flatShader.setTotalBins(n * 2);
  ringShader.setTotalBins(n * 2);
  bottomRingShader.setTotalBins(n * 2);



  // This function will be called every frame
  function tick() {
    let averageF = analyser.getAverageFrequency();
    stats.begin();
    customShader.setTime(time++);
    flatShader.setTime(time++);
    bottomRingShader.setTime(time++);
    ringShader.setTime(time++);
    skyShader.setTime(time++);
    lambertShader.setTime(time++);
    cloudShader.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    updateScene(1);
    updateParticels(1);


    renderer.render(camera, flatShader, [
      square,square2
    ]);
    renderer.render(camera, ringShader, [
      square,square2
    ]);

    renderer.render(camera, bottomRingShader, [
      square, square2
    ]);

    renderer.render(camera2, customShader, [
      particleSquare
    ]);

    if (averageF > 0) {
      lambertShader.setRad(0.002);
    } else {
      lambertShader.setRad(0);
    }
    renderer.render(camera, lambertShader, [
      ringMesh
    ]);

    if (averageF > 0) {
      lambertShader.setRad(0.002);
    } else {
      lambertShader.setRad(0);
    }
    renderer.render(camera, lambertShader, [
      ring2Mesh
    ]);

    if (averageF > 0) {
      lambertShader.setRad(0.002);
    } else {
      lambertShader.setRad(0);
    }
    renderer.render(camera, lambertShader, [
      ring3Mesh
    ]);

    if (averageF > 0) {
      lambertShader.setRad(-0.002);
    } else {
      lambertShader.setRad(0);
    }
    renderer.render(camera, lambertShader, [
      ring4Mesh
    ]);


    // skyShader.setDimension(vec2.fromValues(canvas.width, canvas.height));
    // renderer.render(camera, skyShader, [
    //   screenQuad
    // ]);

    // for cloud
    if (averageF > 0) {
      cloudShader.setDimension(vec2.fromValues(canvas.width, canvas.height));
      cloudShader.setFreq(freqData[30]);
      cloudShader.bindTexToUnit("tex_Color", tex0, 0);
      renderer.render(camera, cloudShader, [
        screenQuad
      ]);
    }



    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();

    camera2.setAspectRatio(window.innerWidth / window.innerHeight);
    camera2.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  camera2.setAspectRatio(window.innerWidth / window.innerHeight);
  camera2.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
