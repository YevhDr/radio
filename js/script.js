/**
 * Created by yevheniia on 11.02.19.
 */


// var div = d3.select(".tooltip")
//     .style("opacity", 1);

$("a").attr("target", "_blank");

var fill = d3.scale.ordinal()
    .range(['#b20000', 'yellow', '#8c5754', '#c3c3c3', '#0977f6', '#fcc980', '#adeda6', '#db656b', '#4cb69c', '#d372d9', '#53a424', '#a26fdc'])
    .domain(["rock", "r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic"]);


var audio = document.getElementById("audio");
// var playPause = document.getElementById("playPause");
// var playPauseMob = document.getElementById("playPause-mob");


// playPause.addEventListener("click", playmusic);
// playPauseMob.addEventListener("click", playmusicmob);

//
// function playmusic() {
//     if (audio.paused) {
//         audio.play();
//         // playPause.src = "img/pause.svg";
//     } else {
//         audio.pause();
//         // playPause.src = "img/play.svg";
//
//     }
// }
//
// function playmusicmob() {
//     if (audio.paused) {
//         audio.play();
//         playPauseMob.src = "img/pause.svg";
//     } else {
//         audio.pause();
//         playPauseMob.src = "img/play.svg";
//     }
// }

//сортуємо по заданим параметрам.... здається не працює
var sexOrder = ["інша", "жіноча", "мікс", "чоловіча"];
var styleOrder = ["r&b and soul", "country", "instrumental", "indie", "jazz", "ethno", "metal", "avant-garde", "pop", "hip hop & rap", "electronic", "rock"];
var regionOrder = ["", "інший", "Північ", "Південь", "Закордон", "Схід", "Захід", "Центр"];
var languageOrder = ["", "дивна", "немає", "специфічна", "російська", "англійська", "українська"];

d3.csv('data/joinedDataAll.csv', function (error, data) {
    var width;
    if (window.innerWidth > 700) {
        width = window.innerWidth * 0.8;
    } else {
        width = window.innerWidth * 0.9;
    }

    var height;
    if (window.innerWidth > 700) {
        height = window.innerHeight * 0.9;
    } else {
        height = window.innerHeight * 1.4;
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
    if(window.innerWidth >= 1400 ) { padding = 15 }
    else if(window.innerWidth < 1400 && window.innerWidth > 700) { padding = 7 }
    else { padding = 4 }

    //залишаємо унікальні рядки по альбомам для вкладок стиль, мова, стать
    var dataUnique = _.uniq(data, function (group) {
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
            dub2.push(val.id)
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
            dub3.push(val.id)
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

    var nodes = svg.selectAll("circle")
        .data(data);

    svg.append("text").attr("id", "playingNow");

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
        .attr("r", function () {
            if(window.innerWidth >= 1400 ) { return 6 }
            else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
            else { return 3 }
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
        .style("stroke-width", function () {
            if(window.innerWidth >= 1400 ) { return 6 }
            else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
            else { return 3 }

        })
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
        .style("cursor", function (d, i) {
            if (d.isaudio === "yes") {
                return "pointer";
            } else {
                return false
            }
        })
        .on("click", function (d) {
            var clickCoordinates =  d3.mouse(this);
            //якщо цей кружечок вже клікнутий, то нам потрібна пауза:
            if(this.classList.contains('played')){
                audio.pause();
                d3.select(this)
                    .style("fill", function() {
                        if(window.innerWidth >= 1400){
                           return  "url(#playimage)"
                        } else {
                            return  "url(#playimage-sm)"
                        }
                    })
                    .style("stroke-width", '2px');

                $(this).attr("class", "node clicked paused")
            }
                
            //якщо цей кружечок вже клікнутий і натиснута пауза:
            else if(this.classList.contains('paused')) {
                audio.play();
                d3.select(this)
                    .style("fill",  function() {
                        if(window.innerWidth >= 1400){
                            return  "url(#pauseimage)"
                        } else {
                            return  "url(#pauseimage-sm)"
                        }

                    })
                    .style("stroke-width", '2px');
                $(this).attr("class", "node clicked played")
            }
                
            //якщо кружечок клікається вперше:
            else {
                //прибираємо в усіх кружечков будь-які зайві класи
                d3.selectAll(".node").attr("class", "node");
                
                //повертаємо усім кружечкам неактивну заливку, обводку і ширину обводки
                d3.selectAll(".node")
                    .style("fill", function(p) {
                        if (p.isaudio === "yes") {
                            return "white";
                        } else {
                            return "#181818"
                        }
                    })
                    .style("stroke-width", function() {
                        if(window.innerWidth >= 1400 ) { return 6 }
                        else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                        else { return 3 }

                    })
                    .attr("r", function () {
                        if(window.innerWidth >= 1400 ) { return 6 }
                        else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                        else { return 3 }
                    });
                
                //якщо клікнутий має опцію програшу пісні:
                if (d.isaudio === "yes") {
                    //додаємо до обраного потрібні класи - "клікнутий та грає"
                    d3.select(this).attr("class", "node clicked played");
                    
                    //міняємо фонову картинку кнопки
                    d3.select(this)
                        .style("fill",  function() {
                            if(window.innerWidth >= 1400){
                                return  "url(#pauseimage)"
                            } else {
                                return  "url(#pauseimage-sm)"
                            }

                        })
                        .style("stroke-width", '2px');
                    
                    //додаємо потрібне аудіо
                    $("audio").attr("src", function () {
                        return "sounds/" + d.audio

                    });

                    //додаємо назву пісні поруч з кліком
                    d3.select("#playing-song").html("<b>" + d.group + "</b> " + d.album);
                    
                    //збільшуємо радіус клікнутого
                    d3.select(this).attr("r", function() {
                        if(window.innerWidth >= 1400 ) { return 14 }
                        else { return 9 }
                    });
                    
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
                .style("fill", function(p) {
                    if (p.isaudio === "yes") {
                        return "white";
                    } else {
                        return "#181818"
                    }

                })
                .style("stroke-width", function() {
                    if(window.innerWidth >= 1400 ) { return 6 }
                    else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                    else { return 3 }

                })
                .attr("r", function () {
                    if(window.innerWidth >= 1400 ) { return 6 }
                    else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                    else { return 3 }
                })
            
            //якщо це клікабельний кружечок, збільшуємо і додаємо кнопку play
            if (d.isaudio === "yes" && !this.classList.contains('clicked')) {
                d3.select(this)
                    .attr("r", function() {
                        if(window.innerWidth >= 1400 ) { return 14 }
                        else { return 9 }
                    });
                d3.select(this)
                    .style("fill", function() {
                        if(window.innerWidth >= 1400){
                            return  "url(#playimage)"
                        } else {
                            return  "url(#playimage-sm)"
                        }
                    })
                    .style("stroke-width", '2px');
            }

            $("li.list").css("text-decoration", "none");
            var theStyle = d.style;
            theStyle = capitalize(theStyle);
            $("li.list:contains(" + theStyle + ")").css("text-decoration", "underline");


        })
        .on("mouseout", function (d) {
           /*так само обираэмо усі, окрім клікнутого, і забираємо з них всі ховер ефекти*/
            d3.selectAll(".node")
                .filter(function() {
                    return !this.classList.contains('clicked')
                })
                .style("fill", function(p) {
                    if (p.isaudio === "yes") {
                        return "white";
                    } else {
                        return "#181818"
                    }

                })
                .style("stroke-width", function() {
                    if(window.innerWidth >= 1400 ) { return 6 }
                    else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                    else { return 3 }

                })
                .attr("r", function () {
                    if(window.innerWidth >= 1400 ) { return 6 }
                    else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                    else { return 3 }
                })
        });


    var force = d3.layout.force();

    draw('style');


    $(window).on("resize", function (d) {
        width = screen.width * 0.9;
        height = screen.height * 0.9;
        svg.attr("width", width).attr("height", height);
        var activeLi = $("button.active").attr('id');
        draw(activeLi)
        svg.selectAll(".node")
            .attr("r", function(){
            if(window.innerWidth >= 1400 ) { return 6 }
            else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
            else { return 3 }
        })
            .style("stroke-width", function() {
                if(window.innerWidth >= 1400 ) { return 6 }
                else if(window.innerWidth < 1400 && window.innerWidth > 700) { return 4 }
                else { return 3 }

            })
    });


    $("button").click(function () {
        draw(this.id);
    });

    function draw(varname) {
        var centers;
        if (varname === "region") {
            centers = getCenters(varname, [width, height], data);
            force.on("tick", tick(centers, varname, data));
            labels(centers);
            force.start();
            excludeId.forEach(function (id) {
                $("#" + id).css("display", "none");
            }); //тут в нас усі не унікальні айді, ми їх показуємо
            IDofDoublesFromAllAlbums.forEach(function (id) {
                $("#" + id).css("display", "block");
            }); //тут в нас повтори по регіону
        }
        if (varname === "aprize") {
            centers = getCenters(varname, [width, height], dataForAprizeWithoutRegions);
            force.on("tick", tick(centers, varname, dataForAprizeWithoutRegions));
            labels(centers);
            force.start();
            excludeId.forEach(function (id) {
                $("#" + id).css("display", "block");
            }); //тут в нас усі не унікальні айді, ми їх показуємо
            IDofDoublesFromAllAlbums.forEach(function (id) {
                $("#" + id).css("display", "none");
            }); //тут в нас повтори по регіону
            d3.select("#styleColorGuide").style("opacity", "1")
        }
        else {
            if (varname === "style") {
                d3.select("#styleColorGuide").style("opacity", "0")
            } else {
                d3.select("#styleColorGuide").style("opacity", "1")
            }

            centers = getCenters(varname, [width, height], dataUnique);
            force.on("tick", tick(centers, varname, dataUnique));
            labels(centers);
            force.start();
            excludeId.forEach(function (id) {
                $("#" + id).css("display", "none");
            });
        }
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
            nodes.each(collide(0.3, df))
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
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
            .style("text-transform", "uppercase")
        ;
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
            var r = d.radius + padding,
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


$("button").on("click", function () {
    $("button").removeClass("active");
    $(this).addClass("active");
});

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



