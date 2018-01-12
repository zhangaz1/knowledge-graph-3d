import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

class KnowledgeGraph {
  constructor() {
    const { innerWidth, innerHeight } = window;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById('root'),
    });

    this.camera.position.z = 50;
    this.renderer.setSize(innerWidth, innerHeight);

    this.scene.add(this.getSphere({ radius: 5 }));

    this.renderer.render(this.scene, this.camera);
  }

  getSphere({ radius }) {
    const geometry = new SphereGeometry(radius, 20, 20);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    return new Mesh(geometry, material);
  }
}

export default KnowledgeGraph;
