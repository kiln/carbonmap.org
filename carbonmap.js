$(function() {
    var welcome = true;
    $(".unwelcome").hide();

    var dataset;
    var shading;
    var update_infobox = function(selected_country) {
        if (typeof selected_country === "undefined") {
            var selected_countries = document.getElementsByClassName("selected-country");
            if (selected_countries) {
                selected_country = selected_countries[0];
            }
        }
        
        if (selected_country && dataset in carbonmap_values) {
            var data_value = carbonmap_values[dataset][selected_country.id];
            if (typeof data_value === "undefined") {
                $("#selectedcountrydataresult2").text("No data available");
            }
            else {
                $("#selectedcountrydataresult2").text(data_value + " " + carbonmap_data_unit[dataset]);
            }
            $("#selectedcountryrank2").html("");
        } else {
            $("#selectedcountrydataresult2").html("");
            $("#selectedcountryrank2").html("");
        }

        if (selected_country && shading in carbonmap_data_description) {
            $("#selectedcountrydatadescription3").text(carbonmap_data_description[shading]);
            $("#selectedcountrydataresult3").text(carbonmap_values[shading][selected_country.id] + " " + carbonmap_data_unit[shading]);
            $("#selectedcountryrank3").html("");
        } else {
            $("#selectedcountrydatadescription3").html("");
            $("#selectedcountrydataresult3").html("");
            $("#selectedcountryrank3").html("");
        }
    };

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
        dataset = "_raw";
        if (location.hash && location.hash != "#") {
            dataset = location.hash.substr(1);
        }
        if (dataset in carbonmap_data) {
            var data = carbonmap_data[dataset];

            // Highlight the selected tab
            $(".navitemsselected").removeClass("navitemsselected");
            $("#nav-" + dataset).addClass("navitemsselected");

            // Update the explanatory text
            $("#about").html(data._text);

            // Update the heading on the country data box
            if (dataset in carbonmap_data_description) {
                $("#selectedcountrydatadescription2").text(carbonmap_data_description[dataset]);
            }
            else {
                $("#selectedcountrydatadescription2").html("");
            }

            // Update the rest of the data box, if it’s visible
            update_infobox();

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

    // Shading dropdown
    $("#shadedropdown").change(function() {
        shading = $(this).val();
        $("#maparea").attr("class", "shading-" + shading);
        $("#legendbox").html(carbonmap_shading[shading]);
        update_infobox();
    }).change();

    $(document.getElementsByClassName("country")).click(function() {
    // XXXX for now we just hop out of welcome mode if someone clicks a country
    if (welcome) {
      $(".welcome").hide();
      $(".unwelcome").show();
      welcome = false;
    }

    var already_selected = (this.getAttribute("class") == "country selected-country");
    var something_previously_selected = false;
    $(document.getElementsByClassName("selected-country")).each(function() {
       this.setAttribute("class", "country");
       something_previously_selected = true;
    });
    if (already_selected) {
        $("#selectedcountryinfo").hide();
        $("#infoareaunselected").show();
    } else {
        this.setAttribute("class", "country selected-country");
        $("#selectedcountryname").text(carbonmap_data._names[this.id]);
        if (!something_previously_selected) {
            $("#infoareaunselected").hide();
            $("#selectedcountryinfo").show();
        }
        update_infobox(this);
    }

    return false;
    });

    // Initially there isn't a country selected
    $("#selectedcountryinfo").hide();
    $("#infoareaunselected").show();
});
