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

var gpio_map = {
    3:0, 
    5:1,
    7:4, 
    8:14,
    10:15,
    11:17,
    12:18,
    13:21,
    15:22, 
    16:23,
    18:24, 
    19:10, 
    21:9, 
    22:25, 
    23:11, 
    24:8,
    26:7
}


exports.HIGH = true;
exports.LOW  = false;


var translate_pin = function (pin) {
    if (!gpio_map[pin]) {
        throw "Unkown Pin nr";
    }
    return gpio_map[pin];
};


var unexport = function (pin,cb) {
    fs.writeFile('/sys/class/gpio/unexport',pin,cb);
};

var mode = function (pin,direction,cb) {
    fs.writeFile('/sys/class/gpio/export',pin,function(){
        fs.writeFile('/sys/class/gpio/gpio'+pin+'/direction',direction,cb);    
    });
}

exports.setup = function (rpi_pin,direction,callback) {
    var pin = translate_pin(rpi_pin);
    
    //let's start by checking if it's already configured
    fs.stat('/sys/class/gpio/gpio'+pin,function(stat){
        if (stat.code !== 'ENOENT') {
            //already configured let's unexport first
            unexport(pin,function(){
                mode(pin,direction,callback);
            });
        } else {
            //just export and set mode
            mode(pin,direction,callback);
        }
    });
};    
    

exports.out = function(rpi_pin,val,callback) {
    var pin = translate_pin(rpi_pin);
    
    fs.writeFile('/sys/class/gpio/gpio'+pin+'/value',val?1:0,callback);
};

exports.high = function(rpi_pin, callback) {
    exports.out(rpi_pin,true,callback);
};

exports.low = function(rpi_pin, callback) {
    exports.out(rpi_pin,false,callback);
};


exports.read = function(rpi_pin,callback) {
    var pin = translate_pin(rpi_pin);
    
    fs.readFile('/sys/class/gpio/gpio'+pin+'/value',function(err,data){
        callback(data);
    });
};

exports.isHigh = function(rpi_pin,callback) {
    exports.read(rpi_pin,function(data) {
        callback(data === '1');
    });
};

exports.isLow = function(rpi_pin,callback) {
    exports.read(rpi_pin,function(data) {
        callback(data !== '1');
    });
};



