var margin = {
        top: 10,
        right: 300,
        bottom: 120,
        left: 120
    },
    width = 1500 - margin.left - margin.right,
    height = 455 - margin.top - margin.bottom,
    paddingInner = 0.4;



var chart = d3.select("#chartarea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + 20)

    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Define Tooltip here
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var storytip = d3.select("body").append("div")
    .attr("class", "storytip")
    .style("opacity", 0);

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(paddingInner)
    .align(0.5);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#b2182b", "#ef8a62", "#e6bfbf", "#ffe6e6", "#e6ffff", "#bfbfe6", "#67a9cf", "#2166ac"]);

d3.queue()
    .defer(d3.csv, "policy_contributions.csv")
    .await(function (error, data) {
        if (error) {
            console.error('CSV loading failed' + error);
        }

        //console.log(data);

        // Format numerical data
        data.forEach(function (d) {
            d.count_align_r = +d.count_align_r;
            d.contri_align_r = +d.contri_align_r;
            d.count_unalign_r = +d.count_unalign_r;
            d.contri_unalign_r = +d.contri_unalign_r;
            d.count_novote_r = +d.count_novote_r;
            d.contri_novote_r = +d.contri_novote_r;
            d.count_nocontri_r = +d.count_nocontri_r;
            d.total_r = +d.total_r;
            d.count_align_d = +d.count_align_d;
            d.contri_align_d = +d.contri_align_d;
            d.count_unalign_d = +d.count_unalign_d;
            d.contri_unalign_d = +d.contri_unalign_d;
            d.count_novote_d = +d.count_novote_d;
            d.contri_novote_d = +d.contri_novote_d;
            d.count_nocontri_d = +d.count_nocontri_d;
            d.total_d = +d.total_d;
        });


        var keys_count = ["count_align_r", "count_unalign_r", "count_novote_r", "count_nocontri_r", "count_nocontri_d", "count_novote_d", "count_unalign_d", "count_align_d"];
        var keys_contri = ["contri_align_r", "contri_unalign_r", "contri_novote_r", "contri_align_d", "contri_unalign_d", "contri_novote_d"];
        var legend_count = ["Republicans who voted in favor of lobby", "Republicans who voted against lobby", "Lobbied Republicans who did not vote", "Republicans who were not lobbied", "Democrats who were not lobbied", "Lobbied Democrats who did not vote", "Democrats who voted against lobby", "Democrats who voted in favor of lobby"];

        x.domain(data.map(function (d) {
            return d.abv;
        }));

        y.domain([0, 435]);
        z.domain(keys_count);

        chart.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys_count)(data))
            .enter().append("g")
            .attr("fill", function (d) {
                //console.log(d);
                return z(d.key);
            })
            .selectAll("rect")
            .data(function (d, i) {
                // Add in a number that tells us which data series each column belongs to
                d.forEach(function (e) {
                    e["dataseries"] = i;
                });
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {

                return x(d.data.abv);
            })
            .attr("y", function (d) {
                return y(d[1]);
            })
            .attr("height", function (d) {
                return y(d[0]) - y(d[1]);
            })
            .attr("width", x.bandwidth())
            .on("mouseover", function (d, i) {

                console.log(d);

                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                        generateTooltipHtml(d, 1)
                    )
                    .style("left", (xPosition + 300) + "px")
                    .style("top", function () {
                        return (yPosition + 100) + "px";
                    });

                d3.select(".tip.status")
                    .style("color", function () {
                        // Format status of policy
                        if (d.data.status == "Became Law") {
                            return "green";
                        } else {
                            return "red";
                        }
                    });

                storytip.transition()
                    .duration(200)
                    .style("opacity", .9);
                storytip.html(
                        generateStory(d, legend_count, 1)
                    )
                    .style("left", (xPosition + 60) + "px")
                    .style("top", function () {
                        return (yPosition + 190) + "px";
                    });
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                storytip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .style("opacity", 0)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "-0.15em")
            .attr("transform", "rotate(-45)")
            .attr("font-size", "14px");

        chart.append("text")
            .attr("transform", "translate(" + (width + 5) + "," + (height + 5) + ")")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .style("opacity", 0)
            .text("Policies (2015 to 2017)");

        chart.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("transform", "rotate(270)")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .text("Number of House Representatives");

        var legend = chart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys_count.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(40," + i * 40 + ")";
            });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width)
            .attr("dx", "0.5em")
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("text-anchor", "start")
            .text(function (d, i) {

                return legend_count[legend_count.length - 1 - i];
            });
    });



var chart2 = d3.select("#chartarea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var y2 = d3.scaleLinear()
    .rangeRound([height, 0]);

var z2 = d3.scaleOrdinal()
    .range(["#b2182b", "#ef8a62", "#e6bfbf", "#bfbfe6", "#67a9cf", "#2166ac"]);

d3.queue()
    .defer(d3.csv, "policy_contributions.csv")
    .await(function (error, data) {
        if (error) {
            console.error('CSV loading failed' + error);
        }

        // Format numerical data
        data.forEach(function (d) {
            d.count_align_r = +d.count_align_r;
            d.contri_align_r = +d.contri_align_r;
            d.count_unalign_r = +d.count_unalign_r;
            d.contri_unalign_r = +d.contri_unalign_r;
            d.count_novote_r = +d.count_novote_r;
            d.contri_novote_r = +d.contri_novote_r;
            d.count_nocontri_r = +d.count_nocontri_r;
            d.total_r = +d.total_r;
            d.count_align_d = +d.count_align_d;
            d.contri_align_d = +d.contri_align_d;
            d.count_unalign_d = +d.count_unalign_d;
            d.contri_unalign_d = +d.contri_unalign_d;
            d.count_novote_d = +d.count_novote_d;
            d.contri_novote_d = +d.contri_novote_d;
            d.count_nocontri_d = +d.count_nocontri_d;
            d.total_d = +d.total_d;
        });

        var keys_contri = ["contri_align_r", "contri_unalign_r", "contri_novote_r", "contri_novote_d", "contri_unalign_d", "contri_align_d"];
        var legend_contri = ["Republicans who voted in favor of lobby", "Republicans who voted against lobby", "Lobbied Republicans who did not vote", "Lobbied Democrats who did not vote", "Democrats who voted against lobby", "Democrats who voted in favor of lobby"];

        x.domain(data.map(function (d) {
            return d.abv;
        }));

        y2.domain([0, d3.max(data, function (d) {
            return d3.sum([d.contri_align_r, d.contri_unalign_r, d.contri_novote_r, d.contri_align_d, d.contri_unalign_d, d.contri_novote_d]);
        })]).nice();
        z2.domain(keys_contri);

        chart2.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys_contri)(data))
            .enter().append("g")
            .attr("fill", function (d) {
                return z2(d.key);
            })
            .selectAll("rect")
            .data(function (d, i) {
                // Add in a number that tells us which data series each column belongs to
                d.forEach(function (e) {
                    e["dataseries"] = i;
                });
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return x(d.data.abv);
            })
            .attr("y", function (d) {
                return y2(d[1]);
            })
            .attr("height", function (d) {
                return y2(d[0]) - y2(d[1]);
            })
            .attr("width", x.bandwidth())
            .on("mouseover", function (d, i) {

                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                        generateTooltipHtml(d, 2)
                    )
                    .style("left", (xPosition + 250) + "px")
                    .style("top", function () {
                        return (yPosition + 200) + "px";
                    });

                d3.select(".tip.status")
                    .style("color", function () {
                        // Format status of policy
                        if (d.data.status == "Became Law") {
                            return "green";
                        } else {
                            return "red";
                        }
                    });

                storytip.transition()
                    .duration(200)
                    .style("opacity", .9);
                storytip.html(
                        generateStory(d, legend_contri, 2)
                    )
                    .style("left", (xPosition + 40) + "px")
                    .style("top", function () {
                        return (yPosition + 540) + "px";
                    });

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                storytip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        chart2.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "-0.15em")
            .attr("transform", "rotate(-45)")
            .attr("font-size", "14px");

        chart2.append("text")
            .attr("transform", "translate(" + (width + 20) + "," + (height + 5) + ")")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .text("Policies (2015 to 2017)");

        chart2.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y2).ticks(6, "s"))
            .append("text")

            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("transform", "rotate(270)")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .text("Contributions per Representative ($)");

        var legend2 = chart2.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys_contri.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(40," + i * 40 + ")";
            });

        legend2.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z2);

        legend2.append("text")
            .attr("x", width)
            .attr("dx", "0.5em")
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("text-anchor", "start")
            .text(function (d, i) {

                return legend_contri[legend_contri.length - 1 - i];
            });
    });

function generateTooltipHtml(d, g) {
    var header = "<link rel=\"stylesheet\" type=\"text/css\" href=\"policy_contributions.css\">" +
        "<div class=\"tip name\">" + d.data.name + "</div>" +
        "<div class=\"tip status\">" + d.data.status + "</div>" +
        "<div class=\"tip description\">" + d.data.desc + "</div>" +
        "<div class=\"tip vote\" style=\"margin-top:5px\">" +
        "<p class=\"tip h2\">Vote Distribution</p>" +
        "<table class=\"tip table\">" +
        "<tr>" +
        "<th class=\"tip table\">Party</th>" +
        "<th class=\"tip table yes\">Voted Yes</th>" +
        "<th class=\"tip table no\">Voted No</th>" +
        "<th class=\"tip table dnv\">Abstained</th>" +
        "</tr>" +

        "<tr>" +
        "<td class=\"tip table\">Rep</td>" +
        "<td class=\"tip table yes\" >" + d.data.vote_yes_r + "</td>" +
        "<td class=\"tip table no\">" + d.data.vote_no_r + "</td>" +
        "<td class=\"tip table dnv\">" + d.data.vote_dnv_r + "</td>" +
        "</tr>" +

        "<tr>" +
        "<td class=\"tip table\">Dem</td>" +
        "<td class=\"tip table yes\">" + d.data.vote_yes_d + "</td>" +
        "<td class=\"tip table no\">" + d.data.vote_no_d + "</td>" +
        "<td class=\"tip table dnv\">" + d.data.vote_dnv_d + "</td>" +
        "</tr>" +
        "</table>" +
        "</div>";

    var body;
    if (g == 1) {
        body = "<div class=\"tip contributions\" style=\"margin-top:10px\">" +
            "<p><b  class=\"tip h2\">Contribution Distribution</b><br /> \
                             Average contribution per representative who voted in favor of lobby, against lobby or was lobbied but did not vote.</p>" +
            "<table class=\"tip table\">" +
            "<tr>" +
            "<th class=\"tip table\">Party</th>" +
            "<th class=\"tip table yes\">Voted in Favor of Lobby</th>" +
            "<th class=\"tip table no\">Voted Against Lobby</th>" +
            "<th class=\"tip table dnv\">Lobbied but Abstained</th>" +
            "</tr>" +

            "<tr>" +
            "<td class=\"tip table\">Rep</td>" +
            "<td class=\"tip table yes\">" + d3.format("$,")(d.data.contri_align_r) + "</td>" +
            "<td class=\"tip table no\">" + d3.format("$,")(d.data.contri_unalign_r) + "</td>" +
            "<td class=\"tip table dnv\">" + d3.format("$,")(d.data.contri_novote_r) + "</td>" +
            "</tr>" +

            "<tr>" +
            "<td class=\"tip table\">Dem</td>" +
            "<td class=\"tip table yes\">" + d3.format("$,")(d.data.contri_align_d) + "</td>" +
            "<td class=\"tip table no\">" + d3.format("$,")(d.data.contri_unalign_d) + "</td>" +
            "<td class=\"tip table dnv\">" + d3.format("$,")(d.data.contri_novote_d) + "</td>" +
            "</tr>" +
            "</table>" +
            "</div>";
    } else if (g == 2) {
        body = "<div class=\"tip contributions\" style=\"margin-top:10px\">" +
            "<p><b  class=\"tip h2\">Vote Distribution by Lobbying</b><br /> \
                             Count of representatives who voted in favor of lobby, against lobby, were not lobbied at all or were lobbied but did not vote.</p>" +
            "<table class=\"tip table\">" +
            "<tr>" +
            "<th class=\"tip table\">Party</th>" +
            "<th class=\"tip table yes\">Voted in Favor of Lobby</th>" +
            "<th class=\"tip table no\">Voted Against Lobby</th>" +
            "<th class=\"tip table dnv\">Lobbied but Abstained</th>" +
            "<th class=\"tip table\">Not Lobbied</th>" +
            "</tr>" +

            "<tr>" +
            "<td class=\"tip table\">Rep</td>" +
            "<td class=\"tip table yes\">" + (d.data.count_align_r) + "</td>" +
            "<td class=\"tip table no\">" + (d.data.count_unalign_r) + "</td>" +
            "<td class=\"tip table dnv\">" + (d.data.count_novote_r) + "</td>" +
            "<td class=\"tip table\">" + (d.data.count_nocontri_r) + "</td>" +
            "</tr>" +

            "<tr>" +
            "<td class=\"tip table\">Dem</td>" +
            "<td class=\"tip table yes\">" + (d.data.count_align_d) + "</td>" +
            "<td class=\"tip table no\">" + (d.data.count_unalign_d) + "</td>" +
            "<td class=\"tip table dnv\">" + (d.data.count_novote_d) + "</td>" +
            "<td class=\"tip table\">" + (d.data.count_nocontri_d) + "</td>" +
            "</tr>" +
            "</table>" +
            "</div>";
    }

    var trailer = "<div class=\"tip totals\" style=\"margin-top:10px\">" +
        "<p><b  class=\"tip h2\">Total Donations</b></p>" +
        "<table class=\"tip table\">" +

        "<tr>" +
        "<td class=\"tip table total r\">Republican</td>" +
        "<td class=\"tip table total r\">" + d3.format("$,")(d.data.total_r) + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td class=\"tip table total d\">Democrat</td>" +
        "<td class=\"tip table total d\" style=\"padding-bottom: 0.2em;border-bottom: 0.5pt solid black\">" + d3.format("$,")(d.data.total_d) + "</td>" +
        "</tr>" +

        "<tr>" +
        "<td class=\"tip table total\">Total for House</td>" +
        "<td class=\"tip table total\">" + d3.format("$,")(d.data.total_r + d.data.total_d) + "</td>" +
        "</tr>" +
        "</table>" +
        "</div>";

    return header.concat(body.concat(trailer));
}

function generateStory(d, story, g) {

    var header;
    var trailer;

    if (g == 1) {
        header = "<b>" + (d[1] - d[0]);
        trailer = " ".concat(story[d.dataseries]) + "</b>";
    } else if (g == 2) {
        header = "<b>" + d3.format("$,")(d[1] - d[0]);
        trailer = " on average given to ".concat(story[d.dataseries]) + "</b>";
    }

    return header.concat(trailer);
}
