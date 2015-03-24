var asteroid = new Asteroid('oaaas.meteor.com');

asteroid.on('connected', function () {
    console.log('asteroid connected');
});

asteroid.subscribe('getIntegrationDataForDDP', 'HNcHW7wRKiw6MBEvE');

var lightCollection = asteroid.getCollection('IntegrationData');

var reactiveQuery = lightCollection.reactiveQuery({});

var seriesIndex = 0;

var keys = [];

reactiveQuery.on('change', function (changedItemId) {
    seriesIndex = 0;
    keys = [];

    var lightData = lightCollection._set._items[changedItemId];

    var fieldKeys = [];

    for (var fieldKey in lightData.data) {
        fieldKeys.push(fieldKey);
    }

    fieldKeys.sort();

    var data = [];

    for (var i = 0; i < fieldKeys.length; i++) {
        var key = fieldKeys[i];

        data.push(lightData.data[key]);
        keys.push(key + ':00 - ' + key + ':59');
    }

    addLineChart(data);
});

function convertRawDataToCoordinates(lightValues) {
    var dataPoints = [];

    for (var i = 0; i < lightValues.length; i++) {
        var lightValue = lightValues[i];
        dataPoints.push({
            x: i,
            y: parseFloat(lightValue) || -1
        });
    }
    return dataPoints;
}

function addLineChart(rawDataSeries) {
    var coordinateSeries = [];

    for (var i = 0; i < rawDataSeries.length; i++) {
        var rawData = rawDataSeries[i];
        coordinateSeries[i] = convertRawDataToCoordinates(rawData);
    }

    nv.addGraph(function () {
        var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
            ;

        chart.xAxis     //Chart x-axis settings
            .axisLabel('Time (minutes)')
            .tickFormat(d3.format(',r'));

        chart.yAxis     //Chart y-axis settings
            .axisLabel('Light intensity')
            .tickFormat(d3.format('.02f'));

        var d3Data = convertToD3Series(coordinateSeries);

        d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.
            .datum(d3Data)         //Populate the <svg> element with chart data...
            .call(chart);          //Finally, render the chart!

        //Update the chart when window resizes.
        nv.utils.windowResize(function () {
            chart.update()
        });

        return chart;
    });

    function convertToD3Series(coordinateSeries) {
        var series = [];

        for (var i = 0; i < coordinateSeries.length; i++) {
            var singleSeries = coordinateSeries[i];

            series.push({
                values: singleSeries,
                key: keys[seriesIndex]
            });

            seriesIndex++;
        }

        return series;
    }
}
/**/
