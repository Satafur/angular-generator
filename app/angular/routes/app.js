/**
 * Created by Ricardo on 24/05/2016.
 */
(function () {
    'use strict';
    angular.module('myApp', [
        'ngRoute',
        'ngMaterial']);

    function config ($locationProvider, $routeProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html'
               }).
            otherwise({
                redirectTo: '/'
            });
    }
    angular
        .module('myApp')
        .config(config);
})();
