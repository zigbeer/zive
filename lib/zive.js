/* jshint node: true */
'use strict';

var _ = require('busyman'),
    zclId = require('zcl-id'),
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
    this._discCmds = infos.discCmds ? infos.discCmds : [];

    this._foundApis = foundApis(this);

    this.clusters = clusters;
    this.zclFoundation = null;
    this.zclFunctional = null;
    
    _.forEach(clusters.dumpSync, function (cInfo, cId) {
        if (cInfo.dir.value & 1)
            self._simpleDesc.inClusterList.push(zclId.cluster(cId).value);
        if (cInfo.dir.value & 2)
            self._simpleDesc.outClusterList.push(zclId.cluster(cId).value);
    });
}

Zive.prototype.handleFoundation = function (msg) {
    var clusters = this.clusters,
        data = msg.data,
        cId = msg.clusterid,
        cmdName = zclId.foundation(data.cmdId).key,
        cfg = {
            manufSpec: data.frameCntl.manufSpec,
            direction: 1,
            disDefaultRsp: data.frameCntl.disDefaultRsp,
            seqNUm: data.seqNUm         // [TOCHECK] where to fill seqNum
        },
        cmdRsp;

    if (cmdName === 'writeUndiv')
        cmdName = 'write';

    switch (cmdName) {
        case 'read':
        case 'configReport':
        case 'readReportConfig':
        case 'discover':
        case 'write':
            cmdRsp = cmdName + 'Rsp';
            break;
        case 'writeNoRsp':
            this._foundApis[cmdName](clusters, cId, data.payload, msg, function () {});
            break;
        case 'readStruct':
        case 'writeStrcut':
            // not support now
            break;
        default:
            break;
    }

    if (cmdRsp)
        this._foundApis[cmdName](clusters, cId, data.payload, msg, function (err, result) {
            this.foundation(msg.srcaddr, msg.srcendpoint, cId, cmdRsp, result, cfg);
        });
};

Zive.prototype.handleFunctional = function (msg) {
    var self = this,
        data = msg.data,
        cId = msg.clusterid,
        cmdId = data.cmdId,
        funcCmd = this.clusters.get(cId, 'cmds', cmdId),
        cfg = {
            manufSpec: data.frameCntl.manufSpec,
            direction: 1,
            disDefaultRsp: data.frameCntl.disDefaultRsp,
            seqNUm: data.seqNUm         // [TOCHECK] where to fill seqNum
        },
        payload = {
            cmdId: cmdId,
            statusCode: null
        };

    if (!funcCmd) {
        payload.statusCode = zclId.status('unsupClusterCmd').value;
        this.foundation(msg.srcaddr, msg.srcendpoint, cId, cmdId, payload, cfg);
    } else
        funcCmd(this, msg.data.payload, function (err) {
            var cmdName = zclId.functional(cId, cmdId).key,
                rspCmdName = cmdName + 'Rsp';

            // [TODO] how do you decide whether to send defaultRsp
            if (rspCmdName)
                return;
            else {
                if (err) {
                    payload.statusCode = zclId.status('failure').value;
                    this.foundation(msg.srcaddr, msg.srcendpoint, cId, 'defaultRsp', payload, cfg);
                } else if (data.frameCntl.disDefaultRsp === 0) {
                    payload.statusCode = zclId.status('success').value;
                    this.foundation(msg.srcaddr, msg.srcendpoint, cId, 'defaultRsp', payload, cfg);
                }
            }
        });
};

Zive.prototype._report = function (cId, attrId, data, afMsg) {
    var clusters = this.clusters,
        cfg = {
            manufSpec: afMsg.frameCntl.manufSpec,
            direction: 1,
            disDefaultRsp: afMsg.frameCntl.disDefaultRsp
        },
        attrReport = {
            attrId: attrId,
            dataType: zclId.attrType(cId, attrId).value,
            attrData: null 
        };


        attrReport.attrData = data;
        this.foundation(afMsg.srcaddr, afMsg.srcendpoint, cId, 'report', attrReport, cfg);
};

module.exports = Zive;
