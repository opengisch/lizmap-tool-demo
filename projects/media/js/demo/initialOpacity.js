lizMap.events.on({
  uicreated: function(e) {

    /* Add a line for each layer you want to set the initial opacity.
    Modify the layer name and the initial opacity level (allowed values are
    0.2, 0.4, 0.6, 0.8, 1.0)
    */
    lizMap.map.getLayersByName('triangles')[0].setOpacity(0.4);
    lizMap.map.getLayersByName('rectangles')[0].setOpacity(0.6);
  },

  'lizmapswitcheritemselected': function(evt){
    var layer = lizMap.map.getLayersByName(evt.name)[0];
    currentOpacity = layer.opacity * 100;

    // Trigger a click on the correct opacity button of the layer
    $('#sub-dock a.btn-opacity-layer').each(function(){
      if($(this).text()==currentOpacity.toString()){
        $(this).click();
      }
    });

  }
});
