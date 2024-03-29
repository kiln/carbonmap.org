var carbonmap_data = {};
var carbonmap_data_description = {};
var carbonmap_values = {};
var carbonmap_rank = {};
var carbonmap_shading = {};
var carbonmap_data_loaded = false;
var carbonmap_timer;
var carbonmap_text;

var lang = "en";

var LANGUAGES = {
    "en": "English",
    "de": "Deutsch",
    "fa": "فارسی",
    "fr": "Français",
    "pt": "Português",
    "es": "Español",
    "sk": "Slovenčina"
};
var DATASETS = [
	// Maps
	"Area",
	"Population",
	"GDP",

	"Extraction",
	"Emissions",
	"PetersEmissions",
	"Consumption",
	"Historical",
	"Reserves",

	"PeopleAtRisk",
	"SeaLevel",
	"Poverty",

	// Shading
	"EmissionsChange",
	"CO2perCapita",
	"GDPperCapita",
	"PopulationGrowth"
];

var TIMELINE = {
    "en": [
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
    ],

    "de": [
        [7.5, "Area"],

        [20, "Population"],
        [23, "GDP"],

        [36, "Extraction"],
        [40, "Emissions"],
        [43, "Consumption"],
        [47.5, "Historical"],
        [53, "Reserves"],

        [63, "PeopleAtRisk"],

        [81, "_raw"],
        [91, "PopulationGrowth"],

        [101, "Emissions"],
        [112, "PeopleAtRisk"],

        [122, "_raw"],
        [122, "Continents"]
    ],

    "fa": [
        [8, "Area"],
        [26, "Population"],
        [31, "GDP"],

        [42, "Extraction"],
        [45, "Emissions"],
        [50, "Consumption"],
        [58, "Historical"],
        [66, "Reserves"],

        [75, "PeopleAtRisk"],

        [90, "_raw"],
        [101, "PopulationGrowth"],

        [117, "Emissions"],
        [123, "PeopleAtRisk"],

        [130, "_raw"],
        [133, "Continents"]
    ],

    "fr": [
        [10, "Area"],
        [20.5, "Population"],
        [24.5, "GDP"],

        [39, "Extraction"],
        [42.5, "Emissions"],
        [45.5, "Consumption"],
        [52, "Historical"],
        [59, "Reserves"],

        [71, "PeopleAtRisk"],

        [83, "_raw"],
        [94, "PopulationGrowth"],

        [103, "Emissions"],

        [114, "PeopleAtRisk"],

        [124, "_raw"],
        [125, "Continents"]
    ],

    "pt": [
        [8, "Area"],
        [18, "Population"],
        [21, "GDP"],

        [32.69, "Extraction"],
        [35.35, "Emissions"],
        [36.62, "Consumption"],
        [41, "Historical"],
        [47.54, "Reserves"],

        [65, "PeopleAtRisk"],

        [70, "_raw"],
        [78, "PopulationGrowth"],

        [86.62, "Emissions"],
        [96.65, "PeopleAtRisk"],

        [109.39, "_raw"],
        [109.39, "Continents"]
    ],

    "es": [
        [8, "Area"],
        [18, "Population"],
        [21, "GDP"],

        [32, "Extraction"],
        [36, "Emissions"],
        [38, "Consumption"],
        [43, "Historical"],
        [47, "Reserves"],

        [65, "PeopleAtRisk"],

        [70, "_raw"],
        [78, "PopulationGrowth"],

        [88, "Emissions"],
        [97, "PeopleAtRisk"],

        [108, "_raw"],
        [108, "Continents"]
    ],

    "sk": [
        [7, "Area"],
        [15.5, "Population"],
        [17.5, "GDP"],

        [31, "Extraction"],
        [32.5, "Emissions"],
        [34, "Consumption"],
        [38, "Historical"],
        [43, "Reserves"],

        [51, "PeopleAtRisk"],

        [60, "_raw"],
        [63, "PopulationGrowth"],

        [72, "Emissions"],
        [81, "PeopleAtRisk"],

        [92, "_raw"],
        [92, "Continents"]
    ]
};

$(function() {

    // Query string parameters
    var parameters = {};
    (function (query, re, match) {
        while (match = re.exec(query)) {
            parameters[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
    })(window.location.search.substring(1).replace(/\+/g, "%20"), /([^&=]+)=?([^&]*)/g);

    // Hide header row if required
    if (parameters.header == "hidden") {
        $("#masthead").hide();
    }

    // Set language if specified
    if (parameters.lang && parameters.lang in LANGUAGES) {
        lang = parameters.lang;
    }

    // After three seconds, show a "loading" ticker
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

    initLanguage();
    loadAsync("data.js?v=201409230944");
});

function initLanguage() {
    $("body").addClass("lang-" + lang);

    $("#current-language").html(LANGUAGES[lang]);
    $("#lang-menu").on("click", function() { $("#menu-container").toggle(); });
    $(".language").on("click", function() {
        window.location = "?lang=" + $(this).attr("data-target");
    });

    var audio = $('<audio id="intro-track"></audio>');
    audio.append('<source type="audio/ogg">').attr("src", "intro-" + lang + ".ogg");
    audio.append('<source type="audio/mpeg">').attr("src", "intro-" + lang + ".mp3");
    $("#play-intro-inner").append(audio);

    // Spanish has a translated sources page
    if (lang == "es") $("#sources-link a").attr("href", "http://www.carbonmap.org/sources-es.html");

    $.get("text.json?v=202009021631", textLoaded);
}

var data_loaded = false, text_loaded = false;
function carbonmapDataLoaded() {    // Called from data.js
    data_loaded = true;
    if (data_loaded && text_loaded) init();
}

function textLoaded(text) {
   carbonmap_text = text[lang];
   $(".text").each(function() {
       this.innerHTML = carbonmap_text[this.getAttribute("data-id")];
   });

    for (var i=0; i<DATASETS.length; i++) {
        var dataset = DATASETS[i];
        carbonmap_data_description[dataset] = carbonmap_text["desc_" + dataset];
        carbonmap_data_unit[dataset] = processTemplatedText(carbonmap_data_unit[dataset]);
    }

    var url = "http://www.carbonmap.org";
    if (lang != "en") url += "/?lang=" + lang;
    $("#twittershare a").attr("data-lang", lang).attr("data-text", carbonmap_text.tweet).attr("data-url", url);
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

    text_loaded = true;
    if (data_loaded && text_loaded) init();
}

function processTemplatedText(text) {
    return text.replace(/\{\{((?:[^\}]|\}[^\}])+)\}\}/g, function(m, id) {
        return carbonmap_text[id];
    });
}

function init() {
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
    window.track = track;

    // Add the countries to the map
    var map = document.getElementById("map");
    var current_path_by_country = {};
    for (var country in carbonmap_data._raw) {
        if (!carbonmap_data._raw.hasOwnProperty(country)) continue;
        if (country.charAt(0) === "_") continue;
        var path_data = carbonmap_data._raw[country];
        if (!path_data) continue;

        var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        e.id = country;
        e.setAttribute("class", "country");
        e.setAttribute("d", path_data);
        current_path_by_country[country] = path_data;
        map.appendChild(e);
    }
    $("#map-placeholder").hide();

    var _val = function(value, unit) {
        if (typeof value === "undefined") {
            return carbonmap_text.no_data;
        }

        if (unit === "people" && typeof value == "string") {
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
            describe_rank = carbonmap_text.rank_vh;
        else if (ile < 0.20)
            describe_rank = carbonmap_text.rank_h;
        else if (ile < 0.80)
            describe_rank = carbonmap_text.rank_m;
        else if (ile < 0.95)
            describe_rank = carbonmap_text.rank_l;
        else
            describe_rank = carbonmap_text.rank_vl;

        return carbonmap_text.rank + ": " + describe_rank + " (" + rank + "/" + count[dataset] + ")"
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
            $("#selectedcountrydataresult2").html(carbonmap_text.choose);
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

            for (var k in data) {
                if (!data.hasOwnProperty(k)) continue;

                var country_path = document.getElementById(k);
                var new_path = data[k];
                if (country_path != null) {
                    var country = country_path.id;
                    var original_path = current_path_by_country[country];
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
        }, animation_millis/frames);
    };

    var setDataset = function(new_dataset) {
        dataset = new_dataset;
        if (dataset in carbonmap_data) {
            var data = carbonmap_data[dataset];

            // Highlight the selected tab
            $(".navitemsselected").removeClass("navitemsselected");
            $("#nav-" + dataset).addClass("navitemsselected");

            // Update the explanatory text
            $("#about").html(carbonmap_text[dataset == "_raw" ? "map_text_Reset" : "map_text_" + dataset]);

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
            fakeAnimation(data);
        }
    };

    var play_button_in_middle = true;
    function relocatePlayButton(delay, duration) {
        $("#play-intro")
            .delay(delay)
            .animate({
            "position": "absolute",
            "top": "0%",
            "right": "0%",
            "width": "120px",
            "height": "120px",
            "margin-top": "10px",
            "margin-right": "50px"
        }, duration);
        play_button_in_middle = false;
    }

    function playIntro() {
        track.play();
        $("#pause-icon").show();
        $("#play-icon").hide();
        if (play_button_in_middle) relocatePlayButton(3000, 1000);
    }

    var handleHashChange = function() {

        if (location.hash === "#intro") {
            setDataset("_raw");

            // If we’re here, the audio is almost certainly already playing,
            // but in the case where someone uses the Back button to go back
            // to the intro it’s nice to resume automatically
            playIntro();

            // Similarly we reset the "welcome" condition, so the audio controls
            // are visible in the sidebar
            $(".unwelcome").hide();
            $(".welcome").show();
            welcome = true;

            return;
        }
        else if (play_button_in_middle) relocatePlayButton(0, 500);

        // If someone clicks a tab while the intro is running, pause it.
        if (Modernizr.audio) pauseIntro();

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
    };
    window.addEventListener("hashchange", handleHashChange, false);

    // Check the hash on initial load as well.
    if (location.hash) {
        handleHashChange();
    }
    else {
        $("#about").html(carbonmap_text.map_text_Reset);
    }

    // Shading dropdown
    $("#shadedropdown").change(function() {
        shading = $(this).val();
        $("#maparea").attr("class", "shading-" + shading);
        var legendbox = $("#legendbox").html("");
        legendbox.html($("<div id='legenddesc'>" + carbonmap_text["map_text_" + shading] + "</div>"));
        var shading_key = carbonmap_shading[shading];
        for (var i=0; i < shading_key.length; i++) {
            legendbox.append(
                $("<div class='legendrow'></div>")
                .append($("<div class='legendswatch'></div>").css("background", shading_key[i][0]))
                .append($("<div class='legendtext'></div>").text(processTemplatedText(shading_key[i][1])))
            );
        }
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
            $("#selectedcountryname").text(carbonmap_text["country_" + this.id]);
            if (!something_previously_selected) {
                $("#infoareaunselected").hide();
                $("#selectedcountryinfo").show();
            }
            update_infobox(this);
        }

        return false;
    });

    function pauseIntro() {
        track.pause();
        $("#pause-icon").hide();
        $("#play-icon").show();
    }

    // Initially there isn't a country selected
    $("#selectedcountryinfo").hide();
    $("#infoareaunselected").show();

    if (Modernizr.audio) {
        // Audio intro
        var track_animations = TIMELINE[lang];
        track.addEventListener("timeupdate", function() {
            // We want to do this part even if paused
            $("#talkie-player-segment")
                .attr("d", function() {
                    var dot_radius = 50;
                    var p = track.currentTime/track.duration;
                    var s = "M 0 0 v [r]";
                    if (p > 0.5) s += " A [r] [r] 0 0 1 0 -[r]";
                    s += " A [r] [r] 0 0 1 [x] [y] z";

                    s = s.replace(/\[r\]/g, dot_radius);
                    s = s.replace(/\[x\]/g, -dot_radius * Math.sin(2 * Math.PI * p));
                    s = s.replace(/\[y\]/g, dot_radius * Math.cos(2 * Math.PI * p));

                    return s
                });

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
            $("#pause-icon").hide();
            $("#play-icon").show();
        }, false);
        $("#play-intro #talkie-player-inner").click(function() {
            if (track.paused) playIntro();
            else pauseIntro();
        });
        var pt = map.createSVGPoint(),
            scrubbing = false;
        $("#play-intro #talkie-player-outer")
            .on("mousedown", function() { scrubbing = true; return false; })
            .on("mousedown mousemove", function(ev) {
                if (!scrubbing) return;
                var bbox = this.getBBox();
                pt.x = ev.clientX;
                pt.y = ev.clientY;
                pt = pt.matrixTransform(this.getScreenCTM().inverse());
                var x = pt.x - bbox.width/2,
                    y = pt.y - bbox.height/2;
                    theta = Math.PI/2 + Math.atan2(y, x);
                while (theta < 0) theta += Math.PI * 2;
                var t = track.duration * theta / (Math.PI*2);
                track.currentTime = t;
            });
        $(document).on("mouseup mouseleave", function() { scrubbing = false; })
    }
}
