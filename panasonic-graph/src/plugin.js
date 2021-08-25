import Graph from "./components/Graph.vue";

const plugin = {
  install(Vue) {
    Vue.component(Graph.name, Graph);
  },
};

export default plugin;
