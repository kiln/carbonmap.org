var carbonmap_data = {};
var carbonmap_values = {};
var carbonmap_rank = {};
var carbonmap_shading = {};
var carbonmap_data_loaded = false;
var carbonmap_timer;

$(function() {

    // After five seconds, show a "loading" ticker
    carbonmap_timer = setTimeout(function() {
        carbonmap_timer = null;
        $("#loading").show();
    }, 3000);

    var loadAsync = function(js_file) {
        (function() {
            var d=document,
            h=d.getElementsByTagName('head')[0],
            s=d.createElement('script');
            s.type='text/javascript';
            s.async=true;
            s.src=js_file;
            h.appendChild(s);
        })();
    };

    loadAsync("data.js?v=20121213");
});

function carbonmapDataLoaded() {
    if (carbonmap_timer) clearTimeout(carbonmap_timer);
    $("#loading").hide();
    
    // If the browser does not support HTML audio, skip the intro.
    var welcome = Modernizr.audio;
    if (welcome) {
        $("#play-intro").show();
        $(".welcome").show();
    }
    else {
        $("#play-intro").hide();
        $(".unwelcome").show();
    }
    
    var track = document.getElementById("intro-track");
    
    // Add the countries to the map
    var map = document.getElementById("map");
    var current_path_by_country = {}; // Only used if !Modernizr.smil
    for (var country in carbonmap_data._raw) {
        if (!carbonmap_data._raw.hasOwnProperty(country)) continue;
        if (country.charAt(0) === "_") continue;
        var path_data = carbonmap_data._raw[country];
        if (!path_data) continue;
        
        var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        e.id = country;
        e.setAttribute("class", "country");
        e.setAttribute("d", path_data);
        if (!Modernizr.smil) {
            current_path_by_country[country] = path_data;
        }
        map.appendChild(e);
    }
    $("#map-placeholder").hide();
    
    var _val = function(value, unit) {
        if (typeof value === "undefined") {
            return "No data available";
        }
        
        if (unit === "people") {
            value = value.replace(/\.[0-9]$/, ""); // Fractional people read strangely
        }
        return value + " " + unit;
    };
    
    var count = {};
    var _rank = function(dataset, key) {
        var rank = carbonmap_rank[dataset][key];
        if (typeof rank === "undefined") return "";
        if (!(dataset in count)) {
            count[dataset] = 0;
            for (var x in carbonmap_rank[dataset]) {
                if (carbonmap_rank[dataset].hasOwnProperty(x))
                    ++ count[dataset];
            }
        }
        
        var ile = (parseInt(rank) - 1) / count[dataset];
        var describe_rank;
        if (ile < 0.05)
            describe_rank = "Very low";
        else if (ile < 0.20)
            describe_rank = "Low";
        else if (ile < 0.80)
            describe_rank = "Medium";
        else if (ile < 0.95)
            describe_rank = "High";
        else
            describe_rank = "Very high";
        
        return "Rank: " + describe_rank + " (" + rank + "/" + count[dataset] + ")"
    };

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
            $("#selectedcountrydataresult2").text(_val(data_value, carbonmap_data_unit[dataset]));
            $("#selectedcountryrank2").text(_rank(dataset, selected_country.id));
        } else {
            $("#selectedcountrydataresult2").html("Choose a topic above the map to see data here");
            $("#selectedcountryrank2").html("");
        }

        if (selected_country && shading in carbonmap_data_description) {
            $("#selectedcountrydatadescription3").text(carbonmap_data_description[shading]);
            $("#selectedcountrydataresult3").text(_val(carbonmap_values[shading][selected_country.id], carbonmap_data_unit[shading]));
            $("#selectedcountryrank3").text(_rank(shading, selected_country.id));
        } else {
            $("#selectedcountrydatadescription3").html("");
            $("#selectedcountrydataresult3").html("");
            $("#selectedcountryrank3").html("");
        }
    };
    
    var timer = null;
    var frames = 24;
    var animation_millis = 1000;
    
    var fakeAnimation = function(data) {
        if (timer != null) {
            clearInterval(timer);
        }
        
        var start_time = new Date().getTime();
        timer = setInterval(function() {
            var elapsed_millis = new Date().getTime() - start_time;
            var x = Math.min(1, elapsed_millis / animation_millis);
            
            if (elapsed_millis >= animation_millis) {
                clearInterval(timer);
                timer = null
            }
            
            showFrame(current_path_by_country, data, x);
        }, animation_millis/frames);
    };
    
    var showFrame = function(old_data, new_data, x) {
        for (var k in new_data) {
            if (!new_data.hasOwnProperty(k)) continue;
            
            var country_path = document.getElementById(k);
            var new_path = new_data[k];
            if (country_path != null) {
                var country = country_path.id;
                var original_path = old_data[country];
                var original_path_els = original_path.split(" ");
                var new_path_els = new_path.split(" ");
                
                var intermediate_path_els = [];
                for (var j = 0; j < original_path_els.length; j++) {
                    var a = parseInt(original_path_els[j]), b = parseInt(new_path_els[j]);
                    if (isNaN(a)) {
                        intermediate_path_els[j] = original_path_els[j];
                    }
                    else {
                        intermediate_path_els[j] = Math.round( (1-x) * a + x * b );
                    }
                }
                var intermediate_path = intermediate_path_els.join(" ");
                country_path.setAttribute("d", intermediate_path);
                current_path_by_country[country] = intermediate_path;
            }
        }
    };

    var setDataset = function(new_dataset, do_not_animate) {
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
            if (do_not_animate) {
                // Do not animate
            }
            else if (Modernizr.smil) {
                var animate_elements = [];
                var redundant_animate_elements = $();
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

                        var existing_animate_elements = country_path.getElementsByTagName("animate");
                        if (existing_animate_elements.length > 4) {
                            redundant_animate_elements = redundant_animate_elements.add(
                                existing_animate_elements[1]);
                        }
                        country_path.appendChild(animate_element);
                        animate_elements.push(animate_element);
                    }
                }
                for (var i=0; i < animate_elements.length; i++)
                    animate_elements[i].beginElement();
                redundant_animate_elements.remove();
            }
            else {
                // Fake the animation for browsers that don’t support SMIL
                // (I’m looking at you, IE 9)
                fakeAnimation(data);
            }
        }
    };

    var handleHashChange = function() {
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
        if (Modernizr.audio) track.pause();

        // If this is the first time a nav link has been clicked,
        // replace the Welcome sidebar with a data sidebar.
        if (welcome) {
            $(".welcome").hide();
            $(".unwelcome").show();
            welcome = false;
        }

        // Which menu item was chosen?
        if (location.hash && location.hash != "#") {
            var selector = location.hash.substr(1);
            var selector_parts = selector.split("/");
            if (selector_parts.length == 1) {
                setDataset(selector);
            }
            else {
                var animate_elements = document.getElementsByTagName("animate");
                while (animate_elements.length > 0) {
                    var e = animate_elements.item();
                    e.parentNode.removeChild(e);
                }
                setDataset(selector_parts[0], true);
                showFrame(
                    carbonmap_data[selector_parts[1]], carbonmap_data[selector_parts[0]],
                    parseFloat(selector_parts[2])
                );
            }
        }
        else {
            setDataset("_raw");
        }
    };
    window.addEventListener("hashchange", handleHashChange, false);

    // Check the hash on initial load as well.
    if (location.hash) {
        handleHashChange();
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
        // Hop out of welcome mode if someone clicks a country, unless the intro is playing
        if (welcome && track.paused) {
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
    
    if (Modernizr.audio) {
        // Audio intro
        var track_animations = [
            [6.5, "Area"],
            [12.5, "Population"],
            [15.5, "GDP"],
        
            [25.5, "Extraction"],
            [27.5, "Emissions"],
            [29.5, "Consumption"],
            [33, "Historical"],
            [37, "Reserves"],
        
            [46, "PeopleAtRisk"],
        
            [53, "_raw"],
            [57, "PopulationGrowth"],
        
            [64, "Emissions"],
            [71, "PeopleAtRisk"],

            [78, "_raw"],
            [78, "Continents"]
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
        }, false);
        track.addEventListener("play", function() {
            document.location.hash = "#intro";
        }, false);
        track.addEventListener("ended", function() {
            if (shading !== "Continents") {
                $("#shadedropdown").val("Continents").change();
            }
            document.location.hash = "#";
        }, false);
        $("#play-intro").click(function() {
            track.play();
        });
    }
}