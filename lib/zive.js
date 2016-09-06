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
    this.clusters.glue(this);

    _.forEach(clusters.dumpSync, function (cInfo, cId) {
        if (cInfo.dir.value & 1)
            self._simpleDesc.inClusterList.push(zclId.cluster(cId).value);
        if (cInfo.dir.value & 2)
            self._simpleDesc.outClusterList.push(zclId.cluster(cId).value);
    });
}

Zive.prototype.foundation = function (dstAddr, dstEpId, cId, cmd, zclData, cfg, callback) {
    return this._endpoint.foundation(dstAddr, dstEpId, cId, cmd, zclData, cfg, callback);
};

Zive.prototype.functional = function (dstAddr, dstEpId, cId, cmd, zclData, cfg, callback) {
    return this._endpoint.functional(dstAddr, dstEpId, cId, cmd, zclData, cfg, callback);
};

Zive.prototype.foundationHandler = function (msg) {
    var self = this,
        clusters = this.clusters,
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
            this._foundApis.write(clusters, cId, data.payload, msg, function () {});
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
            self.foundation(msg.srcaddr, msg.srcendpoint, cId, cmdRsp, result, cfg);
        });
};

Zive.prototype.functionalHandler = function (msg) {
    var self = this,
        data = msg.data,
        cId = msg.clusterid,
        cmdId = data.cmdId,
        defaultRsp = data.frameCntl.disDefaultRsp,
        cfg = {
            manufSpec: data.frameCntl.manufSpec,
            direction: 1,
            disDefaultRsp: defaultRsp,
            seqNUm: data.seqNUm         // [TOCHECK] where to fill seqNum
        },
        payload = {
            cmdId: cmdId,
            statusCode: null
        };

    this.clusters.exec(cId, cmdId, msg.data.payload, function (err, data) {
        var cmdName = zclId.functional(cId, cmdId).key,
            rspCmdName = cmdName + 'Rsp';

        if (err) {
            if (data === '_notfound_')
                payload.statusCode = zclId.status('unsupClusterCmd').value;
            else
                payload.statusCode = zclId.status('failure').value;

            self.foundation(msg.srcaddr, msg.srcendpoint, cId, 'defaultRsp', payload, cfg);
        } else if (rspCmdName) {
            if (!data) {
                if (defaultRsp === 0) {
                    payload.statusCode = zclId.status('success').value;
                    self.foundation(msg.srcaddr, msg.srcendpoint, cId, 'defaultRsp', payload, cfg);
                }
            } else {
                payload = data;
                self.functional(msg.srcaddr, msg.srcendpoint, cId, rspCmdName, payload, cfg);
                // [TODO] if payload format error, throw error?
            }
        } else if (defaultRsp === 0) {
            payload.statusCode = zclId.status('success').value;
            self.foundation(msg.srcaddr, msg.srcendpoint, cId, 'defaultRsp', payload, cfg);
        }
    });
};

Zive.prototype._report = function (cId, attrId, data, afMsg) {
    var cfg = {
            manufSpec: afMsg.data.frameCntl.manufSpec,
            direction: 1,
            disDefaultRsp: afMsg.data.frameCntl.disDefaultRsp
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
