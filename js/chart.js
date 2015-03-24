var ceres = new Asteroid('oaaas.meteor.com');

ceres.on('connected', function () {
    console.log('ceres connected');
});

ceres.subscribe('getIntegrationDataForDDP', 'HNcHW7wRKiw6MBEvE');

var lightCollection = ceres.getCollection('IntegrationData');

var reactiveQuery = lightCollection.reactiveQuery({});

reactiveQuery.on('change', function (changedItemId) {
    console.log(changedItemId);
    var lightData = lightCollection._set._items[changedItemId];

    console.log(lightData);

    var data = [
        lightData.data['12'],
        lightData.data['13'],
        lightData.data['14'],
        lightData.data['15'],
        lightData.data['16'],
        lightData.data['17'],
        lightData.data['18']
    ];

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

    var seriesIndex = 0;

    var keys = [
        '12:00 - 12:59',
        '13:00 - 13:59',
        '14:00 - 14:59',
        '15:00 - 15:59',
        '16:00 - 16:59',
        '17:00 - 17:59',
        '18:00 - 18:59'
    ];

    var colors = [
        '#00ffff',
        '#ff00ff',
        '#00ff00',
        '#ffff00',
        '#0000ff',
        '#000000',
        '#ff0000'
    ];

    function convertToD3Series(coordinateSeries) {
        var series = [];

        for (var i = 0; i < coordinateSeries.length; i++) {
            var singleSeries = coordinateSeries[i];

            series.push({
                values: singleSeries,
                key: '' + keys[seriesIndex],
                color: colors[seriesIndex]
            });

            seriesIndex++;
        }

        return series;
    }
}
/**/
