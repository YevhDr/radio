/**
 * Created by yevheniia on 11.02.19.
 */

var fill = d3.scale.ordinal()
    .range(['#b20000','yellow','#8c5754','#c3c3c3','#0977f6','#fcc980','#adeda6','#db656b','#4cb69c','#d372d9','#53a424','#a26fdc'])
    .domain(["rock", "r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic"]);


var audio = document.getElementById("audio");
var playPause = document.getElementById("playPause");
var playPauseMob = document.getElementById("playPause-mob");


playPause.addEventListener("click", playmusic);
playPauseMob.addEventListener("click", playmusicmob);

function playmusic() {
    // start music
    if (audio.paused) {
        audio.play();
        playPause.src = "img/pause.svg";
    } else {
        audio.pause();
        playPause.src = "img/play.svg";

    }
}

function playmusicmob() {
    // start music
    if (audio.paused) {
        audio.play();
        playPauseMob.src = "img/pause.svg";
    } else {
        audio.pause();
        playPauseMob.src = "img/play.svg";

    }
}

//сортуємо по заданим параметрам.... здається не працює
var sexOrder = [ "інша", "жіноча", "мікс", "чоловіча"];
var styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
var regionOrder = [ "", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
var languageOrder = [ "", "дивна", "немає", "особлива лірика", "російська","англійська", "українська"];

d3.csv('data/joinedDataAll.csv', function (error, data) {


    var width = window.innerWidth * 0.8;


    var height;
    if(window.innerWidth > 700) {
        height = window.innerHeight* 0.9;
    } else {
        height = window.innerHeight* 1.2;
    }


    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);


    for (var j = 0; j < data.length; j++) {
        data[j].radius = 5;
        data[j].x = Math.random() * width;
        data[j].y = Math.random() * height;
    }

    var padding;
    if(window.innerWidth > 700) {
        padding = 12
    } else {
        padding = 6
    }


    var maxRadius = 20;

    var uniqueID = [];

    var dataUnique = _.uniq(data, function(group) { return group.group; });

    dataUnique.forEach(function(d) {
        uniqueID.push(d.id)
    });

    console.log(uniqueID);

    var double = data.filter(function(d){
        if(!uniqueID.includes(d.id)){
            return d.id;
        }
    });

    var excludeId = [];
    double.forEach(function(d) {
        excludeId.push(d.id)
    });

    console.log(excludeId);



    var getCenters = function (vname, size, df) {
        var centers, map;
        centers = _.uniq(_.pluck(df, vname)).map(function (d) {
            return { name: d, value: 1};
        });

        //якщо непарна кількість кластерів, додаємо пустий, щоб вирівняти грід
        var plusone = { name: "", value: 1};
        if(centers.length & 1){ centers.push(plusone)  }

        // while(centers.length != 12){
        //     centers.push(plusone)
        // }

         centers = _.sortBy(centers, function(obj){
            if(sexOrder.includes(obj.name)){
                return _.indexOf(sexOrder, obj.name);
            } if(languageOrder.includes(obj.name)){
                return _.indexOf(languageOrder, obj.name);
            } if(regionOrder.includes(obj.name)){
                return _.indexOf(regionOrder, obj.name);
            }
            if(styleOrder.includes(obj.name)){
                return _.indexOf(styleOrder, obj.name);
            }

        });

        map = d3.layout.treemap().size(size).ratio(1/1);
        map.nodes({ children: centers });
        return centers;
    };

    var nodes = svg.selectAll("circle")
        .data(data);


        nodes.enter().append("circle")
            .attr("class", "node")
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("id", function (d) {
                return d.id;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("r", function() {
                if(window.innerWidth > 700) {
                    return 6
                } else {
                    return 3
                }
            })
            .style("fill", function (d, i) {
                if (d.isaudio === "yes") {
                    return "white";
                } else {
                    return "#181818"
                }
            })
            .style("stroke", function (d, i) {
                return fill(d.style);
            })
            .style("stroke-width", function() {

                if(window.innerWidth > 700) {
                    return 6
                } else {
                    return 3
                }
            })
            .attr("data-tippy-content", function (d) {
                var linkColor = fill(d.style);
                return "<div id='myTooltip>' >" +
                    "<div id='album-picture'>" +
                    "<img style='width:100px;' src='" + d.image + "'/></div>" +
                    "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                    "Альбом: <b>" + d.album + "</b><br>" +
                    // "Стиль: <b>" + d.style + "</b><br>"+
                    "Стиль: <b>" + d.Selfdetermination + "</b><br>" +
                    "Місто:  <b>" + d.City + "</b><br> " +
                    "<a style='color:" + linkColor + "' href = '" + d.listen + "' target='_blank'>Перейти до альбому</a>" +
                    "</div>" +
                    "</div>"
            })
            .style("cursor", function (d, i) {
                if (d.isaudio === "yes") {
                    return "pointer";
                } else {
                    return false
                }
            })
            .on("click", function (d) {

                if (d.isaudio === "yes") {
                    $("audio").attr("src", function () {
                        return "sounds/" + d.audio

                    });
                    $("audio").get(0).play();
                    if (window.innerWidth > 800) {
                        $("#playPause").attr("src", "img/pause.svg");
                        $("#playing-album").attr("src", d.image);
                        $("#playing-song").html("<b>" + d.group + " </b> - " + d.album);
                    } else {
                        $("#playPause-mob").attr("src", "img/pause.svg");
                        $("#playing-album").attr("src", d.image);
                        $("#playing-song-mob").html("<b>" + d.group + " </b> - " + d.album);
                    }
                }
            })
            .on("mouseover", function (d) {
                console.log(d);
                d3.select(this).attr("r", 8);
                $("li.list").css("text-decoration", "none");
                var theStyle = d.style;
                theStyle = capitalize(theStyle);
                $("li.list:contains(" + theStyle + ")").css("text-decoration", "underline");


            })
            .on("mouseout", function (d) {
                d3.select(this).attr("r", 4)
                $("li.list").css("text-decoration", "none");
            });



    var force = d3.layout.force();

    draw('style');


    $(window).on("resize", function(d) {
        width = window.innerWidth * 0.9;
        height = window.innerHeight* 0.9;
        svg.attr("width", width).attr("height", height);
        var activeLi = $("button.active").attr('id');
        draw(activeLi)
    });


    $( "button" ).click(function() {
        draw(this.id);
    });

    function draw (varname) {
        var centers;
        if(varname === "region") {
            centers = getCenters(varname, [width, height], data);
            force.on("tick", tick(centers, varname, data));
            labels(centers);
            force.start();
            excludeId.forEach(function(id){ $("#"+id).css("display", "block"); });
        }
        if(varname === "aprize") {
            centers = getCenters(varname, [width, height], data);
            force.on("tick", tick(centers, varname, data));
            labels(centers);
            force.start();
            excludeId.forEach(function(id){ $("#"+id).css("display", "block"); });
            d3.select("#styleColorGuide").style("display", "block")
        }
        else {
            if(varname === "style") {
                d3.select("#styleColorGuide").style("display", "none")
            } else {
                d3.select("#styleColorGuide").style("display", "block")
            }

            centers = getCenters(varname, [width, height], dataUnique);
            force.on("tick", tick(centers, varname, dataUnique));
            labels(centers);
            force.start();
            excludeId.forEach(function(id){ $("#"+id).css("display", "none"); });
        }
    }

    function tick (centers, varname, df) {
        var foci = {};
        for (var i = 0; i < centers.length; i++) {
            foci[centers[i].name] = centers[i];
        }
        return function (e) {
            for (var i = 0; i < df.length; i++) {
                var o = df[i];
                var f = foci[o[varname]];
                o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
                o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
            }
            nodes.each(collide(0.3, df))
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        }
    }

    function labels (centers) {
        svg.selectAll(".label").remove();

        svg.selectAll(".label")
            .data(centers).enter().append("text")
            .attr("class", "label")
            .text(function (d) { return d.name })
            .attr("transform", function (d) {
                if(window.innerWidth > 700) {
                    return "translate(" + (d.x + (d.dx / 2) - 40) + ", " + (d.y + 60) + ")";
                } else {
                    return "translate(" + (d.x + (d.dx / 2) - 40) + ", " + (d.y + 20) + ")";
                }
            })
            .style("text-transform", "uppercase")
        ;
    }


    tippy(".node", {
        allowHTML:true,
        animateFill: false,
        interactive:true,
        hideOnClick: true,
        theme: 'width-200'
    });

    function collide(alpha, df) {
        var quadtree = d3.geom.quadtree(df);
        return function (d) {
            var r = d.radius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + padding;
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    excludeId.forEach(function(id){
        $("#"+id).css("display", "none");
    });
});



$("button").on("click", function(){
    $("button").removeClass("active");
    $(this).addClass("active");
});

setTimeout(function(){
    var svgRect = $("svg")[0].getBoundingClientRect();
    $("#styleColorGuide ").css("top", svgRect.top + 20);
}, 100);


function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}



