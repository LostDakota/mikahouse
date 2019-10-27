const APP = require('express')();
let Security = require('../models/Security');
let fs = require('fs');

let promises = [
    Security.CurrentImages(),
    Security.DaysWithEvents(),
    Security.IsMotionRunning(),
    Security.TodaysEventCount()
]

APP.get('/api/security/video/:id', (req, res) => {
    Security.Video(req.params.id)
        .then(response => {
            const stat = fs.statSync(response[0].filename);
            const fileSize = stat.size;
            const range = req.headers.range;
            if(range){
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : fileSize - 1;
                const chunkSize = (end - start) + 1;
                const file = fs.createReadStream(response[0].filename, {start, end});
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'video/mp4'
                };
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4'
                };
                res.writeHead(200, head);
                fs.createReadStream(response[0].filename).pipe(res);
            }
        })
})

APP.get('/api/security', (req, res) => {
    Promise.all(promises)
        .then(response => {
            res.json({
                cameras: response[0],
                days: response[1],
                status: response[2],
                eventCount: response[3]
            });
        });
});

APP.get('/api/security/motion', (rea, res) => {
    Security.LastFromMotion()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/lastevent', (req, res) => {
    Security.LastEvent()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/todaysevents/:day', (req, res) => {
    Security.TodaysEvents(req.params.day)
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/todayseventcount', (req, res) => {
    Security.TodaysEventCount()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/days', (req, res) => {
    Security.DaysWithEvents()
        .then(response => {
            res.json(response);
        });
});

APP.get('/api/security/status', (req, res) => {
    Security.IsMotionRunning()
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            res.json(err);
        });
});

APP.get('/api/security/camera/:id', (req, res) => {
    Security.CurrentImage(req.params.id)
        .then(response => {
            res.send(response);
        });
});

APP.get('/api/security/cameras', (req, res) => {
    Security.CurrentImages()
        .then(response => {
            res.send(response);
        });
});

APP.get('/api/security/state', (req, res) => {
    Security.ToggleState()
        .then(response => {
            res.json(response);
        });
});

module.exports = APP;