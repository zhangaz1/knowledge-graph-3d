import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

class KnowledgeGraph {
  constructor() {
    const { innerWidth, innerHeight } = window;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('root'),
    });

    this.renderer.setSize(innerWidth, innerHeight);
  }
}

export default KnowledgeGraph;
