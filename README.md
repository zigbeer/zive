#zive


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

**zive** is a Class that helps you create a _Zigbee Application_, and it will handle all ZCL message for your _Zigbee Application_, with the need to deal with by yourself. 

<br />

<a name="Installation"></a>
## 2. Installation  

> $ npm install zive --save  

<br />

<a name="Usage"></a>
## 3. Usage  

Here is a quick example to show you how to create your Zigbee Application:  

```js 
// Import the Zive Class  
var Zive = require('zive');  

// Prepare your endpoint information and cluserts  
var epInfo = {  
        profId: 260,  
        devId: 6,  
        discCmds: []  
    };

// Prepare your clusters and initialize with its attributes, access control flags, .etc
var Ziee = require('ziee'),  
    ziee = new Ziee();  

ziee.init(cId, 'dir', ...);  
ziee.init(cId, 'attrs', ...);  
ziee.init(cId, 'acls', ...);  
ziee.init(cId, 'cmds', ...);  

// New a zive instance to be your Zigbee Application  
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
Exposed by require('zive').

<a name="API_zive"></a>
### new Zive(epInfo, clusters)

Create a new instance of Zive class. This document will use `zive` to indicate this kind of instance. A `zive` represents a _Zigbee Application_.  

**Arguments:**

1. `epInfo` (_Object_): Endpoint information. The following table shows the `epInfo` properties.
2. `clusters` (_Object_): ZCL Clusters. Plaese refer to [ziee](https://github.com/zigbeer/ziee) for how to create clusters in your application.

| Property | Type   | Mandatory | Description           |
|----------|--------|-----------|-----------------------|
| profId   | Nunber | required  | Profile ID            |
| devId    | Number | required  | Device ID             |
| discCmds | Array  | optional  | Discoverable Commands |

**Returns**

* (_Object_): zive

**Example:**

```js
var Zive = require('zive'),
    Ziee = require('ziee'), 
    
var epInfo = {  
        profId: 260,  
        devId: 6,  
        discCmds: []  
    },
    ziee = new Ziee();  

ziee.init(...);

var zive = new Zive(epInfo, ziee);
```

*************************************************
<a name="API_found"></a>
### foundation(dstAddr, dstEpId, cId, cmd, zclData[, cfg], callback)  

Send ZCL foundation command to other endpoint.  

**Arguments:**  

1. `dstAddr` (_Number_): Short address of the destination device.  
2. `dstEpId` (_Number_): Endpoint of the destination device.  
3. `cId` (_Number_ | _String_): Specifies the cluster ID.  
4. `cmd` (_String_ | _Number_): Foundation command ID.  
5. `zclData` (_Object_ | _Array_): ZCL data depending on the given command. Please see [ZCL Foundation Command Reference Tables](https://github.com/zigbeer/zcl-packet#31-zcl-foundation-command-reference-table) for `zclData` format of different foundation command.  
6. `cfg` (_Object_): The following table shows the `cfg` properties.  
7. `callback` (_Function_): `function (err, result) {}`. Get called when receive the response of foundation command.   

| Property      | Type  | Mandatory | Description              | Default value    |
|---------------|-------|-----------|--------------------------| ---------------- |
| manufSpec     | 1-bit | optional  | Manufacturer specific.   | 0                |
| direction     | 1-bit | optional  | Direction                | 1                |
| disDefaultRsp | 1-bit | optional  | Disable default response | 0                |

**Returns**

* (_None_)

**Example:**

```js
var foundData = [
        { attrId: 0x0000 }, 
        { attrId: 0x0001 }, 
        { attrId: 0x0008 },
        { attrId: 0x0010 }
    ];

zive.foundation(0x1234, 1, 'lightingColorCtrl', 'read', foundData, function (err, result) {
    if (err)
        console.log(err);
    else
        console.log(result);
});
```

*************************************************
<a name="API_func"></a>
### functional(dstAddr, dstEpId, cId, cmd, zclData[, cfg], callback)  

Send ZCL functional command to other endpoint.  

**Arguments:**  

1. `dstAddr` (_Number_): Short address of the destination device.  
2. `dstEpId` (_Number_): Endpoint of the destination device.  
3. `cId` (_Number_ | _String_): Specifies the cluster ID.  
4. `cmd` (_String_ | _Number_): Functional command ID.  
5. `zclData` (_Object_ | _Array_): ZCL data depending on the given command. Please see [ZCL Functional Command Reference Table](https://github.com/zigbeer/zcl-packet#FuncCmdTbl) for `zclData` format of different functional command.  
6. `cfg` (_Object_): The following table shows the `cfg` properties.  
7. `callback` (_Function_): `function (err, result) {}`. Get called when receive the response of functional command.   

| Property      | Type  | Mandatory | Description              | Default value    |
|---------------|-------|-----------|--------------------------| ---------------- |
| manufSpec     | 1-bit | optional  | Manufacturer specific.   | 0                |
| direction     | 1-bit | optional  | Direction                | 1                |
| disDefaultRsp | 1-bit | optional  | Disable default response | 0                |

**Returns**

* (_None_)

**Example:**

```js
var funcData = {
        movemode: 20,
        rate: 50
    }

zive.functional(0x1234, 1, 'lightingColorCtrl', 'moveToHue', funcData, function (err, result) {
    if (err)
        console.log(err);
    else
        console.log(result);
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
