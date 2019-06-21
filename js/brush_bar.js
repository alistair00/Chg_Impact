d3.json("data/" + brush_bar.filename, function(my_data){

    //workaround to handle the fact that there are duplicate keys and the
    //first entry should be "chg01".

    var chart_data = get_data(my_data);

    //draw svgs (photo and charts)
    var chart_div = document.getElementById("chart_div");

    var height = chart_div.clientHeight;
    var width = chart_div.clientWidth;

    if(d3.select(".chart_div_svg")._groups[0][0] === null){
        //draw svg to div height and width
        var svg = d3.select("#chart_div")
            .append("svg")
            .attr("class","chart_div_svg")
            .attr("id","chart_div_svg")
            .attr("width",width)
            .attr("height",height);
    }

    var my_chart = brush_bar_chart()
        .width(width)
        .height(height)
        .my_data(chart_data.brush)
        .focus_data(chart_data.chart)
        .x_var("date")
        .y_var('no_of_entries');

    my_chart(svg);


    function get_data(){

        //CHART
        //x_axis === months (as defined by zoom)
        //y_axis === number of values
        //data = one record per entry (ie potential multiple entries per project if start date & close date span several months

        //BRUSH
        //x_axis === months (start to finish months)
        //y_axis === number of values
        //data = one record per month

        var nest = d3.nest()
            .key(d => d.chg01)
            .entries(my_data);

        var chart_data = [],month_data=[];

        for(var n in nest){
            var months = d3.timeMonth.range(get_date(nest[n].values[0].chg0a), new Date(get_date(nest[n].values[0].chg0b)));
            for(var m in months){
                month_data.push({
                    "date": months[m],
                    "p_name": nest[n].values[0].chg01,
                    "p_type": nest[n].values[0].chg02,
                    "inference": nest[n].values[0].chg09,
                    "next_action":nest[n].values[0].chg0c,
                    "url": nest[n].values[0].chg0e
                })
            }
        }
        var month_nest = d3.nest()
            .key(d => d.date)
            .entries(month_data);

        var brush_data = [];
        for(var m in month_nest){
            brush_data.push({
                "date": new Date(month_nest[m].key),
                "no_of_entries": month_nest[m].values.length,
                "days": get_days(new Date(month_nest[m].key))
            });
            month_nest[m].values.sort((a,b) => d3.ascending(a.p_type,b.p_type) || d3.descending(a.inference,b.inference));
            for(var v in month_nest[m].values){
                var colour_multiplier = 0;
                if(month_nest[m].values[v].p_type === "LTIP"){
                    colour_multiplier =14
                }
                chart_data.push({
                    "p_name": month_nest[m].values[v].p_name,
                    "p_type": month_nest[m].values[v].p_type,
                    "inference": month_nest[m].values[v].inference,
                    "colour_inference":nest[n].values[0].chg09 + colour_multiplier,
                    "next_action":month_nest[m].values[v].next_action,
                    "url": month_nest[m].values[v].url,
                    "date": month_nest[m].key,
                    "days": get_days(new Date(month_nest[m].key)),
                    "position": month_nest[m].values.length - (+v),
                    "no_of_entries": month_nest[m].values.length
                })
            }
        }


        function get_date(my_date){
            //sample format "15/11/2021"
            my_date = my_date.split("/");
            var month = +my_date[1]-1;  //date months run from 0 (Jan) to 11 (Dec)
            //first calculate new date
            var new_date = new Date(my_date[2],month,my_date[0]);

            return new_date;
        }

        function get_days(my_date){
            my_date = new Date(my_date);
            var next_month = d3.timeMonth.offset(my_date,1);
            var days = d3.timeDay.count(my_date,next_month);


            return days;
        }

        return {"chart": chart_data.sort((a,b) => d3.ascending(a.date,b.date)),"brush": brush_data.sort((a,b) => d3.ascending(a.date,b.date))};


    }

});