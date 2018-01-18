import * as d3 from 'd3-force-3d';
import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';

import { nodes, links } from '../mock/data.json';

class KnowledgeGraph {
  nodes = [];

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
    this.camera.position.z = 50;

    // 设置画布大小
    this.renderer.setSize(innerWidth, innerHeight);

    // 添加轨道控制
    const controls = new (OrbitControls(THREE))(this.camera, this.renderer.domElement);

    controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  parseData() {
    const simulation = d3.forceSimulation()
      .numDimensions(3)
      .force('link', d3.forceLink().id(d => d.id));

    simulation.nodes(nodes);
    simulation.force('link').links(links);

    this.nodes = nodes;
    this.links = links;
  }

  getSphere({ radius, color, position }) {
    const { Mesh, MeshBasicMaterial, SphereGeometry } = THREE;
    const { x, y, z } = position;

    const geometry = new SphereGeometry(radius, 20, 20);
    const material = new MeshBasicMaterial({
      color,
      wireframe: true,
    });

    const sphere = new Mesh(geometry, material);

    sphere.position.set(x, y, z);

    return sphere;
  }

  getLine({ color, position }) {
    const { Line, LineBasicMaterial, Geometry, Vector3 } = THREE;

    const geometry = new Geometry();
    const material = new LineBasicMaterial({
      color,
    });

    const [source, target] = position;

    geometry.vertices.push(
      new Vector3(source.x, source.y, source.z),
      new Vector3(target.x, target.y, target.z),
    );

    const line = new Line(geometry, material);

    return line;
  }

  startDraw() {
    this.nodes.forEach((node) => {
      const { x, y, z } = node;

      const sphere = this.getSphere({
        radius: 2,
        color: 0xffffff,
        position: { x, y, z },
      });

      this.scene.add(sphere);
    });

    this.links.forEach((link) => {
      const { source, target } = link;

      const line = this.getLine({
        color: 0xffffff,
        position: [source, target],
      });

      this.scene.add(line);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

export default KnowledgeGraph;
