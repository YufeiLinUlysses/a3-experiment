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