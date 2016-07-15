var _ = require('busyman'),
    zclId = require('zcl-id');

/*************************************************************************************************/
/*** Zive Class                                                                                ***/
/*************************************************************************************************/
function Zive(profId, devId, clusters, dcmds) {
    // (ids, clusters, dcmds), ids: {profId, devId}

    this._simpleDesc = {}; 
    this.endpoint = null;
    this.discCmds = [];

    this.clusters = clusters;
    this._onZclFoundation = null;
    this._onZclFunctional = null;
   
    // {
    //     cId (oid): {
    //         dir (iid): 3,
    //         acls (iid): {},
    //         attrs (iid): {
    //             attrId: value
    //             attrId: {
    //                 read: function () {},
    //                 write: function () {}
    //             }
    //         },
    //         cmds (iid): {
    //             cmd1: function () {},
    //             cmd2: function () {}
    //         }
    //     }
    // }
}

Zive.prototype.handleFoundation = function (msg) {
    var data = msg.data,
        clusters = this.clusters,
        cmdName = zclId.foundation(msg.data.cmdId).key,
        foundationRsp = {
            frameCntl: {
                frameType: 1,
                manufSpec: data.frameCntl.manufSpec,
                direction: 1,
                disDefaultRsp: data.frameCntl.disDefaultRsp
            },
            manufCode: data.manufCode,
            seqNUm: data.seqNUm,
            cmdId: null,
            payload: null
        };
    // { groupid, clusterid, srcaddr, srcendpoint, dstendpoint, wasbroadcast, linkquality, securityuse, timestamp, transseqnumber, len, data }
    // data: { frameCntl: {frameType, manufSpec, direction, disDefaultRsp}, manufCode, seqNUm, cmdId, payload }


    switch (cmdName) {
        case 'read':
            // readRsp
            break;
        case 'write':
            // writeRsp
            break;
        case 'writeUndiv':
            // writeRsp
            break;
        case 'writeNoRsp':
            break;
        case 'configReport':
            // configReportRsp
            break;
        case 'readReportConfig':
            // readReportConfigRsp
            break;
        case 'report':
            break;
        case 'discover':
            // discoverRsp
            break;
        case ''
            break;
    }

    clusters.read(cId, attrs, attrId, function (err, data) {
        af.zclFouncadiont();
        // ...
    });
};

Zive.prototype.handleFunctional = function (msg) {
    var data = msg.data,
        cId = msg.clusterid,
        cmdId = data.cmdId,
        funcCmd = this.clusters.get(cId, 'cmds', cmdId),
        defaultRsp = {
            frameCntl: {
                frameType: 0,
                manufSpec: data.frameCntl.manufSpec,
                direction: 1,
                disDefaultRsp: data.frameCntl.disDefaultRsp
            },
            manufCode: data.manufCode,
            seqNUm: data.seqNUm,
            cmdId: zclId.foundation('defaultRsp').value,
            payload: {
                cmdId: cmdId,
                statusCode: null
            }
        };

    if (!funcCmd)
        defaultRsp.payload.statusCode = zclId.status('unsupClusterCmd').value;
    else
        funcCmd(this, msg.data.payload, function (err) {
            var cmdName = zclId.functional(cId, cmdId).key,
                rspCmdName = cmdName + 'Rsp';
                rspCmdId = getCmdRsp(cId, rspCmdName);

            if (rspCmdName)
                return;
            else {
                if (err) {
                    defaultRsp.payload.statusCode = zclId.status('failure').value;
                    // [TODO] send default response
                } else if (data.frameCntl.disDefaultRsp === 0) {
                    defaultRsp.payload.statusCode = zclId.status('success').value;
                    // [TODO] send default response
                }
            }
        });
};

var foundHdlrs = {};

foundHdlrs.read = function (clusters, cId, payload, callback) {
    var readFuncs = [];

    _.forEach(payload, function (readRec) {
        var attrId = readRec.attrId;
        
        readFuncs.push(function (cb) {
            var readStatusRec = {
                    attrId: attrId,
                    status: null
                };

            clusters.read(cId, attrId, function (err, data) {  // [TOCHECK], so.read
                if (err) {
                    if (data === '_notfound_')
                        readStatusRec.status = zclId.status('unsupAttribute').value;
                    else if (data === '_unreadable_' || data === '_exec_')
                        readStatusRec.status = zclId.status('notAuthorized').value;
                    else 
                        readStatusRec.status = zclId.status('failure').value;
                } else {
                    readStatusRec.status = zclId.status('success').value;
                    readStatusRec.dataType = zclId.attrType(cId, attrId).value;
                    readStatusRec.attrData = data;
                }
                cb(null, readStatusRec);
            });
        });
    });

    execAsyncFuncs(readFuncs, function (err, result) {
        callback(err, result);
    });
};

foundHdlrs.write = function (clusters, cId, payload, callback) {
    var writeFuncs = [];

    _.forEach(payload, function (writeRec) {
        var attrId = writeRec.attrId;

        writeFuncs.push(function (cb) {
            var acl = clusters.get(cId, 'attrs', attrId),   // [TOCHECK], so.get
                writeStatusRec = {
                    attrId: attrId,
                    status: null
                };

            if (acl === 'R') {
                writeStatusRec.status = zclId.status('readOnly').value;
                cb(null, writeStatusRec);
            } else if (writeRec.dataType !== zclId.attrType(cId, attrId).value) {
                writeStatusRec.status = zclId.status('invalidValue').value;
                cb(null, writeStatusRec);
            } else {
                clusters.write(cId, attrId, writeRec.attrData, function (err, data) {  // [TOCHECK], so.read
                    if (err) {
                        if (data === '_notfound_')
                            writeStatusRec.status = zclId.status('unsupAttribute').value;
                        else if (data === '_unwritable_' || data === '_exec_')
                            writeStatusRec.status = zclId.status('notAuthorized').value;
                        else
                            writeStatusRec.status = zclId.status('failure').value;
                    } else {
                        writeStatusRec.status = zclId.status('success').value;
                    }
                    cb(null, writeStatusRec);
                });
            } 
        });
    });

    execAsyncFuncs(writeFuncs, function (err, result) {
        callback(err, result);
    });
};

foundHdlrs.configReport = function (clusters, cId, payload, callback) {
    var cfgRptRsps = [];

    if (!clusters.has(cId, rptCfg))
        clusters.

    _.forEach(payload, function (attrRptCfgRec) {
        var attrId = attrRptCfgRec.attrId,
            attrType = zclId.attrType(cId, attrId).key,
            cfg = clusters.get(cId, 'rptCfgs', attrId),
            attrStatusRec = {
                attrId: attrId,
                direction: attrRptCfgRec.direction,
                status: null
            };

        if (!clusters.has(cId, 'attrs', attrId))
            attrStatusRec.status = zclId.status('unsupAttribute').value;
        else if (attrType === 'array' || attrType === 'struct' || attrType === 'bag')
            attrStatusRec.status = zclId.status('unsupAttribute').value;
        else if (attrStatusRec.direction === 1) {
            if (!cfg) cfg = {};

            cfg.timeout = attrRptCfgRec.timeout;
            attrStatusRec.status = zclId.status('success').value;
        } else {
            if (attrRptCfgRec.dataType !== zclId.attrData(cId, attrId).value)
                attrStatusRec.status = zclId.status('invalidDataType').value;
            else {
                if (!cfg) cfg = {};

                cfg.pmin = attrRptCfgRec.minRepIntval;
                cfg.pmax = attrRptCfgRec.maxRepIntval;
                cfg.step = isAnalog(attrType) ? attrRptCfgRec.repChange : null;
                attrStatusRec.status = zclId.status('success').value;
            }

            // [TODO], set discover timer
        } 
        cfgRptRsps.push(attrStatusRec);
    });
};

foundHdlrs.readReportConfig = function (clusters, cId, payload, callback) {
    var readCfgRptRsps = [];

    _.forEach(payload, function (attrRec) {    
        var attrId = attrRec.attrId,
            attrType = zclId.attrType(cId, attrId).value,
            direction = attrRec.direction,
            cfg = clusters.get(cId, 'rptCfgs', attrId);
            attrRptCfgRec = {
                attrId: attrId,
                direction: direction,
                status: null
            };

        if (!clusters.has(cId, 'attrs', attrId))
            attrRptCfgRec.status = zclId.status('unsupAttribute').value;
        else if (!cfg)
            attrRptCfgRec.status = zclId.status('unreportableAttribute').value;
        else if (direction === 1)
            attrRptCfgRec.timeout = cfg.timeout ? cfg.timeout : 0xffff;
        else {
            attrRptCfgRec.dataType = attrType;
            attrRptCfgRec.minRepIntval = cfg.pmin ? cfg.pmin : 0xffff;
            attrRptCfgRec.maxRepIntval = cfg.pmax ? cfg.pmax : 0xffff;
            if (isAnalog(attrType))
                attrRptCfgRec.repChange = cfg.step ? cfg.step : 0;
        }
        readCfgRptRsps.push(attrRptCfgRec);
    });
};

foundHdlrs.report = function () {

};

foundHdlrs.discover = function (clusters, cId, payload, callback) {
    var attrs = clusters.dump(cId, 'attrs'),
        startId = payload.startAttrId,
        maxNums = payload.maxAttrIds,
        discRsp = {
            discComplete: 1,
            attrInfos: []
        };

    _.forEach(attrs, function (info, id) {
        var attrId = zclId.attr(cId, id).value,
            attrInfo = {
                attrId: id,
                dataType: null
            };

        if (discRsp.attrInfos.length >= maxNums)
            return false;

        if (attrId >= startId) {
            attrInfo.dataType = zclId.attrType(cId, attrId).value;
            discRsp.attrInfos.push(attrInfo);
        }
    });
};


function execAsyncFuncs (funcs, callback) {
    var count = 0,
        flag = false,
        allResult = [];

    if (_.isEmpty(funcs)) return callback(null);

    _.forEach(funcs, function (func) {
        func(function (err, result) {
            count += 1;

            if (flag) return;

            if (err) {
                callback(err);
                flag = true;
            } else {
                allResult.push(result);
            }

            if (count === funcs.length) callback(null, allResult);
        });
    });
}

function isAnalog(dataType) {
    var type = zclId.dataType(dataType).value,
        analogDigital;

    if ((type > 0x07 && type < 0x20) ||  //GENERAL_DATA, LOGICAL, BITMAP
        (type > 0x2f && type < 0x38) ||  //ENUM
        (type > 0x3f && type < 0x58) ||  //STRING, ORDER_SEQ, COLLECTION
        (type > 0xe7 && type < 0xff))    //IDENTIFIER, MISC
    {
        analogDigital = false;
    } else if (
        (type > 0x1f && type < 0x30) ||  //UNSIGNED_INT, SIGNED_INT
        (type > 0x37 && type < 0x40) ||  //FLOAT
        (type > 0xdf && type < 0xe8))    //TIME
    {
        analogDigital = true;
    }

    return analogDigital;
}

module.exports = Zive;

/*************************************************************************************************/
/*** myEndpoint                                                                                ***/
/*************************************************************************************************/
var SmartObject = require();

var clusters = {
    cId1: {
        dir: 1,    // 1: 'in', 2: 'out'
        acls: {
            attr1: READ,
            onOff: READ | WRITE,
        },
        attrs: {
            attr1: 5,
            onOff: {
                read: function () {},
                write: function () {}
            }
        },
        cmds: {
            on: function (zapp, arg1, arg2, callback) {
                //....
                this.write('onOff', 1);
                this.write('xxxx', 'aaa');
            },
            cmd2: function (zapp, arg, callback) {

            }
        },
        rptCfgs: {
            attr: {
                cfg: {
                    pmin,
                    pmax,
                    step
                }
                rpt: {

                }
            }
        }
    }
};

module.exports = new SmartObject(clusters);

/*************************************************************************************************/
/*** zapp                                                                                      ***/
/*************************************************************************************************/
var myEndpoint = require('./myEndpoint');
var zapp = new Zive(profId, devId, myEnd);
var zapp = new Zive(ids, myEnd);

module.exports = zapp;
