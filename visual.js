var svg = d3.select("svg"),
    margin = {
        top: 10,
        right: 300,
        bottom: 150,
        left: 80
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Define Tooltip here
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.3)
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

        x.domain(data.map(function (d) {
            return d.abv;
        }));

        y.domain([0, 435]);
        z.domain(keys_count);

        g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys_count)(data))
            .enter().append("g")
            .attr("fill", function (d) {
                //console.log(d);
                return z(d.key);
            })
            .selectAll("rect")
            .data(function (d, i) {
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
                //                console.log(i);
                //                var story = "";
                //                if (i > 3) {
                //                    // Democrat Story
                //                    story = story.concat(d.data.count_align_d + " Democrats voted in favor of lobby.\n");
                //                    story = story.concat(d.data.count_unalign_d + " Democrats voted opposed to lobby.\n");
                //                    story = story.concat(d.data.count_novote_d + " Democrats who were lobbied did not vote.\n");
                //                    story = story.concat(d.data.count_nocontri_d + " Democrats were not lobbied.\n");
                //                } else {
                //                    story = story.concat(d.data.count_align_r + " Republicans voted in favor of lobby.\n");
                //                    story = story.concat(d.data.count_unalign_r + " Republicans voted opposed to lobby.\n");
                //                    story = story.concat(d.data.count_novote_r + " Republicans who were lobbied did not vote.\n");
                //                    story = story.concat(d.data.count_nocontri_r + " Republicans were not lobbied.\n");
                //                }

                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<div class=\"tip name\">" + d.data.name + "</div>" +
                        "<div class=\"tip status\">" + d.data.status + "</div>" +
                        "<div class=\"tip description\">" + d.data.desc + "</div>" +
                        "<div class=\"tip vote\" style=\"margin-top:5px\">" +
                        //                        "<p>" +
                        //                        story +
                        //                        d.data.count_align_d + " Democrats voted in favor of lobby.<br />" +
                        //                        d.data.count_unalign_d + " Democrats voted opposed to lobby.<br />" +
                        //                        d.data.count_novote_d + " Democrats who were lobbied did not vote.<br />" +
                        //                        d.data.count_nocontri_d + " Democrats were not lobbied.<br />" +
                        //                        "</p>" +
                        "<p style=\"font-variant:small-caps\"><b><left>Vote Distribution</left></b></p>" +
                        "<table style=\"width:100%;  border-collapse:collapse\" >" +
                        "<tr>" +
                        "<th width=\"25%\" align=\"center\" style=\"padding-bottom:0.5  em; border-bottom: 1pt solid black\">Party</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:green; padding-bottom:0.5  em; border-bottom: 1pt solid black\">Voted Yes</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:red; padding-bottom:0.5  em; border-bottom: 1pt solid black\">Voted No</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:slategrey; padding-bottom:0.5  em; border-bottom: 1pt solid black\">Abstained</th>" +
                        "</tr>" +

                        "<tr>" +
                        "<td width=\"25%\" align=\"center\">Rep</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:green\">" + d.data.vote_yes_r + "</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:red\">" + d.data.vote_no_r + "</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:slategrey\">" + d.data.vote_dnv_r + "</td>" +
                        "</tr>" +

                        "<tr>" +
                        "<td width=\"25%\" align=\"center\">Dem</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:green\">" + d.data.vote_yes_d + "</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:red\">" + d.data.vote_no_d + "</td>" +
                        "<td width=\"25%\" align=\"center\" style=\"color:slategrey\">" + d.data.vote_dnv_d + "</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>" +

                        "<div class=\"tip contributions\" style=\"margin-top:10px\">" +
                        "<p><b  style=\"font-variant:small-caps\"><left>Contribution Distribution</left></b><br /> \
                             Average contribution per representitive who voted in favor of lobby, against lobby or was lobbied but did not vote.</p>" +
                        "<table style=\"width:100%; border-collapse:collapse\" >" +
                        "<tr>" +
                        "<th width=\"25%\" align=\"center\" style=\"padding-bottom:0.5em; border-bottom: 1pt solid black\">Party</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:green; padding-bottom:0.5em; border-bottom: 1pt solid black\">Voted in Favor of Lobby</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:red; padding-bottom:0.5em; border-bottom: 1pt solid black\">Voted Against Lobby</th>" +
                        "<th width=\"25%\" align=\"center\" style=\"color:slategrey; padding-bottom:0.5  em; border-bottom: 1pt solid black\">Lobbied but Abstained</th>" +
                        "</tr>" +

                        "<tr>" +
                        "<td width=\"25%\" align=\"center\">Rep</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:green\">" + d3.format("$,")(d.data.contri_align_r) + "</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:red\">" + d3.format("$,")(d.data.contri_unalign_r) + "</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:slategrey\">" + d3.format("$,")(d.data.contri_novote_r) + "</td>" +
                        "</tr>" +

                        "<tr>" +
                        "<td width=\"25%\" align=\"center\">Dem</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:green\">" + d3.format("$,")(d.data.contri_align_d) + "</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:red\">" + d3.format("$,")(d.data.contri_unalign_d) + "</td>" +
                        "<td class=\"tip contrib\" width=\"25%\" align=\"center\" style=\"color:slategrey\">" + d3.format("$,")(d.data.contri_novote_d) + "</td>" +
                        "</tr>" +
                        "</table>" +
                        "</div>"
                    )
                    /* d3.event.pageX gets the X,Y coordinates of the event relative to the whole document.
                       Used to position the tooltip box. */
                    //                    .style("left", (d3.event.pageX * 1.05) + "px")
                    //                    .style("top", (d3.event.pageY - 28) + "px");
                    .style("left", ((x(d.data.abv)) + 130) + "px")
                    .style("top", function () {
                        return (d3.event.pageY + 20) + "px";
                    });

                d3.select(".tip.status")
                    .style("color", function () {
                        // Format status of policy
                        if (d.data.status == "Became Law") {
                            //d3.select(".tip.status").style("color", "green");
                            return "green";
                        } else {
                            //d3.selectAll(".tip.status").style("color", "red");
                            return "red";
                        }
                    });

            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "-0.15em")
            .attr("transform", "rotate(-45)")
            .attr("font-size", "14px");

        g.append("text")
            .attr("transform", "translate(" + (width + 5) + "," + (height + 5) + ")")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .text("Policies (2015 to 2017)");

        g.append("g")
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

        legend_count = ["Republicans who voted in favor of lobby", "Republicans who voted against lobby", "Lobbied Republicans who did not vote", "Republicans who were not lobbied", "Democrats who were not lobbied", "Lobbied Democrats who did not vote", "Democrats who voted against lobby", "Democrats who voted in favor of lobby"];
        legend_contri = ["Avg.Contribution to Republicans who voted in favor of lobby", "Avg.Contribution to Republicans who voted against lobby", "Avg.Contribution to Republicans who did not vote", "Avg.Contribution to Democrats who voted in favor of lobby", "Avg.Contribution to Democrats who voted against lobby", "Avg.Contribution to Democrats who did not vote"];
        legend_total = ["Total Contributions to Republicans", "Total Contributions to Democrats"];

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys_count.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(20," + i * 30 + ")";
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

//Number of Republicans who voted in favor of lobby, Avg.Contribution to Republicans who voted in favor of lobby, Number of Republicans who voted against lobby, Avg.Contribution to Republicans who voted against lobby, Number of Republicans who did not vote, Avg.Contribution to Republicans who did not vote, Total Contributions to Republicans, Number of Democrats who voted in favor of lobby, Avg.Contribution to Democrats who voted in favor of lobby, Number of Democrats who voted against lobby, Avg.Contribution to Democrats who voted against lobby, Number of Democrats who did not vote, Avg.Contribution to Democrats who did not vote, Total Contributions to Democrats
