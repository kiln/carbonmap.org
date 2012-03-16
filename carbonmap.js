$(function() {
    
    // If the browser does not support HTML audio, skip the intro.
    // I’m not sure there actually are any browsers that support
    // SMIL but not HTML audio, but if there are we’re ready for them!
    var welcome = Modernizr.audio;
    if (welcome) {
        $(".unwelcome").hide();
    }
    else {
        $("#play-intro").hide();
        $(".welcome").hide();
    }
    
    var track = document.getElementById("intro-track");

    var dataset;
    var shading = "Continents";
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

    var setDataset = function(new_dataset) {
        dataset = new_dataset;
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
    };

    $(window).hashchange(function() {
        // The big overlaid Play button should only be shown on the default no-hash view
        $("#play-intro").hide();
        
        if (location.hash === "#intro") {
            setDataset("_raw");
            
            // If we’re here, the audio is almost certainly already playing,
            // but in the case where someone uses the Back button to go back
            // to the intro it’s nice to resume automatically
            track.play();
            
            // Similarly we reset the "welcome" condition, so the audio controls
            // are visible in the sidebar
            $(".unwelcome").hide();
            $(".welcome").show();
            welcome = true;
            
            return;
        }
        
        // If someone clicks a tab while the intro is running, pause it.
        track.pause();

        // If this is the first time a nav link has been clicked,
        // replace the Welcome sidebar with a data sidebar.
        if (welcome) {
            $(".welcome").hide();
            $(".unwelcome").show();
            welcome = false;
        }

        // Which menu item was chosen?
        if (location.hash && location.hash != "#") {
            setDataset(location.hash.substr(1));
        }
        else {
            setDataset("_raw");
        }
    });

    // Check the hash on initial load as well.
    if (location.hash) {
        $(window).hashchange();
    }
    else {
        $("#about").html(carbonmap_data._raw._text);
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
    
    
    // Audio intro
    var track_animations = [
        [8, "Area"],
        [14, "Population"],
        [15.5, "GDP"],
        
        [25.5, "Extraction"],
        [27.5, "Emissions"],
        [29.5, "Consumption"],
        [34, "Historical"],
        [36, "Reserves"],
        
        [46, "PeopleAtRisk"],
        
        [56, "_raw"],
        [57, "PopulationGrowth"],
        
        [64, "Emissions"],
        [71, "PeopleAtRisk"]
    ];
    track.addEventListener("timeupdate", function() {
        if (track.paused) return;
        
        //console.log(this.currentTime); // Handy for quickly eyeballing timecodes
        var new_dataset = "";
        var new_shading = "Continents";
        for (var i = 0; i < track_animations.length; i++) {
            if (track_animations[i][0] > this.currentTime)
                break;
            if (track_animations[i][1] in carbonmap_shading)
                new_shading = track_animations[i][1];
            else
                new_dataset = track_animations[i][1];
        }
        if (new_shading !== shading)
            $("#shadedropdown").val(new_shading).change();
        if (new_dataset !== dataset) {
            setDataset(new_dataset);
        }
    });
    track.addEventListener("play", function() {
        document.location.hash = "#intro";
    });
    track.addEventListener("ended", function() {
        document.location.hash = "#";
    });
    $("#play-intro").click(function() {
        track.play();
    });
});
