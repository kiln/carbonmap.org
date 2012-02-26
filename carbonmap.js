$(function() {
  $(".navitems a").click(function() {
    var href = $(this).attr("href");
    if (href.length > 1) {
      var data = carbonmap_data[href.substring(1)];
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
});
