/**
 * Created by yevheniia on 11.02.19.
 */
// d3.xml("data/maket_color2.svg").mimeType("image/svg+xml").get(function (error, xml) {
//     if (error) {
//         throw error
//     }
//
//     d3.select("#chart").node().appendChild(xml.documentElement);
//
// });
//
// setTimeout(function(){
//     d3.select("#filter-metal").on("click", function(d){
//         console.log(d);
//
//     var x = document.getElementById("metal");
//         if (x.style.display === "none") {
//             x.style.display = "block";
//         } else {
//             x.style.display = "none";
//         }
//         // d3.select("g#metal").toggle();
//     });
// }, 100);

// console.clear();
// var w = window.innerWidth * 0.9, h = 500;
//
// var radius = 6;
// var color = d3.scaleOrdinal(d3.schemeCategory20);
// var centerScale = d3.scalePoint().padding(1).range([50, w - 200]);
// // var forceStrength = 0.1;
//
// var svg = d3.select("body").append("svg")
//     .attr("width", w)
//     .attr("height", h);
//
// var circles_group = svg.append("g")
//     .attr("id", "circles_group")
//     .attr("transform", "translate(100, 0)");
//
// var center = {x: width / 2, y: height / 2};
// var forceStrength = 0.03;
//
//
//
// d3.csv("data/radio.csv", function(data){
//
//     var simulation = d3.forceSimulation()
//         .velocityDecay(0.2)
//         .force('x', d3.forceX().strength(forceStrength).x(center.x))
//         .force('y', d3.forceY().strength(forceStrength).y(center.y))
//         .force('charge', d3.forceManyBody().strength(charge))
//         .on('tick', ticked);
//     // .force("collide",d3.forceCollide( function(d){
//     //     return d.r + 8 }).iterations(16)
//     // )
//     // .force("charge", d3.forceManyBody())
//     // .force("y", d3.forceY().y(h / 2))
//     // .force("x", d3.forceX().x(w / 2));
//
//
//     data.forEach(function(d){
//         d.r = radius;
//         d.x = w / 2;
//         d.y = h / 2;
//     });
//
//     var circles = circles_group.selectAll("circle")
//         .data(data, function(d){ return d.id ;});
//
//     var circlesEnter = circles.enter().append("circle")
//         .attr("r", function(d, i){ return d.r; })
//         .attr("cx", function(d, i){ return 175 + 25 * i + 2 * i * 2; })
//         .attr("cy", function(d, i){ return 250; })
//         .style("fill", function(d, i){ return color(d.style); })
//         .style("stroke", function(d, i){ return color(d.style); })
//         .style("stroke-width", 10)
//         .style("pointer-events", "all")
//         .on("click", function(d) {
//             console.log(d.style)
//         });
//
//     circles = circles.merge(circlesEnter);
//
//     function charge(d) {
//         return -forceStrength * Math.pow(d.radius, 2.0);
//     }
//
//     function ticked() {
//         circles
//             .attr("cx", function(d){ return d.x; })
//             .attr("cy", function(d){ return d.y; });
//     }
//
//     simulation
//         .nodes(data)
//         .on("tick", ticked);
//
//
//     function groupBubbles() {
//         hideTitles();
//
//         // @v4 Reset the 'x' force to draw the bubbles to the center.
//         simulation.force('x', d3.forceX().strength(forceStrength).x(w / 3));
//
//         // @v4 We can reset the alpha value and restart the simulation
//         simulation.alpha(1).restart();
//     }
//
//     function splitBubbles(byVar) {
//
//         centerScale.domain(data.map(function(d){ return d[byVar]; }));
//
//         if(byVar == "all"){
//             hideTitles()
//         } else {
//             showTitles(byVar, centerScale);
//         }
//
//         // @v4 Reset the 'x' force to draw the bubbles to their year centers
//         simulation.force('x', d3.forceX().strength(forceStrength).x(function(d){
//             return centerScale(d[byVar]);
//         }));
//
//         // @v4 We can reset the alpha value and restart the simulation
//         simulation.alpha(2).restart();
//     }
//
//     function hideTitles() {
//         svg.selectAll('.title').remove();
//     }
//
//     function showTitles(byVar, scale) {
//         // Another way to do this would be to create
//         // the year texts once and then just hide them.
//         // var titles = titles_group.selectAll('.title')
//         //     .data(scale.domain());
//         //
//         // titles.enter().append('text')
//         //     .attr('class', 'title')
//         //     .merge(titles)
//         //     .attr('x', function (d) { return scale(d); })
//         //     .attr('y', 40)
//         //     .attr('text-anchor', 'middle')
//         //     .text(function (d) { return ' ' + d; });
//         //
//         // titles.exit().remove()
//
//         var titles = d3.select("#titles_group")
//             .selectAll('.title')
//             .data(scale.domain());
//
//         titles.enter().append('p')
//             .attr('class', 'title')
//             .merge(titles)
//             .attr('x', function (d) { return scale(d); })
//             .attr('y', 40)
//             .attr('text-anchor', 'middle')
//             .text(function (d) {
//                 console.log(d);
//                 return ' ' + d; })
//             .style("color", function(d){ return color(d); })
//             ;
//
//
//         titles.exit().remove()
//
//
//     }
//
//     d3.selectAll("button").on("click", function(d){
//         d3.select("#titles_group").remove();
//     });
//
//     function setupButtons() {
//         d3.selectAll('.button')
//             .on('click', function () {
//
//                 // Remove active class from all buttons
//                 d3.selectAll('.button').classed('active', false);
//                 // Find the button just clicked
//                 var button = d3.select(this);
//
//                 // Set it as the active button
//                 button.classed('active', true);
//
//                 // Get the id of the button
//                 var buttonId = button.attr('id');
//
//                 console.log(buttonId)
//                 // Toggle the bubble chart based on
//                 // the currently clicked button.
//                 splitBubbles(buttonId);
//             });
//     }
//
//     setupButtons()
//
// });
//


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
        // .style("fill", function (d) { return fill(d.style); })
        .style("fill", function(d, i){ return "#181818"; })
        .style("stroke", function(d, i){ return fill(d.style); })
        .style("stroke-width", 4)
        .attr("data-tippy-content", function (d) {
            return "<div id='myTooltip>' >" +
                "<div id='album-picture'>" +
                "<img style='width:100px;' src='"+ d.image+ "'/></div>" +
                "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                   "Альбом: <b>" + d.album + "</b><br>"+
                   // "Стиль: <b>" + d.style + "</b><br>"+
                   "Стиль: <b>" + d.Selfdetermination + "</b><br>"+
                   "Місто:  <b>" + d.City + "</b><br> " +
                   "<a href='" + d.listen + "' target='_blank'>Перейти до альбому</a>"+
                "</div>" +
                "</div>"
        })
        .on("click", function(d) {
            if(d.longList === "Long list"){
                $("audio").attr("src", "sounds/allOfMe.mp3")
                $("audio").get(0).play();


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
