$(function($http){
var macrosrepetition;
$http.get('../macrosdata.json').success(function(data) {
macrosrepetition = data[data.length-1];
Morris.Donut({
    element: 'morris-donut-chart',
    data: [{
        label: "Carbs",
        value: Number(macrosrepetition.carbs)
    }, {
        label: "Fat",
        value: Number(macrosrepetition.fat)
    }, {
        label: "Protein",
        value: Number(macrosrepetition.protein)
    }],

    colors: [ "#2577B5", "#CC0000", "#4DA74D"],
    resize: true
});
});
}).error(function(data, status) {
alert('Error Retrieving Macros Data');
});