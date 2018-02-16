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
    .when('/notifications', {
        title: 'Notifications',
        index: 7,
        templateUrl: '/templates/notifications.html'
    });

    $locationProvider.html5Mode(true);
}]);

app.controller('navController', function(){
    var self = this;

    this.items = [
        {title: 'Home', icon: 'fa-home', link: '/'},
        {title: 'Media', icon: 'fa-play-circle', link: '/media'},
        {title: 'Controls', icon: 'fa-lightbulb-o', link: '/controls'},
        {title: 'Security', icon: 'fa-video-camera', link: '/security'},
        {title: 'Services', icon: 'fa-database', link: '/services'},
        {title: 'Climate', icon: 'fa-sun-o', link: '/climate'},
        {title: 'Notifications', icon: 'fa-comment', link: '/notifications'}
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
        $rootScope.title = current.$$route.title;
        $rootScope.index = current.$$route.index;
    });
}]);

// $('.main-navigation, .buzz').on("click", function(e){
//     console.log('click fired');
//     window.navigator.vibrate(50);
// });

// if ('serviceWorker' in navigator && 'PushManager' in window) {
//     navigator.serviceWorker
//         .register('./service-worker.js')
//         .then(function() { 
//             console.log('Service Worker Registered');
//         });
// }