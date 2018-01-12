import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

class KnowledgeGraph {
  constructor() {
    const { innerWidth, innerHeight } = window;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();

    this.renderer.setSize(innerWidth, innerHeight);

    document.body.appendChild(this.renderer.domElement);
  }
}

export default KnowledgeGraph;
