/**
 * Created by yevheniia on 11.02.19.
 */

$("a").attr("target", "_blank");



var audio = document.getElementById("audio");

//сортуємо по заданим параметрам.... здається не працює
var sexOrder = ["інша", "жіноча", "мікс", "чоловіча"];
var styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
var regionOrder = ["", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
var languageOrder = ["", "дивна", "немає", "специфічна", "російська", "англійська", "українська"];
var r = 6;

var width =  1500;
var height =  1000;
var padding = 10;

// if (window.innerWidth > 700) { width = window.innerWidth * 0.85 } else { width = window.innerWidth * 0.9}
// if (window.innerWidth > 1200) { height = window.innerHeight ; } else {  height = window.innerHeight * 3; }
// if (window.innerWidth >= 1400) { padding = 15 } else if(window.innerWidth < 1400 && window.innerWidth > 700) { padding = 10 } else { padding = 10 }

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}


var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var svg = d3.select("#chart").append("svg")
    .attr("viewBox", "0 0  "  + width + " " + height)
    .call(zoom);
    // .attr("width", width)
    // .attr("height", height)


var g = svg.append("g");

var force = d3.layout.force();


var render = function(df){

    var currentData = df;

    for (var j = 0; j < currentData.length; j++) {
        currentData[j].radius = 5;
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
            .append("circle")
            .attr("class", "node");

        circles
            .attr("value", function(d) { return  d.style })
            .attr("cx", function (d) { return d.x; })
            .attr("id", function (d) { return d.id; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", 5)
            .style("stroke-width", 5)
            .style("fill",  function(p) { return p.isaudio === "yes"? "white": "#181818" })
            .style("stroke", function(d) { return newFill(d.style); })
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
               var currentClickedId = d3.select(this).attr("id");
               console.log(currentClickedId);
               var currentClickedValue = d3.select(this).attr("value");
               console.log(currentClickedValue);

               // d3.select(this).attr("r", 20);

               //якщо цей кружечок вже клікнутий, то нам потрібна пауза:
               if(this.classList.contains('played')){
                   audio.pause();
                   d3.select(this)
                       .style("fill", function() { return window.innerWidth >= 1400 ? "url(#playimage)":"url(#playimage-sm)" })
                       .attr("class", "node clicked paused");
               }

               //якщо цей кружечок вже клікнутий і натиснута пауза:
               else if(this.classList.contains('paused')) {
                   audio.play();
                   d3.select(this)
                       .style("fill",  function() { return window.innerWidth >= 1400 ? "url(#pauseimage)":"url(#pauseimage-sm)" })
                       .attr("class", "node clicked played");
               }

               //якщо кружечок клікається вперше:
               else {
                   if (d.isaudio === "yes") {

                       //прибираємо в усіх кружечков будь-які зайві класи
                       d3.selectAll(".node").attr("class", "node");

                       //повертаємо усім кружечкам неактивну заливку, обводку і ширину обводки
                       d3.selectAll(".node")
                           .style("fill", function(p) { return p.isaudio === "yes" ? "white" : "#181818" })
                           .attr("r", r);

                       //додаємо до обраного потрібні класи - "клікнутий та грає"
                       d3.select(this).attr("class", "node clicked played");

                       //міняємо фонову картинку кнопки
                       d3.select(this)
                           .style("fill", function() { return window.innerWidth >= 1400?"url(#pauseimage)":"url(#pauseimage-sm)" })
                           .style("stroke-width", '3px');

                       $("audio").attr("src", function () { return "sounds/" + d.audio }); //додаємо потрібне аудіо
                       d3.select("#playing-song").html("<b>" + d.group + "</b> " + d.album); //додаємо назву пісні поруч з кліком
                       d3.select(this).attr("r", function() { return window.innerWidth >= 1400 ? 20 : 15 });  //збільшуємо радіус клікнутого


                       //оця штука якось перемальовуэ колайд, щоб збільшений кружечок вміщався???
                       var selectedCurrentNodes = d3.selectAll(".node[value = '" + currentClickedValue + "']"  );

                       var selectedPreviousNodes = d3.selectAll(".node[value = '" + previousClickedValue + "']");
                       for(var i = 0; i < selectedPreviousNodes.length; i++) {
                           selectedCurrentNodes.push(selectedPreviousNodes[i])
                       }

                      var activeLi = $("button.active").attr('id');
                      console.log(activeLi);


                       var newD = dataUnique;

                       for (var j = 0; j < newD.length; j++) {
                           if(newD[j].id === currentClickedId) {
                               newD[j].radius = 15;
                           }
                           else {
                               newD[j].radius = 5;
                           }
                       }

                       var centers = getCenters(activeLi, [width, height], newD);
                       force.on("tick", tickRedraw(selectedCurrentNodes, centers, activeLi, newD));
                       force.start();
                       previousClickedValue = currentClickedValue;

                       //починаємо грати
                       $("audio").get(0).play();
                       $("#playing-album").attr("src", d.image);
                       $("#playing-song").html("Ви слухаєте: <b>" + d.group + " - " + d.album + "</b> ");
                   }
               }
           })
           .on("mouseover", function (d) {
               d3.selectAll(".node")
                   .filter(function() {
                       return !this.classList.contains('clicked')
                   })
                   .style("fill",  function(p) { return p.isaudio === "yes"? "white": "#181818" })
                   .style("stroke-width", 5)
                   .attr("r",  r);

               //якщо це клікабельний кружечок, збільшуємо і додаємо кнопку play
               if (d.isaudio === "yes" && !this.classList.contains('clicked')) {
                   d3.select(this)
                       .attr("r", function() { return  window.innerWidth >= 1400 ? 14 : 9})
                       .style("fill", function() { return window.innerWidth >= 1400?"url(#playimage-md)":"url(#playimage-sm-hover)" })
                       .style("stroke-width", '3px');
               }

               $("li.list").css("text-decoration", "none");
               var theStyle = d.style;
               theStyle = capitalize(theStyle);
               $("li.list:contains(" + theStyle + ")").css("text-decoration", "underline");

           })
           .on("mouseout", function (d) {
               /*так само обираэмо усі, окрім клікнутого, і забираємо з них всі ховер ефекти*/
               d3.selectAll(".node")
                   .filter(function() { return !this.classList.contains('clicked') })
                   .style("fill", function(p) { return p.isaudio === "yes"? "white": "#181818" })
                   .style("stroke-width", 5)
                   .attr("r", r)
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


    d3.csv('data/random_18_19.csv', function (error, input) {
    
        var data = input.filter(function(d) {
            return d.year === "2018"
        });
    
        render(data);
    
    
        d3.selectAll(".select-year").on("click", function() {
            var selected_year = d3.select(this).text();
            if(selected_year === "2019") {
               d3.select("#language").style("display", "none")
            } else {
                d3.select("#language").style("display", "inline")
            }
            var newData = input.filter(function (d) {
                return d.year === selected_year
            });
    
            render(newData);

            $(window).on("resize", function () {
                render(newData);

            });
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
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
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
                .attr("cx", function (tt) {
                    return tt.x;
                })
                .attr("cy", function (tt) {
                    return tt.y;
                });
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

    // var counted = _.countBy(df, vname);
    //
    // var counted_styles = [];
    //
    // var result = Object.keys(counted).map(function (key) {
    //     counted_styles.push({name: (key), value: counted[key]});
    // });




    centers = _.uniq(_.pluck(df, vname)).map(function (d) {
        return { name: d, value: 1 };
    });

    console.log(centers);

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

    map = d3.layout.treemap().size(size).padding(10).ratio(1 / 1);
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

    console.log(relativePos);
    $("#styleColorGuide ").css("top", relativePos.top + 20);
}, 100);


function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}



