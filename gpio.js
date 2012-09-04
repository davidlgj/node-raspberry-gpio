/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    
    Copyright 2012 David Jensen
*/

var fs = require('fs');

//Available pins (GPIO nr)  0, 1, 4, 7, 8, 9, 10, 11, 14, 15, 17, 18, 21, 22, 23, 24, 25

exports.HIGH = true;
exports.LOW  = false;
exports.OUT  = 'out';
exports.IN   = 'in';

/**
 * Unexport a GPIO
 */
exports.unexport = function (gpio,cb) {
    fs.writeFile('/sys/class/gpio/unexport',gpio,cb);
};

/**
 * Export a GPIO so that it can be used
 */
exports.export = function (gpio,cb) {
    fs.writeFile('/sys/class/gpio/export',gpio,cb);
};


/**
 * Checks if a GPIO is exported
 */
exports.exported = function (gpio,callback) {
     fs.stat('/sys/class/gpio/gpio'+gpio,function(err,stats){
        if (err) { //propbably a ENOENT
            callback(false);
        } else {
            callback(true);
        } 
     });
};


/**
 * Set mode, i.e. 'out' or 'in' of GPIO, must be exported first
 */
exports.mode = function (gpio,direction,cb) {
    fs.writeFile('/sys/class/gpio/gpio'+gpio+'/direction',direction,cb);
}


/**
 * Convinience function to setup a GPIO pin,
 * if already in use it will be unexported, exported and mode set
 */  
exports.setup = function (gpio,direction,callback) {
    //let's start by checking if it's already configured
    exports.exported(gpio,function(exists){
        if (exists) {
            //already configured let's unexport first
            exports.unexport(gpio,function(err){
                if (err) {
                    callback(err);
                } else {
                    exports.mode(gpio,direction,callback);
                }
            });
        } else {
            //just export and set mode
            exports.export(gpio,function(err){
                if (err) {
                    callback(err);
                } else {
                    exports.mode(gpio,direction,callback);
                }
            });
        }
    });
};    
    

/**
 * Set value of GPIO in mode 'out'
 */
exports.out = function(gpio,val,callback) {
    fs.writeFile('/sys/class/gpio/gpio'+gpio+'/value',val?1:0,callback);
};

/**
 * Set value of GPIO in mode 'out' to HIGH
 */
exports.high = function(gpio, callback) {
    exports.out(gpio,true,callback);
};

/**
 * Set value of GPIO in mode 'out' to LOW
 */
exports.low = function(gpio, callback) {
    exports.out(gpio,false,callback);
};


/**
 * Read value from GPIO pin with mode 'in'
 */
exports.read = function(gpio,callback) {
    fs.readFile('/sys/class/gpio/gpio'+gpio+'/value',callback);
};

/**
 * Check if GPIO with mode 'in' reads a HIGH
 */
exports.isHigh = function(gpio,callback) {
    exports.read(gpio,function(err,data) {
        callback(err,data === '1');
    });
};

/**
 * Check if GPIO with mode 'in' reads a LOW
 */
exports.isLow = function(gpio,callback) {
    exports.read(gpio,function(err,data) {
        callback(err,data !== '1');
    });
};



