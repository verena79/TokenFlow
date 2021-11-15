import TokenSimulationModule from 'bpmn-js-token-simulation';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import fileDrop from 'file-drops';

import exampleXML from '../ressources/exposee.bpmn';

import BpmnColorPickerModule from 'bpmn-js-color-picker';

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

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    TokenSimulationModule,
    ExampleModule,
    BpmnColorPickerModule
  ],
  keyboard: {
    bindTo: document
  }
});

const modeling = modeler.get('modeling');

modeler.openDiagram = function(diagram) {
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
    modeler.openDiagram(files[0].contents);
  }

}), false);


modeler.openDiagram(initialDiagram);
