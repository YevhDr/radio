/**
 * Created by yevheniia on 11.02.19.
 */

$("a").attr("target", "_blank");

var fill = d3.scale.ordinal()
    .range(['#b20000', 'yellow', '#8c5754', '#c3c3c3', '#0977f6', '#fcc980', '#adeda6', '#db656b', '#4cb69c', '#d372d9', '#53a424', '#a26fdc'])
    .domain(["rock", "r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic"]);

var audio = document.getElementById("audio");

//сортуємо по заданим параметрам.... здається не працює
var sexOrder = ["інша", "жіноча", "мікс", "чоловіча"];
var styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
var regionOrder = ["", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
var languageOrder = ["", "дивна", "немає", "специфічна", "російська", "англійська", "українська"];
var r = 6;

// d3.csv('data/joinedDataAll.csv', function (error, data) {
d3.csv('data/random_18_19.csv', function (error, data) {

    data = data.filter(function(d) {
        return d.year === "2018"
    });

    /* легенда по стилях */
    var styles = d3.map(data, function(d){return d.style;}).keys();
    console.log(styles);

    d3.select("#styleColorGuide")
        .selectAll("li")
        .data(styles)
        .enter()
        .append("li")
        .text(function(d) { return d })
        .style("color", function(d) { return fill(d) });


    var width;
    var height;
    var padding;

    if (window.innerWidth > 700) { width = window.innerWidth * 0.8; } else { width = window.innerWidth * 0.9; }
    if (window.innerWidth > 700) { height = window.innerHeight * 0.9; } else {  height = window.innerHeight * 1.4; }
    if (window.innerWidth >= 1400) { padding = 15 } else if(window.innerWidth < 1400 && window.innerWidth > 700) { padding = 4 } else { padding = 4 }

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    for (var j = 0; j < data.length; j++) {
        data[j].radius = 5;
        data[j].x = Math.random() * width;
        data[j].y = Math.random() * height;
    }

    //залишаємо унікальні рядки по альбомам для вкладок стиль, мова, стать
    var dataUnique = _.uniq(data, function (group) {
        return group.album;
    });

    var dataForRegions = _.uniq(data, function (group) {
        return group.album;
    });

    //Знаходимо усі існуючі дублікати (щортлист, лонглист, регіони)
    var ids1 = {};
    var excludeId = [];

    data.forEach(function (val) {
        if (ids1[val.album]) {
            excludeId.push(val.id)
        } else {
            ids1[val.album] = true;
        }
        return excludeId;
    });


    /* -- Фільтруємо по категорії "Усі альбоми", щоб виключити з кластеру "Усі альбоми" повтори за регіоном --*/
    var allAlbumsCategory = data.filter(function (d) {
        return d.aprize === "усі альбоми"
    });

    //знаходимо перелік id зі строк, що дублюються
    var ids2 = {};
    var dub2 = [];

    allAlbumsCategory.forEach(function (val) {
        if (ids2[val.album]) {
            dub2.push(val.id);
            dataForRegions.push(val)

        } else {
            ids2[val.album] = true;
        }
        return dub2;
    });


    /* -- фільтруємо так само по лонг лісту --*/
    var lingListAlbumsCategory = data.filter(function (d) {
        return d.aprize === "long list"
    });

    var ids3 = {};
    var dub3 = [];

    lingListAlbumsCategory.forEach(function (val) {
        if (ids3[val.album]) {
            dub3.push(val.id);
            dataForRegions.push(val)
        } else {
            ids3[val.album] = true;
        }
        return dub3;
    });


    /*-- поєднуємо обидва виключення --*/
    var IDofDoublesFromAllAlbums = dub2.concat(dub3);


    //  фільтруємо дані для вкладки "айпраз"
    var dataForAprizeWithoutRegions = data.filter(function (d) {
        if (!IDofDoublesFromAllAlbums.includes(d.id)) {
            return d;
        }
    });


    //-------------------------------------------------------------

    var getCenters = function (vname, size, df) {
        var centers, map;
        centers = _.uniq(_.pluck(df, vname)).map(function (d) {
            return {name: d, value: 1};
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

        map = d3.layout.treemap().size(size).ratio(1 / 1);
        map.nodes({children: centers});
        return centers;
    };


    svg.append("text").attr("id", "playingNow");

    var nodes = svg.selectAll("circle")
        .data(data);


    var previousClickedValue;

    nodes.enter().append("circle")
        .attr("class", "node")
        .attr("value", function(d) { return  d.style })
        .attr("cx", function (d) { return d.x; })
        .attr("id", function (d) { return d.id; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", r)
        // .attr("r", function () {
        //     if(window.innerWidth >= 1400 ) { return 6 }
        //     else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
        //     else { return 3 }
        // })
        .style("fill", function (d) { return d.isaudio === "yes"? "white" : "#181818"; })
        .style("stroke", function (d) { return fill(d.style); })
        .style("stroke-width", 5)
        .attr("data-tippy-content", function (d) {
            var linkColor = fill(d.style);
            return "<div id='myTooltip>' >" +
                "<div id='album-picture'>" +
                "<img style='width:100px;' src='" + d.image + "'/></div>" +
                "<div id='tooltipText'>" + "Назва: <b>" + d.group + "</b><br>" +
                "Альбом: <b>" + d.album + "</b><br>" +
                "Стиль: <b>" + d.Selfdetermination + "</b><br>" +
                "Місто:  <b>" + d.City + "</b><br> " +
                "<a style='color:" + linkColor + "' href = '" + d.listen + "' target='_blank'>Перейти до альбому</a>" +
                "</div>" +
                "</div>"
        })
        .style("cursor", function (d) {  return d.isaudio === "yes" ?"pointer" : false; })
        .on("click", function (d) {
            var currentClickedId = $(this).attr("id");
            var currentClickedValue = $(this).attr("value");
            $(d.radius === 20);
            //var clickCoordinates =  d3.mouse(this);

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

                   var newdata = dataUnique;

                    var activeLi = $("button.active").attr('id');

                    // if (activeLi === "style" || activeLi === "language" || activeLi === "sex"){
                    //     newdata = dataUnique;
                    // } else if(activeLi === "region"){
                    //     newdata = dataForRegions
                    // } else if(activeLi === "aprize"){
                    //     newdata = dataForAprizeWithoutRegions
                    // }

                    for (var j = 0; j < newdata.length; j++) {
                        if(newdata[j].id === currentClickedId) {
                            newdata[j].radius = 15;
                        }
                        else {
                            newdata[j].radius = 5;
                        }
                    }

                    var centers = getCenters(activeLi, [width, height], newdata);
                    force.on("tick", tickRedraw(selectedCurrentNodes, centers, activeLi, newdata));
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


    var force = d3.layout.force();

    draw('style');

    $(window).on("resize", function (d) {
        width = screen.width * 0.9;
        height = screen.height * 0.9;
        svg.attr("width", width).attr("height", height);
        var activeLi = $("button.active").attr('id');
        draw(activeLi);
        svg.selectAll(".node")
            .attr("r", r)
            .style("stroke-width", 5)
    });


    $("button").click(function () {
        for (var j = 0; j < data.length; j++) {
            data[j].x = Math.random() * width;
            data[j].y = Math.random() * height;
        }
        draw(this.id);
    });


    /* функція перемальовки при зміні вкладки*/
    function draw(varname) {
        var centers;
        var dataset;
        if(varname === "region"){
            dataset = dataForRegions;
        } else if (varname === "aprize"){
            dataset = dataForAprizeWithoutRegions;
        } else {
            dataset = dataUnique
        }

        d3.selectAll(".node").each(function(k){
            d3.select(this).attr("value", k[varname])
        });
        d3.select("#styleColorGuide").style("opacity", varname === "style"? 0 : 1);
        centers = getCenters(varname, [width, height], dataset);
        force.on("tick", tick(centers, varname, dataset));
        labels(centers);
        force.start();
        excludeId.forEach(function (id) {
            $("#" + id).css("display", varname === "aprize" ? "block" : "none");
        }); //тут в нас усі не унікальні айді, ми їх показуємо
        IDofDoublesFromAllAlbums.forEach(function (id) {
            $("#" + id).css("display", varname === "region"?"block" : "none");
        }); //тут в нас повтори по регіону

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
            nodes
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
        svg.selectAll(".label").remove();
        svg.selectAll(".label")
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

    tippy(".node", {
        allowHTML: true,
        animateFill: false,
        animation: "fade",
        interactive: true,
        hideOnClick: true,
        theme: 'width-200'
    });


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

    excludeId.forEach(function (id) {
        $("#" + id).css("display", "none");
    });

    IDofDoublesFromAllAlbums.forEach(function (id) {
        $("#" + id).css("display", "none");
    });
});



/* активна вкладка */
$("button").on("click", function () {
    $("button").removeClass("active");
    $(this).addClass("active");
});



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



