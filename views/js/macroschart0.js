var macrosApp = angular.module('macrosApp', []);
function macrosCtrl($scope, $http){
  $http.get('../macrosdata.json').success(function(data) {
    $scope.macrosrepetition = data;
  }).error(function(data, status) {
    alert('Error Retrieving Macros Data');
  });
  
 }

var foodApp = angular .module('foodApp', []);
function foodCtrl($scope, $http){
  $http.get('../mealsdata0.json').success(function(data) {
    $scope.foodrepetition0 = data;
  }).error(function(data, status) {
    alert('Error Retrieving Food Data');
  });

  $http.get('../mealsdata1.json').success(function(data) {
    $scope.foodrepetition1 = data;
  }).error(function(data, status) {
    alert('Error Retrieving Food Data');
  });

  $http.get('../mealsdata2.json').success(function(data) {
    $scope.foodrepetition2 = data;
  }).error(function(data, status) {
    alert('Error Retrieving Food Data');
  });

  $http.get('../mealsdata3.json').success(function(data) {
    $scope.foodrepetition3 = data;
  }).error(function(data, status) {
    alert('Error Retrieving Food Data');
  });
  
 }