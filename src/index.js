import * as d3 from 'd3-force-3d';
import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import Colors from './colors';
import fontJSON from '../font/data.json';

class KnowledgeGraph {
  nodes = [];
  links = [];
  groups = [];
  colors = Colors;

  spheres = [];
  lines = [];
  names = {};

  isTimerStop = false;
  displayName = null;

  maxLevel;
  minRadius;
  maxRadius;

  constructor({ data, minRadius, maxRadius }) {
    const { nodes, links } = data;

    this.nodes = nodes;
    this.links = links;

    const { level = 1 } = nodes[0];

    this.maxLevel = level;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;

    this.init();
    this.parseData();
    this.startDraw();
  }

  init() {
    // 创建场景、相机、渲染器
    this.createScene();

    // 创建光源
    this.createLights();

    // 添加轨道控制
    this.addControls();

    const { FontLoader, Raycaster, Vector2 } = THREE;

    this.raycaster = new Raycaster();

    // 解析字体样式
    this.font = new FontLoader().parse(fontJSON);

    // 添加事件绑定
    this.mouse = new Vector2();

    window.addEventListener('mousemove', this.handleMouseMove, false);
    window.requestAnimationFrame(this.render);
  }

  createScene() {
    const { innerWidth, innerHeight } = window;
    const { Scene, PerspectiveCamera, WebGLRenderer } = THREE;

    // 创建场景
    this.scene = new Scene();

    // 创建相机
    this.camera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);

    // 设置相机位置
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 200;

    // 创建渲染器
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('root'),
      alpha: true,
      antialias: true,
    });

    // 设置渲染器尺寸
    this.renderer.setSize(innerWidth, innerHeight);

    // 监听屏幕的缩放
    window.addEventListener('resize', this.handleWindowResize, false);
  }

  createLights() {
    const { HemisphereLight, DirectionalLight } = THREE;
    const { scene } = this;

    const hemisphereLight = new HemisphereLight('#D9DBDB', '#F0F2F2', 0.9);
    const directionalLight = new DirectionalLight('#FFFFFF', 0.9);

    directionalLight.position.set(150, 350, 350);

    scene.add(hemisphereLight);
    scene.add(directionalLight);
  }

  addControls() {
    const { scene, camera, renderer } = this;

    const controls = new (OrbitControls(THREE))(camera, renderer.domElement);

    controls.addEventListener('change', () => {
      renderer.render(scene, camera);
    });
  }

  drawLine = ({ color }) => {
    const { Line, LineBasicMaterial, Geometry } = THREE;

    const geometry = new Geometry();
    const material = new LineBasicMaterial({
      color,
    });

    const line = new Line(geometry, material);

    this.scene.add(line);
    this.lines.push(line);
  }

  drawName = ({ name, color }) => {
    const { Mesh, MeshBasicMaterial, TextGeometry } = THREE;
    const { font } = this;

    const geometry = new TextGeometry(name, {
      font,
      size: 5,
      height: 0,
    });

    const material = new MeshBasicMaterial({
      color,
    });

    const text = new Mesh(geometry, material);

    text.visible = false;

    this.scene.add(text);
    this.names[name] = text;
  }

  drawSphere = ({ name, color, level }) => {
    const { Mesh, MeshPhongMaterial, SphereGeometry } = THREE;
    const { maxLevel, minRadius, maxRadius } = this;

    const radius = minRadius + (((maxRadius - minRadius) / (maxLevel - 1)) * (level - 1));

    const geometry = new SphereGeometry(radius, 20, 20);
    const material = new MeshPhongMaterial({
      color: color[level],
    });

    const sphere = new Mesh(geometry, material);

    sphere.name = name;

    this.scene.add(sphere);
    this.spheres.push(sphere);

    return sphere;
  }

  handleTick = () => {
    const { Vector3 } = THREE;
    const { nodes, links } = this;

    nodes.forEach((node, idx) => {
      const { x, y, z } = node;
      const sphere = this.spheres[idx];

      sphere.position.set(x, y, z);
    });

    links.forEach((link, idx) => {
      const { source, target } = link;
      const line = this.lines[idx];

      line.geometry.verticesNeedUpdate = true;
      line.geometry.vertices[0] = new Vector3(source.x, source.y, source.z);
      line.geometry.vertices[1] = new Vector3(target.x, target.y, target.z);
    });
  }

  handleRaycaster = () => {
    const { scene, camera, mouse, raycaster, names, displayName } = this;

    // 更新光线投射
    raycaster.setFromCamera(mouse, camera);

    // 获取交汇结点
    const intersects = raycaster.intersectObjects(scene.children);

    // 显示结点名称
    if (displayName) {
      displayName.visible = false;
    }

    if (intersects &&
        intersects.length) {
      const { object: node } = intersects[0];
      const { type, name, position } = node;

      if (type === 'Mesh' &&
          name !== '') {
        if (!names[name]) {
          this.drawName({
            name,
            color: 0xffffff,
          });
        }

        const text = names[name];
        const { x, y, z } = position;

        text.visible = true;
        text.geometry.center();
        text.position.set(x, y + 10, z);
        text.lookAt(camera.position);

        this.displayName = text;
      }
    }
  }

  handleMouseMove = (e) => {
    this.mouse.x = ((e.clientX / window.innerWidth) * 2) - 1;
    this.mouse.y = -((e.clientY / window.innerHeight) * 2) + 1;
  }

  handleWindowResize = () => {
    const { innerWidth, innerHeight } = window;
    const { camera, renderer } = this;

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);
  }

  parseData() {
    const { nodes, links } = this;

    const simulation = d3.forceSimulation()
      .numDimensions(3)
      .force('link', d3.forceLink().id(d => d.id))
      .force('center', d3.forceCenter())
      .force('charge', d3.forceManyBody());

    simulation.nodes(nodes);
    simulation.force('link').links(links);

    simulation.on('end', () => {
      this.isTimerStop = true;
    });
  }

  startDraw() {
    const { nodes, links, groups, colors } = this;

    nodes.forEach((node) => {
      const { id: name, group = 1, level = 1 } = node;

      if (!groups[group]) {
        groups[group] = {
          color: colors[group - 1],
          spheres: [],
        };
      }

      const sphere = this.drawSphere({
        name,
        color: groups[group].color,
        level,
      });

      groups[group].spheres.push(sphere);
    });

    links.forEach(() => {
      this.drawLine({
        color: '#CCCCCC',
      });
    });
  }

  render = () => {
    const { scene, camera, renderer, isTimerStop } = this;

    if (isTimerStop === false) {
      this.handleTick();
    } else {
      this.handleRaycaster();
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(this.render);
  }
}

export default KnowledgeGraph;
