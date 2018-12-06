var timeout = null;

app.controller('homeController', function($http, $q){
    var self = this;

    $http.get('/api/security/lastevent')
        .then(function(response){
            self.event = response.data;
        });

    $http.get('/api/users/list')
        .then(function(response){
            self.people = response.data;
        });

    $http.get('/api/server')
        .then(function(response){
            self.server = response.data;
        });

    $http.get('/api/media/newest/true')
        .then(function(response){
            self.newestshow = response.data;
        });

    $http.get('/api/events/3')
        .then(function(response){
            self.events = response.data;
        });
});

app.controller('mediaController', function($http){
    var self = this;

    self.grow = function(show){
        self.showModal = !self.showModal;
        self.modal = show;
    }

    $http.get('/api/media/movies')
        .then(function(response){
            self.movies = response.data;
        });

    $http.get('/api/media/newest')
        .then(function(response){
            self.shows = response.data;
        });

    $http.get('/api/media/nowplaying')
        .then(function(response){
            self.playing = response.data.MediaContainer;
        });
});

app.controller('controlsController', function($http){
    var self = this;

    self.range = new Array(50);

    $http.get('/api/control/thermostat')
        .then(function(response){
            self.thermostat = response.data;
            self.setNeedle();
            self.setCurrent();
        });

    self.change = function(degree){
        self.thermostat.target += degree;
        self.setNeedle();
        if(self.timeout !== null){
            window.clearTimeout(self.timeout);
        }
        self.timeout = window.setTimeout(function(){
            $http.post('/api/control/thermostat/' + self.thermostat.target)
        }, 10000);
    }

    self.setCurrent = function(){
        var current = jQuery('.current');
        var put = 50 + ((self.thermostat.current - 70) * 5);
        current.css({
            left: put + '%'
        });
    }
    
    self.setNeedle = function(){
        var needle = jQuery('.needle');
        var half = 70;
        var current  = self.thermostat.target;
        var set = 50 + ((current - half) * 5)
        needle.css({
            left: set + '%'
        })
    }

    self.garage = function(){
        $http.get('/api/control/garage')
            .then(function(response){
                console.log(response.status);
            });
    }
});

app.controller('securityController', function($http){
    var self = this;

    function status(){
        $http.get('/api/security/status')
        .then(function(response){
            self.status = response.data;
        });
    }

    self.getDay = function(day){
        $http.get('/api/security/todaysevents/' + day)
            .then(function(response){
                self.events = response.data;
            });
    }

    self.getDay();

    $http.get('/api/security/todayseventcount')
        .then(function(response){
            self.todayseventcount = response.data;
        })    

    $http.get('/api/security/camera/1')
        .then(function(response){
            self.cam1 = response.data;
        });

    $http.get('/api/security/camera/2')
        .then(function(response){
            self.cam2 = response.data;
        });

    $http.get('/api/security/days')
        .then(function(response){
            self.days = response.data;
        });

    self.toggle = function(){
        jQuery('#toggle-security').removeClass('fa-ban')
        jQuery('#toggle-security').removeClass('fa-video-camera')
        jQuery('#toggle-security').addClass('fa-repeat')
        jQuery('#toggle-security').addClass('fa-spin')
        $http.get('/api/security/state')
            .then(function(response){
                jQuery('#toggle-security').removeClass('fa-repeat')
                jQuery('#toggle-security').removeClass('fa-spin');
                status();
            });
    }

    status();
});

app.controller('servicesController', function($http){
    var self = this;

    $http.get('/api/server')
        .then(function(response){
            self.server = response.data;
        });

    $http.get('/api/server/drives')
        .then(function(response){
            self.drives = response.data;
        });

    $http.get('/api/server/network')
        .then(function(response){
            self.devices = response.data;
        });
});

app.controller('eventController', function($http){
    var self = this;

    $http.get('/api/events')
        .then(function(response){
            self.items = response.data
        })
})

app.filter('fromTimestamp', function(){
    return function(timestamp){
        var date = moment(timestamp).format("dddd, MMMM Do YYYY h:mm a");
        return(date);
    }
})

app.filter('normalizeTime', function(){
    return function(timestamp){
        return(moment.unix(timestamp).format("dddd, MMMM Do YYYY h:mm a"));
    }
});

app.filter('fromNow', function(){
    return function(timestamp){
        return(moment.unix(timestamp).fromNow());
    }
});