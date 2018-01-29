import KnowledgeGraph from '../../src/index';
import data from '../../mock/data.json';

new KnowledgeGraph({
  data,
  minRadius: 3,
  maxRadius: 9,
});
