/**
 * Created by yevheniia on 11.02.19.
 */

var audio = document.getElementById("audio");
var playPause = document.getElementById("playPause");

playPause.addEventListener("click", playmusic);

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

d3.csv('data/joinedData.csv', function (error, data) {


    var width = window.innerWidth * 0.9, height = window.innerHeight* 0.9;
    var fill = d3.scale.ordinal()
        .range(['#f0595a','yellow','#8c5754','#c3c3c3','#0977f6','#fcc980','#adeda6','#db656b','#4cb69c','#d372d9','#53a424','#a26fdc'])
        .domain(["rock", "r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic"]);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);


    for (var j = 0; j < data.length; j++) {
        data[j].radius = 5;
        data[j].x = Math.random() * width;
        data[j].y = Math.random() * height;
    }

    var padding = 5;
    var maxRadius = 20;

    var getCenters = function (vname, size) {
        var centers, map;
        centers = _.uniq(_.pluck(data, vname)).map(function (d) {
            return { name: d, value: 1};
        });



        //якщо непарна кількість кластерів, додаємо пустий, щоб вирівняти грід
        var plusone = { name: "", value: 1};
        if(centers.length & 1){

            centers.push(plusone)
        }



        //сортуємо по заданим параметрам.... здається не працює
        var sexOrder = [ "інша", "жіноча", "мікс", "чоловіча"];
        var styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
        var regionOrder = [ "", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
        var languageOrder = [ "", "дивна", "немає", "російська","англійська", "українська"];


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

        map = d3.layout.treemap()
            .size(size)
            .ratio(1/1);
        map.nodes({
            children: centers
        });

        return centers;
    };

    var nodes = svg.selectAll("circle")
        .data(data);

    nodes.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r",4)
        .style("fill", function(d, i){
            if(d.longList === "Long list"){
                return "white";
            } else {
                return "#181818"
            }
        })
        .style("stroke", function(d, i){ return fill(d.style); })
        .style("stroke-width", 4)
        .attr("data-tippy-content", function (d) {
            var linkColor = fill(d.style);
            return "<div id='myTooltip>' >" +
                "<div id='album-picture'>" +
                "<img style='width:100px;' src='"+ d.image+ "'/></div>" +
                "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                   "Альбом: <b>" + d.album + "</b><br>"+
                   // "Стиль: <b>" + d.style + "</b><br>"+
                   "Стиль: <b>" + d.Selfdetermination + "</b><br>"+
                   "Місто:  <b>" + d.City + "</b><br> " +
                   "<a style='color:" + linkColor + "' href = '" + d.listen + "' target='_blank'>Перейти до альбому</a>"+
                "</div>" +
                "</div>"
        })
        .style("cursor", function(d, i){
            if(d.longList === "Long list"){
                return "pointer";
            } else {
                return false
            }
        })
        .on("click", function(d) {

            if(d.longList === "Long list"){
                $("audio").attr("src", "sounds/allOfMe.mp3");
                $("audio").get(0).play();
                $("#playPause").attr("src", "img/pause.svg");
                $("#playing-album").attr("src", d.image);
                $("#playing-song").html("<b>" + d.group + " </b> - " + d.album );

            } else {
                // $("audio").attr("src", "sounds/valery.mp3")
                // $("audio").get(0).play();
            }

        })
        .on("mouseover", function (d) { d3.select(this).attr("r", 8)    })
        .on("mouseout", function (d) { d3.select(this).attr("r", 4)  });


    var force = d3.layout.force();

    draw('style');


    $(window).on("resize", function(d) {
        width = window.innerWidth * 0.9;
        height = window.innerHeight* 0.9;
        svg.attr("width", width).attr("height", height);
        draw("style")
    });


    $( "button" ).click(function() {
        draw(this.id);
    });

    function draw (varname) {
        var centers = getCenters(varname, [width, height]);
        force.on("tick", tick(centers, varname));
        labels(centers);
        force.start();
    }

    function tick (centers, varname) {
        var foci = {};
        for (var i = 0; i < centers.length; i++) {
            foci[centers[i].name] = centers[i];
        }
        return function (e) {
            for (var i = 0; i < data.length; i++) {
                var o = data[i];
                var f = foci[o[varname]];
                o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
                o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
            }
            nodes.each(collide(0.3))
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
                return "translate(" + (d.x + (d.dx / 2) - 40) + ", " + (d.y + 20) + ")";
            })
            .style("text-transform", "uppercase")
        ;
    }


    tippy(".node", {
        allowHTML:true,
        animateFill: false,
        interactive:true,
        // trigger: "click",
        hideOnClick: true,
        theme: 'width-200'
        // maxWidth:300
    });

    function collide(alpha) {
        var quadtree = d3.geom.quadtree(data);
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
});



$("button").on("click", function(){
    $("button").removeClass("active");
    $(this).addClass("active");
});
