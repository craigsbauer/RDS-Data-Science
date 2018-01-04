////////////////////////////////////////////////////////////////////////
window.onload = function() {
  // build the quake map!
  var options = {
    mapDivTag: 'map-canvas',
  };

  var eqMap = new LEAFLET_CUSTOM.d3EarthquakeMap(options)
                      .addESRIWorldImageryBaseMapLayer()
                      .addESRIOceanBaseMapLayer()
                      .addUSGSFaultsOverlay()
                      .addTectonicPlateBoundariesOverlay()
                      .addGeologicMapOverlay();
  
  // build a button and a click response for each view
  // (attached to a div with id='earthquake-view-list'
  quakeViews.forEach(function(v,i){
    // get the div that holds the earthquake buttons
    d3.select('#earthquake-view-list')
            .append('div')
            .attr('class',"panel panel-default")
              .append('div')
                .attr('class', "panel-heading")
                .attr('id', v.divId)
                .append("a")
                  .attr("href","#")
                  .text(v.params.label);
                

    d3.select('#earthquake-view-list')
                .append("p")
                  .style("padding-left","5px") 
                  .text(v.params.longlabel);

    d3.select('#earthquake-view-list')
                .append("hr");

    d3.select("#"+v.divId)
                .on('click', function()
                      {
                        d3.select('#events-title')
                            .text(v.params.label);
      
                        eqMap.setEarthquakeQuery(v.params);
                      }
                   );
    
    // trigger the earthquake query for the first view in the list
    if( i < 1){
      d3.select("#"+v.divId).on('click')();
    }
  });
};

///////////////////////////////////////////////////////////////////////////////
var LEAFLET_CUSTOM = LEAFLET_CUSTOM || {};

LEAFLET_CUSTOM.map = function(options) {
'use strict';

var mapDivTag = options.mapDivTag === undefined ? 'map' : options.mapDivTag
  // CREATE THE LEAFLET MAP
  , mapCenter = options.mapCenter === undefined ? [30.600, -103.300] : options.mapCenter
  , mapZoomLevel = options.mapZoomLevel === undefined ? 3.3 : options.mapZoomLevel
  , leafletmap = new L.map(mapDivTag, { minZoom: 3, maxZoom: 11 }) 
                  .setView(mapCenter,mapZoomLevel)
  , timeOut = null // timeout to prevent the map from updating on repeated resize events
  // create an empty layer control that we'll add components to
  , layerControl = L.control.layers({},{}).addTo(leafletmap)
  , renderCallback; // callback function to be defined by subclasses

// main update function to expose the API
function map() {
  if (timeOut !== null)
    clearTimeout(timeOut);
  
  timeOut = setTimeout(function(){
    if( renderCallback !== undefined ) {
      renderCallback();
    }
  }, 500);
}

// Base and Overlay Layer Options///////////////////////////////////////////////

//!!//##///
map.addESRIOceanBaseMapLayer = function() {
  var Esri_OceanBasemap =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
    attribution: '',
    maxZoom: 13
  }).addTo(leafletmap);
    
  layerControl.addBaseLayer(Esri_OceanBasemap,"Topographic");
  
  return map;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
map.addESRIWorldImageryBaseMapLayer = function() {
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: ''
  }).addTo(leafletmap);
  
  layerControl.addBaseLayer(Esri_WorldImagery,"Satelite");
  
  return map;
};


map.addUSGSFaultsOverlay = function() {
  // faults from USGS earthquakes hazards website
  var faults = L.tileLayer("https://earthquake.usgs.gov/basemap/tiles/faults/{z}/{x}/{y}.png", {
    attribution: "<a href=\"https://earthquake.usgs.gov/arcgis/rest/services/eq/map_faults/MapServer\"></a>",
    maxZoom: 13,
    opacity: 1.5,
  }).addTo(leafletmap);
  layerControl.addOverlay(faults,"US Fault Lines");
  
  return map;
};

map.addTectonicPlateBoundariesOverlay = function() {
  var plateBoundaries = L.tileLayer("https://earthquake.usgs.gov/basemap/tiles/plates/{z}/{x}/{y}.png", {
    attribution: "<a href=\"https://earthquake.usgs.gov/arcgis/rest/services/eq/map_faults/MapServer\"></a>",
    maxZoom: 13,
    opacity: 1.5,
  }).addTo(leafletmap);
  layerControl.addOverlay(plateBoundaries,"Global Fault Lines");
  
  return map;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

map.addCustomBaseMap = function(url,nameString,options) {
  // geology from Macrostrat.org 
  var custom = L.tileLayer(url,options);
  
  layerControl.addBaseLayer(custom,nameString);
  
  return map;
};

map.addCustomOverlay = function(url,nameString,options) {
  // geology from Macrostrat.org 
  var custom = L.tileLayer(url,options);
  
  layerControl.addOverlay(custom,nameString);
  
  return map;
};

// get/set the leaflet map
map.leafletmap = function(value) {
  if( !arguments.length ) return leafletmap;

  leafletmap = value;
  return map;
};

// get leaflet's layer control 
map.layerControl = function(value) {
  if( !arguments.length ) return layerControl;

  layerControl = value;
  return map;
};

// get/set the timeout 
map.timeout = function(value) {
  if( !arguments.length ) return timeout;

  timeout = value;
  return map;
};

// get/set the map center
map.mapCenter = function(value) {
  if( !arguments.length ) return mapCenter;

  mapCenter = value;
  if( leafletmap !== undefined ) {
    flyToView(mapCenter,mapZoomLevel);
  }
  return map;
};

map.mapZoomLevel = function(value) {
  if( !arguments.length ) return mapZoomLevel;

  mapZoomLevel = value;
  if( leafletmap !== undefined ) {
    flyToView(mapCenter,mapZoomLevel);
  }
  return map;
};

// sets the render callback function
map.renderCallBack = function(value) {
  if( !arguments.length ) return renderCallback;

  renderCallback = value;
  return map;
};


return map;
};

////////////////////////////////////////////////////////////////////////////////
/*!
 * Query to USGS earthquake API
 */
var QUERY = QUERY || {};
QUERY.usgs = (function(QUERY) {
    var baseURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query&format=geojson';

  QUERY.earthquakeURLMapBoundsJSON = function( params ) { 
    if( params.days < 1 )
      throw new TypeError({ fileName: "usgsQuery.js", message: "earthquakeURLMapBounds(params) - params.days must be greater than 1" });
    
    // undefined date sets current date/time for query
    var endtime = (params.date === undefined)
          ? new Date() 
          : new Date(params.date);

    var starttime = new Date(endtime.getTime() - params.days * 86400 * 1000 ); // convert days to seconds, seconds to milliseconds
    
    // set up an array of strings to form a query (will join later with ?'s)
    var query = [ baseURL ];
    
    query.push("starttime=" + starttime.toISOString() );
    query.push("endtime=" + endtime.toISOString() );
    
    if( params.leafletmap === undefined )
      throw new TypeError({ fileName: "usgsQuery.js", message: "earthquakeURLMapBounds(params) - params.leafletmap undefined" });

    var bnds = params.leafletmap.getBounds();
    
    var minLat = Math.min(bnds.getSouth(),bnds.getNorth());
    var maxLat = Math.max(bnds.getSouth(), bnds.getNorth());
    var minLong = Math.min(bnds.getEast(), bnds.getWest());
    var maxLong = Math.max(bnds.getEast(), bnds.getWest());
    query.push("minlatitude=" + minLat );
    query.push("maxlatitude=" + maxLat ); 
    query.push("minlongitude=" + minLong ); 
    query.push("maxlongitude=" + maxLong ); 
    query.push("eventtype=" + params.eventType);
    
    query.push("orderby=time-asc"); // order in time ascending
    
    return query.join("&");
  };

  return QUERY;

})(QUERY || {});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var LEAFLET_CUSTOM = LEAFLET_CUSTOM || {};

LEAFLET_CUSTOM.d3EarthquakeMap = function(options) {
    var map = LEAFLET_CUSTOM.map(options) // build the parent map
                       .renderCallBack(renderEarthquakes)// and set the parent's callback function
                                             // to this class's "render" function
    // usgs earthquake API query
    , qparams =  { label: "Earthquakes in the last 7 Days", center: [100.991341, -115.782354],
                    zoom: 7, days: 1, date: undefined, eventType: "earthquake", leafletmap: map.leafletmap() }
    , svg // save a selection for the svg within the map
    , path // used to collect the bounding box, in svg space, of objects on the map
    , popupDiv // div to attach a popup to display earthquake info
    
    // color scale for the earthquakes at 6-levels 
    , eqDomain = [0, 1, 2, 3, 4, 5]
    , eqColorScale = d3.scaleLinear()
                         .domain(eqDomain)
                         .range(['#42f471','#6bf441',
                               '#bef441','#f1f441',
                               '#f4bb41','#f44641',
                                ])
    // size scale for earthquakes
    , eqSizeScale = d3.scaleLinear()
                      .domain(eqDomain)
                      .range([2,4,6,8,10,12]);
  // build the map
  init();
  
  map.setEarthquakeQuery = function(d) {
    
    // set earthquake parameters
    qparams = d;
    // add the leaflet map to the parameters to query the view bounds
    qparams.leafletmap = map.leafletmap();
    
    // set the leaflet map's zoom and center to initiate the flyTo
    map.mapCenter(d.center)
       .mapZoomLevel(d.zoom);
    
    return map;
  };
 

  function init() {
    //  create a d3.geo.path to convert GeoJSON to SVG 
    var transform = d3.geoTransform({point: projectPoint});
    path = d3.geoPath().projection(transform);

    // leaflet's functions to convert from lat/long to points in the map
    function projectPoint(x, y) {
       var point = map.leafletmap().latLngToLayerPoint(new L.LatLng(y, x));
       this.stream.point(point.x, point.y);
    }
    
    // APPEND the SVG to the Leaflet map pane
    svg = d3.select(map.leafletmap().getPanes().overlayPane).append("svg")
            .attr("class", "leaflet-zoom-hide");
    // g (group) element will be inside the svg, and will contain the earthquakes
    svg.append("g")
       .attr("class", "leaflet-zoom-hide");

    popupDiv = d3.selectAll(".leaflet-pane")
              .filter(".leaflet-popup-pane")
              .append("div")
              .attr("class","tooltip")
              .style("opacity", 0 );

    // add a magnitude legend to the bottom right control layer
    addMagnitudeLegend();

    // Setups animation
    map.leafletmap().on("movestart", removeEarthquakeCircles);
    map.leafletmap().on("moveend", map); 
   
    map();
  }
  
  function removeEarthquakeCircles() {
    var exit = svg.select("g")
        .selectAll("#earthquake-a").remove();
  }

  function renderEarthquakes() {

    removeEarthquakeCircles();

   // query JSON API
    var eqQuery = QUERY.usgs.earthquakeURLMapBoundsJSON(qparams);
    d3.json(eqQuery, function(err, json) {
     if (err) {
        throw err;
      }
      
      // Filter out any data with no geometry info 
      var earthquakes = json.features.filter(
        function(d) {
          return d.geometry !== null;
        }
      );
      
      if( earthquakes.length < 1 )
        return;
      
      // get the bounding box of all of the earthquakes in the selection
 
      var bounds = path.bounds(json);
      var svgPadding = d3.max(eqSizeScale.range()) * 20.00;  
      
      // get the top left and bottom right as [x,y] arrays,

      var topLeft = [ bounds[0][0] - svgPadding, bounds[0][1] - svgPadding ] 
        , bottomRight = [ bounds[1][0] + svgPadding, bounds[1][1] + svgPadding ]
      
      // set the width, height, top, and left of the svg to position it
      svg.attr("width", bottomRight[0] - topLeft[0] )
        .attr("height", bottomRight[1] - topLeft[1] )
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
      
      // add the new earthquake series
      svg.select("g")
        .selectAll("a")
          .data(earthquakes, function(d) { return d.id; })
        .enter()
          // append an <a> to provide a link upon click to the USGS url
          .append("a")
          // add the usgs link as an attribute
          .attr("xlink:href", function(d) { return d.properties.url; })
          // open link in new window
          .attr("target","_blank")
          .attr("id","earthquake-a")
          .append("circle")
          // here we translate LOCALLY within the svg, and, of course, we have to add the padding value to
          .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")")
          .attr("class", "earthquake")
          .attr("cx", function(d) {
                        var ll = L.latLng(d.geometry.coordinates[1],d.geometry.coordinates[0]);
                        d.x = map.leafletmap().latLngToLayerPoint(ll).x;
                        return d.x; })
          .attr("cy", function(d) {
                        var ll = L.latLng(d.geometry.coordinates[1],d.geometry.coordinates[0]);
                        d.y = map.leafletmap().latLngToLayerPoint(ll).y;
                        return d.y; })
          .attr("r", 0)
          .on("mouseover", function(d) {		
              popupDiv.transition()		
                  .duration(200)		
                  .style("opacity", .75);		
              popupDiv.html("Magnitude: <strong>" + d.properties.mag + "</strong><br/>"
                        + "Place: <strong>" + d.properties.place + "</strong><br/>"
                        + "(click circle for URL)" )	
                       .style("left", (d.x+5) + "px")
                       .style("top", (d.y-10) + "px");	
              })					
          .on("mouseout", function(d) {		
              popupDiv.transition()		
                  .duration(500)		
                  .style("opacity", 0);
              })
          .transition()
          .duration(500)
          .delay(function(d,i){ return 200*i; })
          .ease(d3.easeElastic)
          .attr("r", function(d) {
                return eqSizeScale(d.properties.mag);
              }) 
          .style("fill", function(d) {
                  return eqColorScale(d.properties.mag);
              });
      });      
  }
  
  // builds a magnitude legend on top of a legend SVG
  function addMagnitudeLegend()
  {
    // create a list of objects representing a legend entry
    // so we can add x,y coordinates to each object and apply text
    var legendObjs = [];
    eqDomain.forEach(function(d,i) {
       legendObjs[i] = { mag: d };
    });
    
    // some sizing and location info (in px)
    var lNodeSize = 40;
    var lPadding = 5;
    var legendWidth = (legendObjs.length * (lNodeSize + 1));
    var legendHeight = lNodeSize * 1.5;
    var lTopLeft = [lPadding, 0]; 
    var lBottomRight = [lTopLeft[0] + legendWidth, lTopLeft[1] + legendHeight]; 

    // use d3 to select the appropriate div element on the control layer
    var lSvg = d3.select(".leaflet-control-container")
                    // selects "leaflet-bottom leaflet-left" AND "leaflet-bottom leaflet-right"
                    .selectAll(".leaflet-bottom")
                    // filter the selection by ONLY the leaflet-left
                    .filter(".leaflet-left")
                    // add an svg to the bottom left control element
                    .append("svg")
                  // size the element width to the size of the earthquake legend
                  .attr("width", lBottomRight[0] - lTopLeft[0] + 2*lPadding +"px")
                  .attr("height", lBottomRight[1] - lTopLeft[1] + 3*lPadding + "px");
  
    // g (group) element will be inside the legend svg, and will contain 
    var lG = lSvg.append("g");

    // append the data and get the enter selection
    var lnodes = lG.append("svg:g")
        .selectAll("g") 
        .data(legendObjs, function(d,i){ return d.mag; })
        .enter();
            

    // append the text to each "svg:g" node, which also contains a circle
    lnodes.append("text")
          .text(function(d) { return "M"+d.mag; })
          .attr("id", "eq-legend")
          .attr("class", "legend-mag-text")
          .attr("text-anchor", "middle" )
          // the transform here contains an offset from the
          // middle of the g element, which is also the middle of the circle
          .attr("transform", function(d) {
                                  return "translate("
                                     + d.x + ","
                                     + (d.y-15) + ")"; });
  }

  return map;
  
};
