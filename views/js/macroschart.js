var macrosApp = angular.module('macrosApp', []);
function macrosCtrl($scope, $http){
  $http.get('../macrosdata.json').success(function(data) {
    $scope.macrosrepetition = data;
  }).error(function(data, status) {
    alert('Error Retrieving Macros Data');
  });
  
 }

var foodApp = angular.module('foodApp', []);
function foodCtrl($scope, $http){
  $http.get('../mealsdata.json').success(function(data) {
    $scope.foodrepetition = data;
  }).error(function(data, status) {
    alert('Error Retrieving Food Data');
  });
  
 }