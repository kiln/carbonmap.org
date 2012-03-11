$(function() {
  var welcome = true;
  $(".unwelcome").hide();

  $(".navitems a").click(function() {
    
    // If this is the first time a nav link has been clicked,
    // replace the Welcome sidebar with a data sidebar.
    //
    // XXXX This should be map-specific.
    if (welcome) {
      $(".welcome").hide();
      $(".unwelcome").show();
      welcome = false;
    }
    
    // Highlight the selected tab
    $(".navitemsselected").removeClass("navitemsselected");
    $(this).parent().addClass("navitemsselected");
    
    // Which menu item was chosen?
    var href = $(this).attr("href");
    if (href.length > 1) {
      var data = carbonmap_data[href.substring(1)];
      
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
