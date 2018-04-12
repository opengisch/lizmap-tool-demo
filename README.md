# lizmap-tool-demo


## Tutorial

### Configure Lizmap

- Create docker-compose.yml

- Create directories `local-data` and `projects`

- Create `.gitignore`

- Created in QGIS a simple project with 2 layers (triangles and rectangles) with some random features

- Run with `docker-compose up`

- Have a look at http://localhost:9980/

- Create directory `projects/media/js/demo` (same name as the project)

### Create a minidock

- Create file `demoTool.js` with a minidock

```js
lizMap.events.on({
    uicreated: function(e) {

        lizMap.addDock(
            'demoTool',
            'Demo Tool',
            'minidock',
            '<div id="divDemoTool" class="lizmapPopupDiv">Click on a point of the map...</div>',
            'icon-wrench'
        );
  }
});
```
icons: http://www.bootstrapicons.com/index.htm?version=2.3.1

### Disable default Lizmap info tool
When our minidock is open.

So we add into the lizmap event 'slot'

```js
  minidockopened: function (e) {
    if(e.id == 'demoTool') {

      // Deactivate lizmap's feature info tool
      lizMap.controls['featureInfo'].deactivate();
    }
  },

  minidockclosed: function (e) {
    if(e.id == 'demoTool') {

      // Re-activate lizmap's feature info tool
      lizMap.controls['featureInfo'].activate();

    }
  }

```

### Get the info of the clicked point

We use Openlayers (TODO what's openalyers and link to examples of OL2)

```js

var fiurl = OpenLayers.Util.urlAppend(lizUrls.wms,
    OpenLayers.Util.getParameterString(lizUrls.params)
);

var tolerances = {
    'FI_POINT_TOLERANCE': 1,
    'FI_LINE_TOLERANCE': 1,
    'FI_POLYGON_TOLERANCE': 1
};

var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
  url: fiurl,
  title: 'Identify features by clicking',
  queryVisible: false,
  maxFeatures: 1,
  infoFormat: 'text/xml',
  vendorParams: tolerances,
  type: OpenLayers.Control.TYPE_TOOL,
  eventListeners: {
    getfeatureinfo: function(event) {


      var mediaLink = OpenLayers.Util.urlAppend(lizUrls.media, OpenLayers.Util.getParameterString(lizUrls.params));
      var demoToolSrc = mediaLink +'&path=/media/js/demo/demoToolDialog.html';

      // Load demoToolDialog.html and when finished execute the rest
      $("#divDemoTool").load(demoToolSrc, function(){

        if (window.DOMParser)
        {
          parser = new DOMParser();
          xmlDoc = parser.parseFromString(event.text, "text/xml");
        }
        else // Old versions of Internet Explorer
        {
          xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = false;
          xmlDoc.loadXML(event.text);
        }

        var layers = xmlDoc.getElementsByTagName("Layer");

        for (var i = 0; i < layers.length; i++){
          if(layers[i].getAttribute("name")=="triangles") {
            var attributes = layers[i].getElementsByTagName("Attribute");
            for (var j = 0; j < attributes.length; j++) {
              if (attributes[j].getAttribute("name") == "value"){
                document.getElementById("triangle_value").innerHTML = attributes[j].getAttribute("value");
              }
            }
          }

          if(layers[i].getAttribute("name")=="rectangles") {
            var attributes = layers[i].getElementsByTagName("Attribute");
            for (var j = 0; j < attributes.length; j++) {
              if (attributes[j].getAttribute("name") == "value"){
                document.getElementById("rectangle_value").innerHTML = attributes[j].getAttribute("value");
              }
            }
          }
        }
      });
    }
  }
});





lizMap.events.on({
  uicreated: function(e) {
    lizMap.addDock(
      'demoTool',
      'Demo Tool',
      'minidock',
      '<div id="divDemoTool" class="lizmapPopupDiv">Click on a point of the map...</div>',
      'icon-wrench'
    );
  },

  minidockopened: function (e) {
    if(e.id == 'demoTool') {

      lizMap.map.addControl(featureInfo);
      featureInfo.activate();

      // Deactivate lizmap's feature info tool
      lizMap.controls['featureInfo'].deactivate();
    }
  },

  minidockclosed: function (e) {
    if(e.id == 'demoTool') {

      // Re-activate lizmap's feature info tool
      lizMap.controls['featureInfo'].activate();

    }
  }

});
```

### Show the clicked point

```js

var fiurl = OpenLayers.Util.urlAppend(lizUrls.wms,
    OpenLayers.Util.getParameterString(lizUrls.params)
);

var tolerances = {
    'FI_POINT_TOLERANCE': 1,
    'FI_LINE_TOLERANCE': 1,
    'FI_POLYGON_TOLERANCE': 1
};

var markersLayer = new OpenLayers.Layer.Markers( "Markers" );
var marker;

var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
  url: fiurl,
  title: 'Identify features by clicking',
  queryVisible: false,
  maxFeatures: 1,
  infoFormat: 'text/xml',
  vendorParams: tolerances,
  type: OpenLayers.Control.TYPE_TOOL,
  eventListeners: {
    getfeatureinfo: function(event) {


      var mediaLink = OpenLayers.Util.urlAppend(lizUrls.media, OpenLayers.Util.getParameterString(lizUrls.params));
      var demoToolSrc = mediaLink +'&path=/media/js/demo/demoToolDialog.html';

      // Load demoToolDialog.html and when finished execute the rest
      $("#divDemoTool").load(demoToolSrc, function(){

        if (window.DOMParser)
        {
          parser = new DOMParser();
          xmlDoc = parser.parseFromString(event.text, "text/xml");
        }
        else // Old versions of Internet Explorer
        {
          xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = false;
          xmlDoc.loadXML(event.text);
        }

        if(marker){
            markersLayer.removeMarker(marker);
        }

        var position = lizMap.map.getLonLatFromPixel(event.xy);
        var size = new OpenLayers.Size(25,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);

        var markerIcon = mediaLink + '&path=media/js/demo/marker.png';
        var icon = new OpenLayers.Icon(markerIcon, size, offset);
        marker = new OpenLayers.Marker(position, icon);
        markersLayer.addMarker(marker);

        var layers = xmlDoc.getElementsByTagName("Layer");

        for (var i = 0; i < layers.length; i++){
          if(layers[i].getAttribute("name")=="triangles") {
            var attributes = layers[i].getElementsByTagName("Attribute");
            for (var j = 0; j < attributes.length; j++) {
              if (attributes[j].getAttribute("name") == "value"){
                document.getElementById("triangle_value").innerHTML = attributes[j].getAttribute("value");
              }
            }
          }

          if(layers[i].getAttribute("name")=="rectangles") {
            var attributes = layers[i].getElementsByTagName("Attribute");
            for (var j = 0; j < attributes.length; j++) {
              if (attributes[j].getAttribute("name") == "value"){
                document.getElementById("rectangle_value").innerHTML = attributes[j].getAttribute("value");
              }
            }
          }
        }
      });
    }
  }
});





lizMap.events.on({
  uicreated: function(e) {
    lizMap.addDock(
      'demoTool',
      'Demo Tool',
      'minidock',
      '<div id="divDemoTool"></div>',
      'icon-wrench'
    );
  },

  minidockopened: function (e) {
    if(e.id == 'demoTool') {

      $("#divDemoTool").html('<div id="divDemoTool" class="lizmapPopupDiv">Click a point on the map...</div>')

      lizMap.map.addControl(featureInfo);
      featureInfo.activate();

      lizMap.map.addLayer(markersLayer);

      // Deactivate lizmap's feature info tool
      lizMap.controls['featureInfo'].deactivate();
    }
  },

  minidockclosed: function (e) {
    if(e.id == 'demoTool') {

      if(marker){
          markersLayer.removeMarker(marker);
      }
      lizMap.map.removeLayer(markersLayer);

      // Re-activate lizmap's feature info tool
      lizMap.controls['featureInfo'].activate();

    }
  }

});
```
