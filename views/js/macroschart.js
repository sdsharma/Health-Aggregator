var macrosApp = angular.module('macrosApp', []);
function macrosCtrl($scope, $http){
  $http.get('../macrosdata.json').success(function(data) {
    $scope.macrosrepetition = data;
  }).error(function(data, status) {
    alert('Error Retrieving Macros Data');
  });
  
 }  