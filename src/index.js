import * as d3 from 'd3-force-3d';
import * as THREE from 'three';

import { nodes } from '../mock/data.json';

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

  parseData() {
    const simulation = d3.forceSimulation().numDimensions(3).nodes(nodes);

    this.nodes = simulation.nodes();
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

    this.renderer.render(this.scene, this.camera);
  }
}

export default KnowledgeGraph;
