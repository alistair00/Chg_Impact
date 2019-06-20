


function brush_bar_chart() {
    //REUSABLE aster chart


    var x_var="",
        y_var="",
        width=0,
        height=0,
        height_2=0,
        my_data = [],
        brush_height = 80,
        margin_bottom = 30;


    function my(svg) {

        //core functionality copied from https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
        //responsive margins.
        var margin = {top: 20, right: 20, bottom: brush_height+margin_bottom, left: 40};
        var margin_2 = {top: height  - brush_height, right: 20, bottom: 30, left: 40};

        width = width - margin.left - margin.right;
        height_2 = height - margin_2.top - margin_2.bottom;
        height = height - margin.top - margin.bottom;

        var x_scale = d3.scaleTime().range([0, width]);
        var x2_scale = d3.scaleTime().range([0, width]);
        var y_scale = d3.scaleLinear().range([height, 0]);
        var y2_scale = d3.scaleLinear().range([height_2, 0]);

        var x_axis = d3.axisBottom(x_scale);
        var x_axis_2 = d3.axisBottom(x2_scale);
        var y_axis = d3.axisLeft(y_scale);

        var brush = d3.brushX()
            .extent([[0, 0], [width, height_2]])
            .on("brush end", brushed);

        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        var area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x_scale(d[x_var]); })
            .y0(height)
            .y1(function(d) { return y_scale(d[y_var]); });

        var area_2 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x2_scale(d[x_var]); })
            .y0(height_2)
            .y1(function(d) { return y2_scale(d[y_var]); });

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin_2.left + "," + margin_2.top + ")");


        x_scale.domain(d3.extent(my_data, function(d) { return d[x_var]; }));
        y_scale.domain([0, d3.max(my_data, function(d) { return d[y_var]; })]);
        x2_scale.domain(x_scale.domain());
        y2_scale.domain(y_scale.domain());

        focus.append("path")
            .datum(my_data)
            .attr("class", "area")
            .attr("d", area);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(y_axis);

        context.append("path")
            .datum(my_data)
            .attr("class", "area")
            .attr("d", area_2);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height_2 + ")")
            .call(x_axis_2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x_scale.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || x2_scale.range();
            x_scale.domain(s.map(x2_scale.invert, x2_scale));
            focus.select(".area").attr("d", area);
            focus.select(".axis--x").call(x_axis);
            svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
            var t = d3.event.transform;
            x_scale.domain(t.rescaleX(x2_scale).domain());
            focus.select(".area").attr("d", area);
            focus.select(".axis--x").call(x_axis);
            context.select(".brush").call(brush.move, x_scale.range().map(t.invertX, t));
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

