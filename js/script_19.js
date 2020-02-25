/**
 * Created by yevheniia on 11.02.19.
 */

$("a").attr("target", "_blank");
const audio = document.getElementById("audio");


//сортуємо по заданим параметрам.... здається не працює
const sexOrder = ["інша", "жіноча", "мікс", "чоловіча"];
const styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
const regionOrder = ["", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
const languageOrder = ["", "дивна", "немає", "специфічна", "російська", "англійська", "українська"];


const margin = {top: 0, right: 50, bottom: 50, left: 50};
const width = window.innerWidth * 0.8;
var height;
const padding = 10;
const r = 6;
 if(window.innerWidth > 1200){ height  = window.innerHeight * 0.85 } else { height  = window.innerHeight * 1.3 }


var svg = d3.select("#chart").append("svg")
   .attr("width", width)
   .attr("height", height)
    ;


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var force = d3.layout.force();


var render = function(df){
    var currentData = df;
    for (var j = 0; j < currentData.length; j++) {
        currentData[j].radius = r;
        currentData[j].x = Math.random() * width;
        currentData[j].y = Math.random() * height;
       }

        var dataUnique = _.uniq(currentData, function (group) {
            return group.album;
        });

        var newFill = d3.scale.ordinal()
            .range(['#b20000', 'yellow', '#8c5754', '#c3c3c3', '#0977f6', '#fcc980', '#adeda6', '#db656b', '#4cb69c', '#d372d9', '#53a424', '#a26fdc'])
            .domain(d3.map(dataUnique, function(d){return d.style;}));

        /* легенда по стилях */
        var styles = d3.map(dataUnique, function(d){return d.style;}).keys();
        d3.select("#styleColorGuide")
            .html("");

        d3.select("#styleColorGuide")
            .selectAll("li")
            .data(styles)
            .enter()
            .append("li")
            .text(function(d) { return d })
            .style("color", function(d) { return newFill(d) });

        var previousClickedValue;

        var circles = g.selectAll(".node").data(dataUnique);

        circles
            .enter()
            .append("path")
            .attr("class", "node");

        circles
            .attr("value", function(d) { return  d.style })
            .attr("id", function (d) { return d.id; })
            .attr('transform',function(d){ return "translate("+d.x+","+d.y+")"; })
            .attr("transform", "rotate(-90)")
            .style("stroke-width", 1)
            .style("fill", function(d) { return newFill(d.style); })
            .attr('d',  function(d){
                if(d.isaudio === "yes" || d.isaudio === "video") {
                    return "M0,-8 L10, 0 0,8Z";
                }
                else {
                    return "M0, 6 A 6, 6 0 1, 1 0, -6 A 6, 6 0 1, 1 0, 6Z"
                }
                })
            .attr("data-tippy-content", function (d) {
               var linkColor = newFill(d.style);
               return "<div id='myTooltip>' >" +
                   "<div id='album-picture'>" +
                   "<img style='width: 100px;' src='" + d.image + "'/></div>" +
                   "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                   "Альбом: <b>" + d.album + "</b><br>" +
                   "Стиль: <b>" + d.Selfdetermination + "</b><br>" +
                   "Місто:  <b>" + d.City + "</b><br> " +
                   "<a style='color:" + linkColor + "' href = '" + d.listen + "' target='_blank'>Перейти до альбому</a>" +
                   "</div>" +
                   "</div>"
           })
           .on("click", function (d) {
               $("audio").get(0).pause();
               var currentClickedId = d3.select(this).attr("id");
               var currentClickedValue = d3.select(this).attr("value");

               if (d.isaudio === "yes" || d.isaudio === "video") {

                   d3.selectAll(".node").attr('d',  function(d){
                       if (d.isaudio === "yes" || d.isaudio === "video") {
                           return "M0,-8 L10, 0 0,8Z";
                       }
                       else {
                           return "M0, 6 A 6, 6 0 1, 1 0, -6 A 6, 6 0 1, 1 0, 6Z";
                       }
                   });

                   //додаємо до обраного потрібні класи - "клікнутий та грає"
                   d3.select(this).attr("d", "M0,-15 L25, 0 0,15Z");

                   //перемикач між ютьюб файфремом і аудіо
                   if(d.year === "2019") {
                       $("audio").get(0).pause();
                       d3.select("#embed").attr("src", d.listen); //додаємо потрібне відео
                   } else {
                       d3.select("#embed").attr("src", "").style("display", "none");
                       $("audio").attr("src", "sounds/" + d.audio); //додаємо потрібне аудіо
                       $("audio").get(0).play();
                   }

                   //починаємо грати
                   d3.select("#playing-album").attr("src", d.image);
                   d3.select("#playing-song").html("<b>" + d.group + " - " + d.album + "</b> ").style("color", newFill(d.style));


                   //**********************************************************************************************
                   //оця штука якось перемальовуэ колайд, щоб збільшений кружечок вміщався???
                   var selectedCurrentNodes = d3.selectAll(".node[value = '" + currentClickedValue + "']"  );

                   var selectedPreviousNodes = d3.selectAll(".node[value = '" + previousClickedValue + "']");
                   for(var i = 0; i < selectedPreviousNodes.length; i++) {
                       selectedCurrentNodes.push(selectedPreviousNodes[i])
                   }

                   var activeLi = $("button.active").attr('id');
                   var newD = dataUnique;
                   for (var j = 0; j < newD.length; j++) {
                       if(newD[j].id === currentClickedId) {
                           newD[j].radius = r * 3;
                       }
                       else {
                           newD[j].radius = r;
                       }
                   }

                   var centers = getCenters(activeLi, [width, height], newD);
                   force.on("tick", tickRedraw(selectedCurrentNodes, centers, activeLi, newD));
                   force.start();
                   previousClickedValue = currentClickedValue;
               }

           })
           .on("mouseover", function (d) {
               d3.selectAll(".node").style("fill", function(d) { return newFill(d.style); });
               d3.select(this).style("fill", "white");

               $("li.list").css("text-decoration", "none");
               var theStyle = d.style;
               theStyle = capitalize(theStyle);
               $("li.list:contains(" + theStyle + ")").css("text-decoration", "underline");
           })
           .on("mouseout", function (d) {
               d3.selectAll(".node").style("fill", function(d) { return newFill(d.style); })
           });

       circles.exit().remove();

       tippy(".node", {
            allowHTML: true,
            animateFill: false,
            animation: "fade",
            interactive: true,
            hideOnClick: true,
            theme: 'width-200',
            onShow(tip) {
                tip.setContent(tip.reference.getAttribute('data-tippy-content'))
            }
       });

       var activeButton = $('.active').attr('id');
       draw(activeButton, dataUnique);

        $("button").click(function () {
            draw(this.id, dataUnique);
        });


    };

var renderMobile = function(df) {
    d3.select("#chart-mobile").html("");

    var activeButton = $('.active').attr('id');
    draw_mobile(activeButton, df);

    d3.selectAll("#toolbar > button").on("click", function () {
        draw_mobile(this.id, df);
    });

    tippy(".album", {
        allowHTML: true,
        animateFill: false,
        animation: "fade",
        interactive: true,
        hideOnClick: true,
        theme: 'width-200',
        onShow(tip) {
            tip.setContent(tip.reference.getAttribute('data-tippy-content'))
        }
    });
};



    d3.csv('data/random_18_19.csv', function (error, input) {
    
        var data = input.filter(function(d) {
            return d.year === "2018"
        });

        render(data);
        renderMobile(data);
    
    
        d3.selectAll(".select-year").on("click", function() {
            var selected_year = d3.select(this).text();
            if(selected_year === "2019") {
               d3.select("#sex").style("display", "none");
               d3.select("#embed").style("display", "block");
            } else {
                d3.select("#sex").style("display", "inline");
                d3.select("#embed").style("display", "node");
            }
            var newData = input.filter(function (d) {
                return d.year === selected_year
            });
    
            render(newData);
            renderMobile(newData);
        });
    });




    /* функція перемальовки при зміні вкладки*/
    function draw(varname, df) {
        var dataUnique = _.uniq(df, function (group) {
            return group.album;
        });
        var centers;
        var dataset = dataUnique;

        d3.selectAll(".node").each(function(k){
            d3.select(this).attr("value", k[varname])
        });
        d3.select("#styleColorGuide").style("opacity", varname === "style"? 0 : 1);
        centers = getCenters(varname, [width, height], dataset);
        force.on("tick", tick(centers, varname, dataset));
        labels(centers);
        force.start();
    }

    /* віжмальовка мобільних списків */

    function draw_mobile(varname, df){
        var newFill = d3.scale.ordinal()
            .range(['#b20000', 'yellow', '#8c5754', '#c3c3c3', '#0977f6', '#fcc980', '#adeda6', '#db656b', '#4cb69c', '#d372d9', '#53a424', '#a26fdc'])
            .domain(d3.map(df, function(d){return d.style;}));

        var prepared = d3.nest()
            .key(function(d) { return d[varname]; })
            .entries(df);

        d3.select("#chart-mobile").html("");

        var styleButton = d3.select("#chart-mobile")
            .selectAll("div")
            .data(prepared)
            .enter()
            .append("div")
            .attr("class", "cell")
            .attr("id", function(d) { return d.values[0].style });


        styleButton.append("h4")
            .attr("class", "category_button")
            .text(function(d){
                return d.key;
            })
            .style('background-color', function(d){
                if(varname === "style"){
                    return newFill(d.key)
                } else {
                    return "lightgrey"
                }
            })
            .style("color", "black")
            .style("width", "max-content")
            .style("padding", "10px");


        styleButton
            .selectAll("div")
            .data(function(d) {return d.values })
            .enter()
            .append("div")
            .attr("class", function(d) { return "tip album hidden " + d.style })
            .attr("data-tippy-content", function (d) {
                var linkColor = newFill(d.style);
                return "<div id='myTooltip>' >" +
                    "<div id='album-picture'>" +
                    "<img style='width: 100px;' src='" + d.image + "'/></div>" +
                    "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                    "Альбом: <b>" + d.album + "</b><br>" +
                    "Стиль: <b>" + d.Selfdetermination + "</b><br>" +
                    "Місто:  <b>" + d.City + "</b><br> " +
                    "<a style='color:" + linkColor + "' href = '" + d.listen + "' target='_blank'>Перейти до альбому</a>" +
                    "</div>" +
                    "</div>";
            })
            .style("display", "flex")
            .style("color", function(d){
                return newFill(d.style)
            })
            .html(function(d){
                if(d.isaudio === "yes") {
                    return "<img style='width: 20px; margin-right: 5px' src='img/play.svg'/><p style='pointer-events: none'>" + d.group + " - " + d.album + "</p> "
                } else {
                    return "<p style='margin-left: 25px'>" + d.group + " - " + d.album + "</p>"
                }
            })
            .on("click", function(d){
                if(d.isaudio === "yes") {
                    d3.select("audio").attr("src", function () { return "sounds/" + d.audio }); //додаємо потрібне аудіо
                    d3.select("audio > source").attr("src", function () { return "sounds/" + d.audio }); //додаємо потрібне аудіо
                    d3.select("#playing-song").html("<b>" + d.group + "</b> " + d.album); //додаємо назву пісні поруч з кліком

                    //починаємо грати
                    $("audio").get(0).play();
                    d3.select("#playing-album").attr("src", function(){ return d.image});
                    d3.select("#playing-song")
                        .style("color", newFill(d.style))
                        .html("Ви слухаєте: <b>" + d.group + " - " + d.album + "</b> ");
                }

            });

        d3.selectAll(".category_button").on("click", function(d){
            var selected = d3.select(this.parentNode).selectAll(".album");
            selected.each(function(){
                d3.select(this).classed("hidden", d3.select(this).classed("hidden") ? false : true)
            })
        });


        d3.selectAll(".cell").each(function(){
            d3.select(this).selectAll(".album").sort(function(a, b){
                return d3.ascending(a.style, b.style)
            })

        });
    }


    function tick(centers, varname, df) {
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
            d3.selectAll(".node")
                .each(collide(0.5, df))
                .attr('transform',function(d){ return "translate("+d.x+","+d.y+")"; });

                // .attr("cx", function (d) { return d.x; })
                // .attr("cy", function (d) { return d.y; });
        }
    }

    function tickRedraw(selection, centers, varname, df) {
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
            selection
                .each(collide(0.5, df))
                .attr('transform',function(tt){ return "translate("+tt.x+","+tt.y+")"; });

                // .attr("cx", function (tt) { return tt.x; })
                // .attr("cy", function (tt) { return tt.y; });
        }
    }

    function labels(centers) {
        g.selectAll(".label").remove();
        g.selectAll(".label")
            .data(centers).enter().append("text")
            .attr("class", "label")
            .text(function (d) {
                return d.name
            })
            .attr("transform", function (d) {
                return "translate(" + (d.x + (d.dx / 2) - 40) + ", " + (d.y + 20) + ")";
            })
            .style("text-transform", "uppercase");
    }

    function collide(alpha, df) {
        var quadtree = d3.geom.quadtree(df);
        return function (d) {
            var r = d.radius + 20 + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
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




/* активна вкладка */
$("#toolbar > button").on("click", function () {
    $("button").removeClass("active");
    $(this).addClass("active");
});


/* функція, що робить колайд*/
var getCenters = function (vname, size, df) {
    var centers, map;

   var counted_styles =  _.countBy(df, vname);

    centers = _.uniq(_.pluck(df, vname)).map(function (d, i) {
        //return { name: d, value: counted_styles[d] };
        return { name: d, value: 1 };
    });


    //якщо непарна кількість кластерів, додаємо пустий, щоб вирівняти грід
    var plusone = {name: "", value: 1};
    if (centers.length & 1) {
        centers.push(plusone)
    }

    centers = _.sortBy(centers, function (obj) {
        if (sexOrder.includes(obj.name)) {
            return _.indexOf(sexOrder, obj.name);
        }
        if (languageOrder.includes(obj.name)) {
            return _.indexOf(languageOrder, obj.name);
        }
        if (regionOrder.includes(obj.name)) {
            return _.indexOf(regionOrder, obj.name);
        }
        if (styleOrder.includes(obj.name)) {
            return _.indexOf(styleOrder, obj.name);
        }

    });

    map = d3.layout.treemap().size(size).padding(50).ratio(1 / 1);
    map.nodes({children: centers});
    return centers;
};


/* позиція легенди*/
setTimeout(function () {
    var parentPos = $('#graphics')[0].getBoundingClientRect(),
        childrenPos = $('#chart svg')[0].getBoundingClientRect(),
        relativePos = {};

    relativePos.top = childrenPos.top - parentPos.top,
        relativePos.right = childrenPos.right - parentPos.right,
        relativePos.bottom = childrenPos.bottom - parentPos.bottom,
        relativePos.left = childrenPos.left - parentPos.left;

    $("#styleColorGuide ").css("top", relativePos.top + 20);
}, 100);


function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}


d3.select("#stop-pause").on("click", function() {
    if(this.classList.contains('play-image')){
        d3.select(this).attr("class", "pause-image")
        $("audio").get(0).play();
    } else {
        d3.select(this).attr("class", "play-image")
        $("audio").get(0).pause();
    }


});



