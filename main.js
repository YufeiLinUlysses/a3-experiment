// Select 10 numbers randomly
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
var selectedRow = []
var cnt = 0
while (cnt < 10) {
    tmp = getRandomInt(0, 65)
    if (selectedRow.includes(tmp)) {
        continue
    }
    selectedRow.push(tmp)
    cnt++
}

var actualAvg = null
var graph = getRandomInt(0, 2)
console.log("This is graph: " + graph)
if (graph === 0) {
    createChoropleth()
}
else if (graph === 1) {
    createWordCloud()
}

function createChoropleth() {
    // The svg
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .scale(140)
        .center([0, 40])
        .translate([width / 2, height / 2]);

    // Data and color scale
    var data = d3.map();

    var maxVal = 0
    var minVal = 10000
    var vals = []

    function ready(error, topo) {

        console.log(vals)
        console.log(data)
        maxVal = Math.max.apply(null, vals);
        minVal = Math.min.apply(null, vals);
        for (var i = 0; i < 10; i++) {
            actualAvg += vals[i]
        }
        actualAvg = actualAvg / 10
        var maxColor = maxVal + 10
        var interval = maxColor / 6
        var colorScale = d3.scaleThreshold()
            .domain([interval, interval * 2, interval * 3, interval * 4, interval * 5, maxColor])
            .range(d3.schemeBlues[7]);
        document.getElementById("minVal").innerHTML = "Min Value: " + String(minVal);
        document.getElementById("maxVal").innerHTML = "Max Value: " + String(maxVal);
        document.getElementById("avg").setAttribute("min", minVal)
        document.getElementById("avg").setAttribute("max", maxVal)
        document.getElementById("avg").setAttribute("value", minVal)
        document.getElementById("chosen").value = minVal

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            });
    }

    // Load external data and boot
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "https://raw.githubusercontent.com/YufeiLinUlysses/a3-experiment/main/netflix_code.csv",
            function (d, i) {
                if (selectedRow.includes(i)) {
                    tmp = d["Cost Per Month - Standard ($)"]
                    console.log(tmp)
                    vals.push(Number(tmp))
                    data.set(d.code, tmp);
                }
            })
        .await(ready);
}

function createWordCloud() {
    var myWords = []
    var vals = []

    function drawCloud(error) {
        console.log(myWords)
        maxVal = Math.max.apply(null, vals);
        minVal = Math.min.apply(null, vals);
        for (var i = 0; i < 10; i++) {
            actualAvg += vals[i]
        }
        actualAvg = actualAvg / 10
        var maxColor = maxVal + 10
        var interval = maxColor / 6
        var colorScale = d3.scaleThreshold()
            .domain([interval, interval * 2, interval * 3, interval * 4, interval * 5, maxColor])
            .range(d3.schemeBlues[7]);
        document.getElementById("minVal").innerHTML = "Min Value: " + String(minVal);
        document.getElementById("maxVal").innerHTML = "Max Value: " + String(maxVal);
        document.getElementById("avg").setAttribute("min", minVal)
        document.getElementById("avg").setAttribute("max", maxVal)
        document.getElementById("avg").setAttribute("value", minVal)
        document.getElementById("chosen").value = minVal

        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 10, bottom: 10, left: 10 },
            width = 450 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        // Wordcloud features that are different from one word to the other must be here
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(myWords.map(function (d) { return { text: d.word, size: d.size }; }))
            .padding(5)        //space between words
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .fontSize(function (d) { return d.size * 4.5; })      // font size of words
            .on("end", draw);
        layout.start();

        // This function takes the output of 'layout' above and draw the words
        // Wordcloud features that are THE SAME from one word to the other can be here
        function draw(words) {
            svg
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size; })
                .style("fill", function (d, i) {
                    d.total = i || 0;
                    return colorScale(d.total);
                })
                .attr("text-anchor", "middle")
                .style("font-family", "Impact")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) { return d.text; });
        }
    }

    d3.queue()
        .defer(d3.csv, "https://raw.githubusercontent.com/YufeiLinUlysses/a3-experiment/main/netflix_code.csv", function (d, i) {
            if (selectedRow.includes(i)) {
                tmp = Number(d["Cost Per Month - Standard ($)"])
                vals.push(tmp)
                myWords.push({
                    word: d["code"],
                    size: tmp
                })
            }
        })
        .await(drawCloud)
}
