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

        var chart_data = [];
        for(var n in nest){
            var months = d3.timeMonth.range(get_date(nest[n].values[0].chg0a), new Date(get_date(nest[n].values[0].chg0b)));
            for(var m in months){
                //giving vars more user friendly names so easier when coding..
                //filtering out all v.2 variables
                chart_data.push({
                    "p_name": nest[n].values[0].chg01,
                    "p_type": nest[n].values[0].chg02,
                    "inference": nest[n].values[0].chg09,
                    "next_action":nest[n].values[0].chg0c,
                    "url": nest[n].values[0].chg0e,
                    "date": new Date(months[m])
                })
            }
        }
        var month_nest = d3.nest()
            .key(d => d.date)
            .entries(chart_data);

        var brush_data = [];
        for(var m in month_nest){
            brush_data.push({
                "date": new Date(month_nest[m].key),
                "no_of_entries": month_nest[m].values.length
            });
        }

        function get_date(my_date){
            //sample format "15/11/2021"
            my_date = my_date.split("/");
            return new Date(my_date[2],+my_date[1]-1,my_date[0])
        }


        return {"chart": chart_data.sort((a,b) => d3.ascending(a.date,b.date)),"brush": brush_data.sort((a,b) => d3.ascending(a.date,b.date))};


    }

});