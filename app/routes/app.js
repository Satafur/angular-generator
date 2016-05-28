/**
 * Created by Ricardo on 24/05/2016.
 */
var myApp = angular.module('myApp', [
    'ngRoute'
]);

myApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'app/views/home.html',
            controller: 'MainCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
    }]);