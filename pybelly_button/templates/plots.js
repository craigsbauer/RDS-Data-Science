function init() {
  var names=[];
  var otu=[];
  var sample_metadata=[];
  var sample_wfreq=[];
  var sample_otu=[];

function init(initsample){
  
 d3.json('/names', function(error, response) {names=response});
  d3.json('/otu', function(error, response) {otu=response});
  d3.json('/metadata/'+initsample, function(error, response) {sample_metadata=response});
  d3.json('/wfreq/'+initsample, function(error, response) {sample_wfreq=response});
  d3.json('/samples/'+initsample, function(error, response) {sample_otu=response});

  var data = [{
    values: ['/otu'],
    labels: ['/names'],
    type: 'pie'
  }];
  
  var layout = {
'/names'    height: 600,
    width: 800
  };

  Plotly.plot("pie", data, layout);
}

function updatePlotly(newdata) {
  var PIE = document.getElementById("pie");
  Plotly.restyle(PIE, "values", [newdata]);
}

function getData(dataset) {
  var data = [];
  switch (dataset) {
 
  }
  updatePlotly(data);
}

init();