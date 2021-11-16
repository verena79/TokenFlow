import TokenSimulationModule from 'bpmn-js-token-simulation/lib/viewer';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import fileDrop from 'file-drops';

import exampleXML from '../ressources/exposee.bpmn';

import html2canvas from 'html2canvas/dist/html2canvas'

const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
})();

function hideDropMessage() {
  const dropMessage = document.querySelector('.drop-message');

  dropMessage.style.display = 'none';
}

if (persistent) {
  hideDropMessage();
}

const ExampleModule = {
  __init__: [
    [ 'eventBus', 'bpmnjs', 'toggleMode', function(eventBus, bpmnjs, toggleMode) {

      if (persistent) {
        eventBus.on('commandStack.changed', function() {
          bpmnjs.saveXML().then(result => {
            localStorage['diagram-xml'] = result.xml;
          });
        });
      }

      /* if ('history' in window) {
        eventBus.on('tokenSimulation.toggleMode', event => {

          if (event.active) {
            url.searchParams.set('e', '1');
          } else {
            url.searchParams.delete('e');
          }

          history.replaceState({}, document.title, url.toString());
        });
      } */

      eventBus.on('diagram.init', 500, () => {
        toggleMode.toggleMode(active);
      });
    } ]
  ]
};

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    ExampleModule,
    TokenSimulationModule
  ],
  keyboard: {
    bindTo: document
  }
});

viewer.openDiagram = function(diagram) {
  return this.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      this.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });
};

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', function(files) {

  // files = [ { name, contents }, ... ]

  if (files.length) {
    hideDropMessage();
    viewer.openDiagram(files[0].contents);
  }

}), false);

viewer.openDiagram(initialDiagram);

viewer.DownloadBase64File = function(contentType, base64Data, fileName){
  const linkSource = `data:${contentType};base64,${base64Data}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
  }

document.getElementById('downloadBtn').addEventListener("click", function() {
  console.log('btn clicked')
  let c = document.getElementById('canvas');
  html2canvas(c).then((canvas)=>{
    var t = canvas.toDataURL().replace("data:image/png;base64,", "");
    viewer.DownloadBase64File('image/png',t,'image');
  })
});
