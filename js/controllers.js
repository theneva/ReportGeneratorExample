var app = angular.module('reportGenerator', []);

app.controller('GraphController', function ($scope, GraphService) {
    $scope.message = 'Hi from GraphController!';

    GraphService.getLightData()
        .success(function (lightData) {
            var data = [
                lightData.data['13'],
                lightData.data['14']
            ];

            console.log(data);

            GraphService.addLineChart(data);
        });

    //GraphService.getDummyData(function (data) {
    //    GraphService.addLineChart(data);
    //});
});

app.service('GraphService', function ($http) {
    this.getLightData = function () {
        return $http.get('http://oaaas.meteor.com/api/sensordata/HNcHW7wRKiw6MBEvE');
    };

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

    this.addLineChart = function (rawDataSeries) {
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

        var key = 0;

        var colors = [
            '#ff00ff',
            '#00ff00'
        ];

        function convertToD3Series(coordinateSeries) {
            var series = [];

            for (var i = 0; i < coordinateSeries.length; i++) {
                var singleSeries = coordinateSeries[i];

                series.push({
                    values: singleSeries,
                    key: '' + key,
                    color: colors[key]
                });

                key++;
            }

            return series;
        }
    };
});
