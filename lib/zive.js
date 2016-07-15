/* jshint node: true */
'use strict';

var zclId = require('zcl-id'),
    foundApis = require('./foundation_apis');

/*************************************************************************************************/
/*** Zive Class                                                                                ***/
/*************************************************************************************************/
function Zive(infos, clusters) {
    var self = this;

    this._simpleDesc = {
        profId: infos.profId,
        devId: infos.devId,
        inClusterList: [],
        outClusterList: []
    }; 
    this._endpoint = null;
    this._discCmds = [];

    this.clusters = clusters;
    this.zclFoundation = null;
    this.zclFunctional = null;

    foundationApis = foundationApis(this);
    
    _.forEach(clusters.dumpSync, function (cInfo, cId) {
        if (cInfo.dir.value & 1)
            self._simpleDesc.inClusterList.push(zclId.cluster(cId).value);
        if (cInfo.dir.value & 2)
            self._simpleDesc.outClusterList.push(zclId.cluster(cId).value);
    });
   
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
