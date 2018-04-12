
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
