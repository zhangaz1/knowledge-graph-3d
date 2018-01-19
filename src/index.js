import * as d3 from 'd3-force-3d';
import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';

import { nodes, links } from '../mock/data.json';

class KnowledgeGraph {
  nodes = [];
  lines = [];

  constructor() {
    this.init();
    this.parseData();
    this.startDraw();
  }

  init() {
    const { innerWidth, innerHeight } = window;
    const { Scene, PerspectiveCamera, WebGLRenderer } = THREE;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('root'),
    });

    // 设置相机位置
    this.camera.position.z = 200;

    // 设置画布大小
    this.renderer.setSize(innerWidth, innerHeight);

    // 添加轨道控制
    const controls = new (OrbitControls(THREE))(this.camera, this.renderer.domElement);

    controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
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

  drawSphere = ({ color }) => {
    const { Mesh, MeshBasicMaterial, SphereGeometry } = THREE;

    const geometry = new SphereGeometry(2.5, 10, 10);
    const material = new MeshBasicMaterial({
      color,
      wireframe: true,
    });

    const sphere = new Mesh(geometry, material);

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
    nodes.forEach(() => {
      this.drawSphere({
        color: 0xffffff,
      });
    });

    links.forEach(() => {
      this.drawLine({
        color: 0xffffff,
      });
    });
  }
}

export default KnowledgeGraph;
