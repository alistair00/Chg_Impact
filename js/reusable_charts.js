


function brush_bar_chart() {
    //REUSABLE brush bar chart


    var x_var="",
        y_var="",
        width=0,
        height=0,
        height_2=0,
        my_data = [],
        focus_data = [],
        brush_height = 80,
        margin_bottom = 30,
        start_plus = 3,
        start_width = 8,
        context="",
        focus="";

    //core functionality copied from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
    function my(svg) {

        //define responsive margins.
        var margin = {top: 20, right: 20, bottom: brush_height+margin_bottom, left: 40};
        var margin_2 = {top: height  - brush_height, right: 20, bottom: 30, left: 40};
        //set width and heights
        width = width - margin.left - margin.right;
        height_2 = height - margin_2.top - margin_2.bottom;
        height = height - margin.top - margin.bottom;

        //set scales
        var x_scale = d3.scaleTime().range([0, width]);
        var x2_scale = d3.scaleTime().range([0, width]);
        var y_scale = d3.scaleLinear().range([height, 0]);
        var y2_scale = d3.scaleLinear().range([height_2, 0]);

        //set axes
        var x_axis = d3.axisBottom(x_scale);
        var x_axis_2 = d3.axisBottom(x2_scale);
        var y_axis = d3.axisLeft(y_scale);

        //set initial scales
        x_scale.domain(d3.extent(my_data, function(d) { return d[x_var] }));
        y_scale.domain([0, d3.max(my_data, function(d) { return d[y_var]; })]);
        x2_scale.domain(x_scale.domain());
        y2_scale.domain(y_scale.domain());

        //set colour scale
        var colour_scale = d3.scaleThreshold()
            .range(["#6b486b", "#7b6888", "#8a89a6", "#a3a2C4", "#a05d56", "#d0743c", "#ffb53d", "#ffcd5e"])
            .domain([5,9,13,17,21,25,29]);

        //set brush and zoom;
        var brush = d3.brushX()
            .extent([[0, 0], [width, height_2]])
            .on("brush end", brushed);

        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);


        //set once only items
        if(d3.select(".content")._groups[0][0] == null){

            //clip path - enabled in css
            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            //context - which is the brush chart group.
            context = svg.append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + margin_2.left + "," + margin_2.top + ")");

            //x_axis, bar group and brush
            context.append("g").attr("class", "axis axis--x");
            context.append("g").attr("class", "bar_group");
            context.append("g").attr("class", "brush");

            //now append zoom - needs to be below 'focus' rects otherwise tooltips won't work
            svg.append("rect").attr("class", "zoom");

            //focus - top bars
            focus = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            focus.append("g").attr("class", "axis axis--x");
            focus.append("g").attr("class", "axis axis--y");
            focus.append("g").attr("class", "bar_group")
        } else {
            focus = svg.select(".focus");
            context = svg.select(".context");
        }

        //now for the bars.

        //first the the context (brush bars)

        var my_group = context.select(".bar_group").selectAll(".context_bar_group")
                              .data(my_data);

        my_group.exit().remove();
        //enter new groups
        var enter = my_group.enter().append("g").attr("class","context_bar_group");
        //append
        enter.append("rect").attr("class","context_rect");
        //merge
        my_group = my_group.merge(enter);

        update_rects(my_group.select(".context_rect"),x2_scale,y2_scale, height_2);

        //now the focus (top chart bars)
        var focus_group = focus.select(".bar_group").selectAll(".focus_bar_group")
            .data(focus_data);

        focus_group.exit().remove();
        //enter new groups
        var focus_enter = focus_group.enter().append("g").attr("class","focus_bar_group");
        //append
        focus_enter.append("rect").attr("class","focus_rect");
        //merge
        focus_group = focus_group.merge(focus_enter);

        update_sub_rects(focus_group.select(".focus_rect"),x_scale,y_scale);

        //set the axes, brush and zoom
        focus.select(".axis--x")
            .call(x_axis)
            .attr("transform", "translate(0," + height + ")");

        focus.select(".axis--y")
            .call(y_axis);

        context.select(".axis--x")
            .call(x_axis_2)
            .attr("transform", "translate(0," + height_2 + ")");

        context.select(".brush")
            .call(brush)
            .call(brush.move, x_scale.range());

        svg.select(".zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);


        //and finally set the default start for the brush.
        //see vars above - start_plus currently === 3, start_width currently === 8, as specified in requirements
        var start_brush = x_scale(d3.timeMonth.offset(x_scale.domain()[0],start_plus));
        var end_brush = x_scale(d3.timeMonth.offset(x_scale.domain()[0],(start_plus + start_width)));

        context.select(".brush").call(brush.move, [start_brush,end_brush]);

        //brush function.
        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2_scale.range();

            x_scale.domain(s.map(x2_scale.invert, x2_scale));

            update_sub_rects(focus_group.select(".focus_rect"),x_scale,y_scale);

            focus.select(".axis--x").call(x_axis);
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        //zoom function
        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;

            x_scale.domain(t.rescaleX(x2_scale).domain());
            update_sub_rects(focus_group.select(".focus_rect"),x_scale,y_scale);

            focus.select(".axis--x").call(x_axis);
            context.select(".brush").call(brush.move, x_scale.range().map(t.invertX, t));
        }


        function update_rects(rect_group,my_x_scale,my_y_scale,my_height){
            //brush rects (static after initial load)
            //width === no.of days in the month - 2px
            rect_group.attr("id", (d,i) => i)
                      .attr("x",d => my_x_scale(d[x_var]) + 1)
                      .attr("y", d => my_height - my_y_scale(d[y_var]))
                      .attr("height", d => my_y_scale(d[y_var]))
                      .attr("width",d => x_scale(d3.timeDay.offset(x_scale.domain()[0],d.days)) - 2)
                      .attr("fill","#6b486b")
                      .attr("stroke-width","0px");
        }

        function update_sub_rects(rect_group,my_x_scale,my_y_scale){

            //top chart rects (reset when zooming and brushing)
            //width === no.of days in the month - 2px
            //fill adds 16 when p_type === "LTIP" so that the scales run smoothly from top to bottom
            rect_group.attr("x",d => my_x_scale(new Date(d[x_var])) + 1)
                      .attr("id", d => "p" + strip_space_comma(d.p_name) )
                      .attr("y", d => my_y_scale(d.position))
                      .attr("height", y_scale(y_scale.domain()[1]-1)-2)
                      .attr("width",d => x_scale(d3.timeDay.offset(x_scale.domain()[0],d.days)) - 2)
                      .attr("fill", d => colour_scale(d.inference + get_colour_multiplier(d.p_type)))
                      .attr("stroke-width","0px")
                      .on("mouseover",function(d){
                            //pointer cursor, highlight other bars for this project (see id)
                            d3.select("this").attr("cursor","pointer");
                            d3.selectAll(".focus_rect").attr("opacity",0.5);
                            d3.selectAll("#" + this.id).attr("opacity",1);

                            //tooltip text - see CSS for look and feel
                            var tooltip_text = "<strong>Project Name: </strong>" + d.p_name + "<br>"
                                + "<strong>Impacted groups: </strong>" + d.impact_g + "<br>"
                                + "<strong>Impact (1-5): </strong>" + d.impact + "<br>"
                                + "<strong>Inference: </strong>" + d.inference + "<br>"
                                + "<strong>Next Action: </strong>" + d.next_action + "<br><br>"
                                + "CLICK for more";

                            //show tooltip
                            d3.select(".tooltip")
                                .style("visibility","visible")
                                .style("top",(d3.event.y - 20) + "px")
                                .style("left",(d3.event.x + 15) + "px")
                                .html(tooltip_text)
                        })
                      .on("mouseout",function(){
                            //return to normal
                            d3.select("this").attr("cursor","default");
                            d3.selectAll(".focus_rect").attr("opacity",1);
                            d3.select(".tooltip").style("visibility","hidden")
                      })
                      .on("click",function(d){window.open(d.url)});

         function get_colour_multiplier(my_type){
                //see above
                if(my_type === "LTIP"){
                    return 16
                } else {
                    return 0
                }
            }
        }

        function strip_space_comma(my_txt){

            //remove commas and spaces - for ids..
            my_txt = my_txt.replace(/\s/g, "");
            my_txt = my_txt.replace(/,/g, "");
            my_txt = my_txt.replace(/\./g, "");
            my_txt = my_txt.replace(/#/g, "");
            my_txt = my_txt.replace(/-/g, "");

            return my_txt;
        }

    }


    my.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    };

    my.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return my;
    };

    my.height_2 = function(value) {
        if (!arguments.length) return height_2;
        height_2 = value;
        return my;
    };


    my.my_data = function(value) {
        if (!arguments.length) return my_data;
        my_data = value;
        return my;
    };

    my.focus_data = function(value) {
        if (!arguments.length) return focus_data;
        focus_data = value;
        return my;
    };

    my.x_var = function(value) {
        if (!arguments.length) return x_var;
        x_var = value;
        return my;
    };

    my.y_var = function(value) {
        if (!arguments.length) return y_var;
        y_var = value;
        return my;
    };


    return my;
}

