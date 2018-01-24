import * as d3 from 'd3-force-3d';
import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import fontJSON from '../font/data.json';

import { nodes, links } from '../mock/data.json';

class KnowledgeGraph {
  nodes = [];
  names = {};
  lines = [];

  constructor() {
    this.init();
    this.parseData();
    this.startDraw();
  }

  init() {
    const { innerWidth, innerHeight } = window;
    const { Scene, PerspectiveCamera, WebGLRenderer, FontLoader, Raycaster, Vector2 } = THREE;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('root'),
    });
    this.raycaster = new Raycaster();

    // 解析字体样式
    this.font = new FontLoader().parse(fontJSON);

    // 设置相机位置
    this.camera.position.z = 200;

    // 设置画布大小
    this.renderer.setSize(innerWidth, innerHeight);

    // 添加轨道控制
    const controls = new (OrbitControls(THREE))(this.camera, this.renderer.domElement);

    controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });

    // 添加事件绑定
    this.mouse = new Vector2();

    window.addEventListener('mousemove', this.handleMouseMove, false);
    window.requestAnimationFrame(this.render);
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

  drawSphere = ({ name, color }) => {
    const { Mesh, MeshBasicMaterial, SphereGeometry } = THREE;

    const geometry = new SphereGeometry(2.5, 10, 10);
    const material = new MeshBasicMaterial({
      color,
      wireframe: true,
    });

    const sphere = new Mesh(geometry, material);

    sphere.name = name;

    this.scene.add(sphere);
    this.nodes.push(sphere);
  }

  handleTick = () => {
    const { Vector3 } = THREE;

    nodes.forEach((node, idx) => {
      const { x, y, z } = node;
      const sphere = this.nodes[idx];

      sphere.position.set(x, y, z);
    });

    links.forEach((link, idx) => {
      const { source, target } = link;
      const line = this.lines[idx];

      line.geometry.verticesNeedUpdate = true;
      line.geometry.vertices[0] = new Vector3(source.x, source.y, source.z);
      line.geometry.vertices[1] = new Vector3(target.x, target.y, target.z);
    });

    this.renderer.render(this.scene, this.camera);
  }

  handleMouseMove = (e) => {
    this.mouse.x = ((e.clientX / window.innerWidth) * 2) - 1;
    this.mouse.y = -((e.clientY / window.innerHeight) * 2) + 1;
  }

  parseData() {
    const simulation = d3.forceSimulation()
      .numDimensions(3)
      .force('link', d3.forceLink().id(d => d.id))
      .force('center', d3.forceCenter())
      .force('charge', d3.forceManyBody());

    simulation.nodes(nodes);
    simulation.force('link').links(links);

    simulation.on('tick', this.handleTick);
  }

  startDraw() {
    nodes.forEach((node) => {
      const { id: name } = node;

      this.drawName({
        name,
        color: 0xffffff,
      });

      this.drawSphere({
        name,
        color: 0xffffff,
      });
    });

    links.forEach(() => {
      this.drawLine({
        color: 0xffffff,
      });
    });
  }

  render = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 获取交汇结点
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // 显示结点名称
    if (intersects &&
        intersects.length) {
      Object.keys(this.names).forEach((name) => {
        const text = this.names[name];

        text.visible = false;
      });
    }

    intersects.forEach((item) => {
      const { object: node } = item;
      const { type, name, position } = node;
      const { x, y, z } = position;

      if (type === 'Mesh' &&
          name !== '') {
        const text = this.names[name];

        text.visible = true;
        text.geometry.center();
        text.position.set(x, y + 10, z);
        text.lookAt(this.camera.position);
      }
    });

    window.requestAnimationFrame(this.render);
  }
}

export default KnowledgeGraph;
