var app = angular.module('mikahouse', ['ngRoute', 'ngAnimate']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider.when('/', {
        title: 'Home',
        index: 1,
        templateUrl: '/templates/home.html'
    })
    .when('/media', {
        title: 'Media',
        index: 2,
        templateUrl: '/templates/media.html'
    })
    .when('/controls', {
        title: 'Controls',
        index: 3,
        templateUrl: '/templates/controls.html'
    })
    .when('/security', {
        title: 'Security',
        index: 4,
        templateUrl: '/templates/security.html'
    })
    .when('/services', {
        title: 'Services',
        index: 5,
        templateUrl: '/templates/services.html'
    })
    .when('/climate', {
        title: 'Climate',
        index: 6,
        templateUrl: '/templates/climate.html'
    })
    .when('/events', {
        title: 'Events',
        index: 7,
        templateUrl: '/templates/events.html'
    });    

    $locationProvider.html5Mode(true);
}]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('responseObserver');
});

app.factory('responseObserver', function responseObserver($q, $window) {
    return {
        'responseError': function(errorResponse) {
            switch (errorResponse.status) {
            case 403:
                $window.location = '/login';
                break;
            case 500:
                $window.location = './500.html';
                break;
            }
            return $q.reject(errorResponse);
        }
    };
});

app.controller('navController', function(){
    var self = this;

    self.items = [
        {title: 'Home', icon: 'fa-home', link: '/'},
        {title: 'Media', icon: 'fa-play-circle', link: '/media'},
        {title: 'Controls', icon: 'fa-lightbulb-o', link: '/controls'},
        {title: 'Security', icon: 'fa-video-camera', link: '/security'},
        {title: 'Services', icon: 'fa-database', link: '/services'},
        {title: 'Events', icon: 'fa-exclamation-circle', link: '/events'}
    ]
});

app.directive('fadeIn', function($timeout){
    return {
        restrict: 'A',
        link: function($scope, $element, attrs){
            $element.addClass('ng-hide-remove');
            $element.on('load', function(){
                $element.addClass("ng-hide-add");
            });
        }
    };
});

app.directive('buzz', function(){
    return {
        restrict: 'A',
        link: function($scope, $element, attrs){
            $element.on('click', function(e){
                window.navigator.vibrate(50);
            });
        }
    }
});

app.run(['$rootScope', function($rootScope){
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous){
        $rootScope.title = current.$$route.title || 'MikaHouse Automation';
        $rootScope.index = current.$$route.index;
    });
}]);

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker
        .register('../service-worker.js');
}