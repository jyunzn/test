<template lang="pug">
#graph
  //- select.nodeSelector(v-model="selectedNode")
  //-   option(v-for="node in nodes.filter(n=>n.id.indexOf('cluster')!=-1)"
  //-           :value="node") {{ node.id }}
  .map(v-if="showSmallMap")
    .node(v-for="node in nodes.filter(n=>n.id.indexOf('cluster')!=-1)",
          :style="{left: `${node.x/width*20+40}%`, top: `${node.y/height*20+40}%`, sss: frameCount }",
          :class="{active: selectedNode && selectedNode.group === node.group}"
          @click="selectedNode = node")
      .wave
      .wave
      .wave
      .wave
      .wave
</template>

<script>
import * as d3 from "d3";
import * as PIXI from "pixi.js";
import Stats from 'stats-js'
import { TweenMax, TimelineMax, Power2, Power1,Sine } from "gsap";
import { schemeCategory10 } from "d3-scale-chromatic";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";

let textureMalware;
let pixiObjects = {};
export default {
  name: "PanasonicGraph",
  props: {
    defaultFilePath: {
      type: String,
      default: "/", // BTW, have no idea, why using public path, instead of just using '/'
    },
    defaultDataPath: {
      type: String,
      default: "1000.json"
    },
    imageVirusSrc: {
      type: String,
      default: "images/malware.png",
    },
    loadDefaultGraph: {
      type: Boolean,
      default: false
    },
    showSmallMap: {
      type: Boolean,
      default: true
    } ,
    zoomOutScale: {
      type: Number,
      default: 0.3
    }
  },
  data() {
    textureMalware = PIXI.Texture.from(
      `${this.defaultFilePath}${this.imageVirusSrc}`
    );

    return {
      dataSource: `${this.defaultFilePath + this.defaultDataPath}`,
      nodes: [],
      frameCount: 0,
      selectedNode: null, 
      graph: {},
      width: 0,
      height: 0,
      scale: 0.3,
      tick: null,
      scaleAnimation: null
    };
  },
  mounted() {
    console.log("[Graph] Mounted")
    let width = window.innerWidth,
        height = window.innerHeight;
    this.width = width;
    this.height = height;

    let rootStage = new PIXI.Container();
    let stage = new PIXI.Container();
    let panContainer = new PIXI.Container();
    let zoomContainer = new PIXI.Container();

    let textLayer = new PIXI.Container();
    let nodeLayer = new PIXI.Container();

    panContainer.addChild(stage);
    zoomContainer.addChild(panContainer);
    rootStage.addChild(zoomContainer);

    console.log(this.zoomOutScale)

    zoomContainer.scale.x = this.zoomOutScale
    zoomContainer.scale.y = this.zoomOutScale
    panContainer.position.x = this.width/2
    panContainer.position.y = this.height/2

    //光暈
    let bloomFilter = new AdvancedBloomFilter({
      bloomScale: 2,
      brightness: 1.5,
    }); 
 
    let renderer = PIXI.autoDetectRenderer({
      width,
      height,
      antialias: !0,
      transparent: 0,
      resolution: 1,

    });

    ////resize pixi when window resize

    function resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      console.log(`[Graph] Resize ${this.width} x ${this.height}`)
      renderer.view.style.width = this.width + "px";
      renderer.view.style.height = this.height + "px";
      renderer.resize(this.width,this.height)
    }
    window.onresize = resize;
    ///

    document.querySelector("#graph").appendChild(renderer.view);

    //setup stats.jsnpm 
    this.stats = new Stats();
    this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.querySelector("#graph").appendChild( this.stats.dom );

    let colour = (function () {
      let scale = d3.scaleOrdinal(schemeCategory10);
      return num => parseInt(scale(num).slice(1), 16);
    })();

    let simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(d => d.id)
          .distance(80)
          .strength(1.5)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(-300).distanceMax(1000).distanceMin(100)
      )
      .force("center", d3.forceCenter(width / 2, height / 2)).alphaTarget(0.1);

    pixiObjects = {
      renderer,
      stage,
      rootStage,
      panContainer,
      zoomContainer,
      textLayer,
      nodeLayer,
      bloomFilter,
      simulation,
    };
    if (this.loadDefaultGraph){
      this.setDataJSON(this.dataSource);
    }
    this.setUpAnimationTick()
    this.initDrag()
  },
  methods: {
    setScale(value){
      this.scale=value
    },
    //繪製擴張的圓形
    drawStrokeCircle(nodeId,cirCount=12){
      console.log("[Graph] drawStrokeCircle", nodeId,cirCount)

      let node = this.nodes.find(node=>node.id==nodeId)
      if (node){
          
          this.clr.position.set(node.x,node.y)
          // clr.scale.set(3,3)
          this.clr.lineStyle(4, 0xFFFFFF); 
          this.clr.drawCircle(0,0, 30);
          this.clr.endFill();  
          TweenMax.fromTo(this.clr, 1,
            {
              alpha: 1
            },
            { 
              alpha: 0,
              repeat: -1,
              overwrite: true,
              onRepeat: () => {
                this.clr.position.set(node.x,node.y)
              }
            },
            
          )

          TweenMax.fromTo(this.clr.scale, 1,
            {
              x: 0.1,
              y: 0.1
            },
            {
              x: 3,
              y: 3,
              repeat: -1,
              overwrite: true
            }
          )
      }
    },
    clearStrokeCircle() {
      TweenMax.killTweensOf(this.clr)
      TweenMax.killTweensOf(this.clr.scale)
      this.clr.alpha = 0;
    },
    initNodeGraphics(node) {
      node.gfx = new PIXI.Graphics();
      node.gfx.beginFill(0xffffff);
      let nodeLevel = node.id.indexOf("cluster") != -1 ? 1 : 2;

      node.gfx.drawCircle(0, 0, nodeLevel == 1 ? 10 : 5);
      pixiObjects.nodeLayer.addChild(node.gfx);

      if (node.depth == 2) {
        if (!textureMalware) textureMalware=PIXI.Texture.from(
          `${this.defaultFilePath}${this.imageVirusSrc}`
        );
        node.spriteMalware = new PIXI.Sprite(textureMalware);
        node.spriteMalware.anchor.set(0.5);
        node.spriteMalware.scale.set(0.3);
        node.spriteMalware.alpha = 0;
        pixiObjects.nodeLayer.addChild(node.spriteMalware);
      }

      let displayText = nodeLevel == 1 ? node.id : "-" + node.id.slice(-10);
      if (node.depth == 0) {
        node.gtext = new PIXI.Text(displayText, {
          fill: "#fff",
          fontWeight: 900,
          fontSize: 18,
        });
      } else {
        node.gtext = new PIXI.Text(displayText, {
          fill: "#bbb",
          fontWeight: 500,
          fontSize: 12,
        });
      }
      pixiObjects.textLayer.addChild(node.gtext);
    },

    initClr() {
      let clr = new PIXI.Graphics();
      pixiObjects.textLayer.addChild(clr)
      this.clr = clr
    },
    //取得源頭是哪個群組
    getLinkDepth(links, nodeId) {
      let depth = 0;
      let targetId = nodeId;
      let sourceId = null;
      let resultLink;
      while ((resultLink = links.find(link => link.source == targetId))) {
        depth++;
        targetId = resultLink.target;
        sourceId = targetId;
      }
      return { sourceId, depth };
    },
    initDrag(){
      let { simulation, renderer } = pixiObjects;
      function dragstarted(evt) {
        if (!evt.active) simulation.alphaTarget(0.3).restart();
        evt.subject.fx = evt.subject.x;
        evt.subject.fy = evt.subject.y;
      }

      function dragged(evt) {
        evt.subject.fx = evt.x;
        evt.subject.fy = evt.y;
      }

      function dragended(evt) {
        if (!evt.active) simulation.alphaTarget(0);
        evt.subject.fx = null;
        evt.subject.fy = null;
      }
      d3.select(renderer.view).call(
        d3
          .drag()
          .container(renderer.view)
          .subject(evt => simulation.find(evt.x, evt.y))
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
    },
    //設定資料檔案
    async setDataJSON(source,update=false) {
       console.log("[Graph] setDataJSON",source)
      let graph = await d3.json(source)
      this.setDataObject(graph,update)
      this.resetPixiPosScale()

    },
    //設定資料物件
    async setDataObject(graph,update=false){
      console.log("[Graph] setDataObject",graph)

      this.nodes.forEach(n=>n.destroyed=true)

      // console.log('graph set data')
      let { simulation, rootStage, renderer } = pixiObjects;

      //對方給的資料有多一層 .map
      graph = graph.map || graph;
      if (typeof graph == "string") {
        graph = JSON.parse(graph);
      }
      // console.log(graph)

      let removeChildsIfExist = arr=> arr.forEach(el=>{
        el&&pixiObjects.stage.removeChild(el) 
      })
      let destoryPixiEl = arr=> arr.forEach(el=>{ 
        el?.destroy && el.destroy(true)
      })

      removeChildsIfExist([pixiObjects.textLayer,pixiObjects.nodeLayer,pixiObjects.currentLinks,pixiObjects.currentTexts])
      destoryPixiEl([pixiObjects.textLayer,pixiObjects.currentLinks,pixiObjects.currentTexts])

      // reset stage 裡面的資料 
      pixiObjects.textLayer = new PIXI.Container();
      pixiObjects.nodeLayer = new PIXI.Container();
      pixiObjects.nodeLayer.filters = [pixiObjects.bloomFilter];
      pixiObjects.stage.addChild(pixiObjects.textLayer);
      pixiObjects.stage.addChild(pixiObjects.nodeLayer);
 
      pixiObjects.currentLinks = new PIXI.Graphics();
      pixiObjects.currentTexts = new PIXI.Graphics();
      pixiObjects.stage.addChild(pixiObjects.currentLinks);
      pixiObjects.stage.addChild(pixiObjects.currentTexts);

      let hashCode = str => {
        return str
          .split("")
          .reduce(
            (prevHash, currVal) =>
              ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
            0
          );
      };

      graph.nodes.forEach(node => {
        let { depth, sourceId } = this.getLinkDepth(graph.links, node.id);
        node.depth = depth;
        node.sourceId = sourceId;

        let useHashString = node.sourceId || node.id;
        let hash = hashCode(useHashString);
        node.x = Math.cos(hash * 3) * this.width * 2;
        node.y = Math.sin(hash * 100) * this.height * 2 + node.depth * 80;

        let { md5 } = this.getTagObjByMd5(node.id);
        if (md5) node.md5 = md5;
        // console.log(node.x)
        // node.y = Math.sin(node.sourceId/50)*height
      });
      graph.nodes.forEach(this.initNodeGraphics);

      this.graph = graph;
      this.nodes = graph.nodes;
      // initScale && this.setScale(initScale)


      simulation.nodes(graph.nodes);
      simulation.force("link").links(graph.links);
      this.triggerSimulationReheat()


      this.initClr()
    },
    //設定畫面渲染的loop
    setUpAnimationTick(){ 
      
      let ticked = () => {

        this.stats.begin();
      
        let graph = this.graph
        let links = graph.links
        let currentLinks = pixiObjects.currentLinks 

        graph.nodes && graph.nodes.forEach(node => {
          let { x, y, gfx, gtext, spriteMalware } = node;

          gfx && gfx.position && gfx.position.set(x,y)
          gtext && gtext.position && gtext.position.set(x + 8, y + 8);
          if (spriteMalware) {
            spriteMalware.position = new PIXI.Point(x, y);
          }
          // if (node.circle ){
          //   node.circle.position.set(x,y)
          // }
          // if (this.selectedNode===node){
          //   gfx.scale.x=0.5
          //   gfx.scale.y=0.5
          // }
        });
        if ( graph?.nodes){
          graph.nodes = graph.nodes.filter(n=>!n.destroyed)
        }

        if (currentLinks){
          currentLinks.clear();
          currentLinks.alpha = 0.6;

          links && links.forEach(link => {
            let { source, target } = link;
            currentLinks.lineStyle(2, 0xeeeeee);
            currentLinks.moveTo(source.x, source.y);
            currentLinks.lineTo(target.x, target.y);
          });

          // currentLinks.endFill();

        }

        pixiObjects.renderer && pixiObjects.renderer.render(pixiObjects.rootStage);
        this.frameCount++;
        this.stats.end();
        requestAnimationFrame(ticked);
      };
      requestAnimationFrame(ticked);
    },
    //重新觸發物理模擬
    triggerSimulationReheat(target=0.5,duration=5000){
      let { simulation, rootStage, renderer } = pixiObjects;
      simulation.alphaTarget(target).restart()
      setTimeout(()=>{
        simulation.alphaTarget(0)
      },duration)
    },
    getTagObjByMd5(md5) {
      return (this.graph?.tags || []).filter(tag => tag.md5 == md5);
    },

    zoomOut(){
      console.log("[Graph] zoomOut")
      this.scale=this.zoomOutScale
      TweenMax.to(pixiObjects.panContainer.position, 3, {
        x: this.width / 2,
        y: this.height / 2,
        ease: Sine.easeInOut,
      });
      this.clearStrokeCircle()
      this.selectedNode = null
    },
    clearAll(){
      console.log("[Graph] clearAll") 
      this.setDataObject({
        nodes: [],
        links: []
      })
      this.resetPixiPosScale()
    },
    //移動到特定節點
    moveTo(id,drawCircle=true){
      console.log("[Graph] moveTo",id)
      let targetNode = this.nodes.find(node=>node.id==id)
      console.log(targetNode)
      if (targetNode){

        drawCircle && this.drawStrokeCircle(targetNode.id)
        if (targetNode !== this.selectedNode){
          // this.selectedNode=null
          // this.$nextTick(()=>{
          //   this.selectedNode = targetNode
          // })
          this.selectedNode = targetNode
        }
      }else{
        console.log("targetNode not found", id)
      }
    },
    resetPixiPosScale(){
      this.setDirectScalePixi(this.zoomOutScale)
      this.setDirectPositionPixi(this.width/2,this.height/2)
    },
    //直接設定pixi縮放比例
    setDirectScalePixi(scale){
      let {zoomContainer} = pixiObjects
      zoomContainer.scale.x = scale
      zoomContainer.scale.y = scale
      this.scale = scale
    },
    //直接設定pixi位置
    setDirectPositionPixi(x,y){
      let {panContainer} = pixiObjects
      panContainer.position.x = x
      panContainer.position.y = y
    }
  },
  watch: {
    //監測比例進行縮放
    scale(scaleVal,prevScaleVal){
      let {zoomContainer} = pixiObjects
      console.log("[Watcher] Scale change to:", scaleVal)
      if ( this.scaleAnimation )  this.scaleAnimation.kill() 
      zoomContainer.pivot.x = 0.5;
      zoomContainer.pivot.y = 0.5;
      this.scaleAnimation = TweenMax.to(zoomContainer.scale, 3, {
        x: scaleVal,
        y: scaleVal,
        overwrite: true,
        ease: Power1.easeInOut,
      })
    },
    selectedNode(currentNode, prevNode) {
      if (!currentNode) return 
      let previousIsNull = !!prevNode 

      this.$nextTick(()=>{
        // 顯示病毒sprite
        this.nodes.forEach(node => {
          if (node.depth == 2) {
            if (
              currentNode.group != node.group &&
              node.spriteMalware.alpha != 0
            ) {
              TweenMax.to(node.spriteMalware, 1, {
                alpha: 0,
                delay: 0,
              });
            }

            if (currentNode.group == node.group) {
              TweenMax.to(node.spriteMalware, 1, {
                alpha: 1,
                delay: 2,
              });
            }
          }
        });

        //移動到特定位置
        TweenMax.to(pixiObjects.panContainer.position, 5, {
          x: -currentNode.x + this.width / 2,
          y: -currentNode.y + this.height / 2,
          ease: Power2.easeInOut,
        });

        
        if (this.scale>0.6){
          this.scale = previousIsNull?0.8:0.6
          setTimeout(()=>{
            this.scale=1
          },3000)
        }else{
          this.scale=1
        }

      })
      // //縮放
      // tl.to(pixiObjects.zoomContainer.scale, 2, {
      //   x: 0.6,
      //   y: 0.6,
      //   ease: Power1.easeInOut,
      // }).to(pixiObjects.zoomContainer.scale, 2, {
      //   x: 1,
      //   y: 1,
      //   ease: Power1.easeInOut,
      // });
    },
  },
};
</script>

<style lang="sass" scoped src="./styles.sass"></style>
