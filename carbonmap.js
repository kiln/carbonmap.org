$(function() {
  var welcome = true;
  $(".unwelcome").hide();

  $(window).hashchange(function() {
    // If this is the first time a nav link has been clicked,
    // replace the Welcome sidebar with a data sidebar.
    //
    // XXXX This should be map-specific.
    if (welcome) {
      $(".welcome").hide();
      $(".unwelcome").show();
      welcome = false;
    }
    
    // Which menu item was chosen?
    var dataset = location.hash.substr(1);
    if (dataset in carbonmap_data) {
      var data = carbonmap_data[dataset];
      
      // Highlight the selected tab
      $(".navitemsselected").removeClass("navitemsselected");
      $("#nav-" + dataset).addClass("navitemsselected");
      
      // Update the explanatory text
      $("#about").html(data._text);
      
      // Animate the map to the chosen configuration
      for (var k in data) {
          if (!data.hasOwnProperty(k)) continue;
          
          var country_path = document.getElementById(k);
          var new_path = data[k];
          if (country_path != null) {
              var animate_element = document.createElementNS("http://www.w3.org/2000/svg", "animate");
              
              animate_element.setAttribute("dur", "1s");
              animate_element.setAttribute("attributeName", "d");
              animate_element.setAttribute("to", new_path);
              animate_element.setAttribute("begin", "indefinite");
              animate_element.setAttribute("fill", "freeze");
              
              $(country_path).find("animate").not(":last").remove();
              country_path.appendChild(animate_element);
              animate_element.beginElement();
          }
      }
    }
  });
  
  // Check the hash on initial load as well.
  if (location.hash) {
    $(window).hashchange();
  }
  
  $("#shadedropdown").change(function() {
    var shading = $(this).val();
    if (shading == "cc") {
      $("#maparea").addClass("cc");
    }
    else {
      $("#maparea").removeClass("cc");
    }
  });
});
