#zive
A ZCL framework for zigbee applications.  

[![NPM](https://nodei.co/npm/zive.png?downloads=true)](https://nodei.co/npm/zive/)  

[![Build Status](https://img.shields.io/travis/zigbeer/zive/master.svg?maxAge=2592000)](https://travis-ci.org/zigbeer/zive)
[![npm](https://img.shields.io/npm/v/zive.svg?maxAge=2592000)](https://www.npmjs.com/package/zive)
[![npm](https://img.shields.io/npm/l/zive.svg?maxAge=2592000)](https://www.npmjs.com/package/zive)

## Table of Contents  

1. [Overview](#Overview)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  
4. [APIs](#APIs)  
5. [License](#License)  

<a name="Overview"></a>
## 1. Overview  

**zive** is a Class that helps you create a _ZigBee Application_. With **zive**, you just need to prepare the ZCL Clusters of your _ZigBee Application_, and it will handle all ZCL messages automatically without the need to deal with by yourself.

<br />

<a name="Installation"></a>
## 2. Installation  

> $ npm install zive --save  

<br />

<a name="Usage"></a>
## 3. Usage  

Here is a quick example to show you how to create your ZigBee Application:  

```js
// Import the Zive Class
var Zive = require('zive');

// Prepare your endpoint information
var epInfo = {
        profId: 260,  // 'HA'
        devId: 257,   // 'dimmableLight'
        discCmds: []
    };

// Prepare your clusters and initialize with its attributes, access control flags, etc.
var Ziee = require('ziee'),
    ziee = new Ziee();

ziee.init('lightingColorCtrl', 'dir', ...);
ziee.init('lightingColorCtrl', 'attrs', ...);
ziee.init('lightingColorCtrl', 'acls', ...);
ziee.init('lightingColorCtrl', 'cmds', ...);

// New a zive instance to be your ZigBee Application
var zive = new Zive(epInfo, ziee);
```

<br />

<a name="APIs"></a>
## 4. APIs  

* [new Zive()](#API_zive)  
* [foundation()](#API_found)  
* [functional()](#API_func)  

*************************************************
## Zive Class
Exposed by `require('zive')`.  

<a name="API_zive"></a>
### new Zive(epInfo, clusters)
Create a new instance of `Zive` class. This document will use `zive` to denote the instance of this class. A `zive` represents a _ZigBee Application_.  

**Arguments:**  

1. `epInfo` (_Object_): Endpoint information. The following table shows the `epInfo` properties.
2. `clusters` (_Object_): ZCL Clusters. Please refer to [ziee](https://github.com/zigbeer/ziee) for how to create clusters in your application.

| Property | Type   | Mandatory | Description           |
|----------|--------|-----------|-----------------------|
| profId   | Number | required  | Profile ID            |
| devId    | Number | required  | Device ID             |
| discCmds | Array  | optional  | Discoverable Commands |

**Returns**  

* (_Object_): zive

**Example:**  

```js
var Zive = require('zive'),
    Ziee = require('ziee');

var epInfo = {
        profId: 260,  // 'HA'
        devId: 257,   // 'dimmableLight'
        discCmds: []
    },
    ziee = new Ziee();

ziee.init(...);

var zive = new Zive(epInfo, ziee);
```

*************************************************
<a name="API_found"></a>
### foundation(dstAddr, dstEpId, cId, cmd, zclData[, cfg], callback)  
Send ZCL foundation command to another endpoint. Response will be passed through second argument of the callback.  

**Arguments:**  

1. `dstAddr` (_String_ | _Number_): Address of the destination device. Ieee address if `dstAddr` is given with a string, or network address if it is given with a number.  
2. `dstEpId` (_Number_): The endpoint id of the destination device.  
3. `cId` (_String_ | _Number_): [Cluster id](https://github.com/zigbeer/zcl-id#Table), i.e. `'genBasic'`, `0`, `'genOnOff'`, `6`.  
4. `cmd` (_String_ | _Number_): [ZCL foundation command id](https://github.com/zigbeer/zcl-packet#FoundCmdTbl), i.e. `'read'`, `0`, `'discover'`, `12`.  
5. `zclData` (_Object_ | _Array_): zclData, which depends on the specified command. depending on the given command. Please see [ZCL Foundation Command Reference Tables](https://github.com/zigbeer/zcl-packet#FoundCmdTbl) for `zclData` format of different foundation command.  
6. `cfg` (_Object_): The following table shows the `cfg` properties.  
    - `manufSpec` (_Number_): Tells if this is a manufacturer-specific command. Default is `0`.  
    - `direction` (_Number_): Tells whether a command is sent from client-to-server (c2s) or from server-to-client (s2c). Default is `1` to send command from server-to-client.  
    - `disDefaultRsp` (_Number_): Disable default response. Default is `0` to enable the default response.  
7. `callback` (_Function_): `function (err, rsp) { }`. Please refer to [**Payload** in foundation command table](https://github.com/zigbeer/zcl-packet#FoundCmdTbl) to learn more about the `rsp` object.  

**Returns**  

* (_None_)

**Example:**  

```js
zive.foundation(0x1234, 1, 'genBasic', 'read', [ { attrId: 3 }, { attrId: 4 } ], function (err, rsp) {
    if (!err)
        console.log(rsp);
// [
//     {
//         attrId: 3,     // hwVersion
//         status: 0,     // success
//         dataType: 32,  // uint8
//         attrData: 0
//     },
//     {
//         attrId: 4,     // manufacturerName
//         status: 0,     // success
//         dataType: 66,  // charStr
//         attrData: 'TexasInstruments'
//     }
// ]
});
```

*************************************************
<a name="API_func"></a>
### functional(dstAddr, dstEpId, cId, cmd, zclData[, cfg], callback)  
Send ZCL functional command to another endpoint. The response will be passed to the second argument of the callback.  

**Arguments:**  

1. `dstAddr` (_String_ | _Number_): Address of the destination device. Ieee address if `dstAddr` is given with a string, or network address if it is given with a number.  
2. `dstEpId` (_Number_): The endpoint id of the destination device.  
3. `cId` (_String_ | _Number_): [Cluster id](https://github.com/zigbeer/zcl-id#Table).  
4. `cmd` (_String_ | _Number_):[ZCL functional command id](https://github.com/zigbeer/zcl-packet#FuncCmdTbl).  
5. `zclData` (_Object_ | _Array_): zclData depending on the given command. Please see [ZCL Functional Command Reference Table](https://github.com/zigbeer/zcl-packet#FuncCmdTbl) for `zclData` format of different functional command.  
6. `cfg` (_Object_): The following table shows the `cfg` properties.  
    - `manufSpec` (_Number_): Tells if this is a manufacturer-specific command. Default is `0`.  
    - `direction` (_Number_): Tells whether a command is sent from client-to-server (c2s) or from server-to-client (s2c). Default is `1` to send command from server-to-client.  
    - `disDefaultRsp` (_Number_): Disable default response. Default is `0` to enable the default response.  
7. `callback` (_Function_): `function (err, rsp) { }`. Please refer to [**Arguments** in functional command table](https://github.com/zigbeer/zcl-packet#FuncCmdTbl) to learn more about the functional command `rsp` object.  

**Returns**  

* (_None_)

**Example:**  

```js
zive.functional('0x00124b0001ce4beb', 1, 'lightingColorCtrl', 'moveHue', { movemode: 20, rate: 50 }, function (err, rsp) {
    if (!err)
        console.log(rsp);
// This example receives a 'defaultRsp'
// {
//     cmdId: 2,
//     statusCode: 0
// }
});
```

<a name="License"></a>
## 5. License  

The MIT License (MIT)

Copyright (c) 2016 
Hedy Wang <hedywings@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
