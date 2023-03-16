/* eslint-disable max-len */
'use strict';
const JAM_MASUK = 2; // 9 AM GMT+7

module.exports = function(AbsensiPegawai) {
  AbsensiPegawai.observe('before save', function(ctx, next) {
    if (ctx.instance && ctx.instance.username) {
      const Pegawai = AbsensiPegawai.app.models.Pegawai;
      Pegawai.findOne({where: {username: ctx.instance.username}}, function(err, pegawai) {
        if (err) return next(err);
        if (!pegawai) {
          let err = new Error('Pegawai with username ' + ctx.instance.username + ' not found');
          err.status = 400;
          return next(err);
        }
        return next();
      });
    } else {
      return next();
    }
  });

  // validate jenis
  AbsensiPegawai.validatesInclusionOf('jenis', {
    in: ['hadir', 'izin', 'cuti'],
    message: 'Jenis absensi must be hadir, izin, or cuti',
  });

  // API endpoint to add cuti
  AbsensiPegawai.addCuti = function(username, tanggal, keterangan, callback) {
    AbsensiPegawai.create({
      'username': username,
      'tanggal': tanggal,
      'jenis': 'cuti',
      'keterangan': keterangan,
      'status': 'pending',
    }, function(err, cuti) {
      if (err) {
        return callback(err);
      }

      callback(null, cuti);
    });
  };

  AbsensiPegawai.remoteMethod('addCuti', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'tanggal', type: 'date', required: true},
      {arg: 'keterangan', type: 'string', required: false},
    ],
    http: {path: '/:username/cuti', verb: 'post'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to add izin
  AbsensiPegawai.addIzin = function(username, tanggal, keterangan, callback) {
    AbsensiPegawai.create({
      'username': username,
      'tanggal': tanggal,
      'jenis': 'izin',
      'keterangan': keterangan,
      'status': 'pending',
    }, function(err, izin) {
      if (err) {
        return callback(err);
      }

      callback(null, izin);
    });
  };

  AbsensiPegawai.remoteMethod('addIzin', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'tanggal', type: 'date', required: true},
      {arg: 'keterangan', type: 'string', required: false},
    ],
    http: {path: '/:username/izin', verb: 'post'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to add absen hadir
  AbsensiPegawai.addHadir = function(username, tanggal, callback) {
    AbsensiPegawai.find({
      where: {
        and: [
          {username: username},
          {tanggal: {gt: new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate())}},
          {tanggal: {lt: new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate() + 1)}},
          {jenis: 'hadir'},
        ],
      },
    }, function(err, hadir) {
      if (err) {
        return callback(err);
      }

      if (hadir.length > 0) {
        return callback(new Error('Pegawai was already hadir on this date.'));
      }

      AbsensiPegawai.create({
        'username': username,
        'tanggal': tanggal,
        'jenis': 'hadir',
      }, function(err, hadir) {
        if (err) {
          return callback(err);
        }

        callback(null, hadir);
      });
    });
  };

  AbsensiPegawai.remoteMethod('addHadir', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'tanggal', type: 'date', required: true},
    ],
    http: {path: '/:username/hadir', verb: 'post'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to approve cuti
  AbsensiPegawai.approveCuti = function(cutiId, callback) {
    AbsensiPegawai.findById(cutiId, function(err, cuti) {
      if (err) {
        return callback(err);
      }
      if (!cuti) {
        err = new Error('Cuti not found');
        err.statusCode = 404;
        return callback(err);
      }
      if (cuti.jenis !== 'cuti') {
        err = new Error('Invalid absensi type');
        err.statusCode = 400;
        return callback(err);
      }
      if (cuti.status === 'approved') {
        err = new Error('Cuti has already been approved');
        err.statusCode = 400;
        return callback(err);
      }
      if (cuti.status === 'rejected') {
        err = new Error('Cuti has already been rejected');
        err.statusCode = 400;
        return callback(err);
      }
      cuti.updateAttributes({
        'status': 'approved',
      }, function(err, updatedCuti) {
        if (err) {
          return callback(err);
        }
        callback(null, updatedCuti);
      });
    });
  };

  AbsensiPegawai.remoteMethod('approveCuti', {
    accepts: [
      {arg: 'cutiId', type: 'string', required: true},
    ],
    http: {path: '/cuti/:cutiId/approve', verb: 'patch'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to reject cuti
  AbsensiPegawai.rejectCuti = function(cutiId, callback) {
    AbsensiPegawai.findById(cutiId, function(err, cuti) {
      if (err) {
        return callback(err);
      }
      if (!cuti) {
        err = new Error('Cuti not found');
        err.statusCode = 404;
        return callback(err);
      }
      if (cuti.jenis !== 'cuti') {
        err = new Error('Invalid absensi type');
        err.statusCode = 400;
        return callback(err);
      }
      if (cuti.status === 'approved') {
        err = new Error('Cuti has already been approved');
        err.statusCode = 400;
        return callback(err);
      }
      if (cuti.status === 'rejected') {
        err = new Error('Cuti has already been rejected');
        err.statusCode = 400;
        return callback(err);
      }
      cuti.updateAttributes({
        'status': 'rejected',
      }, function(err, updatedCuti) {
        if (err) {
          return callback(err);
        }
        callback(null, updatedCuti);
      });
    });
  };

  AbsensiPegawai.remoteMethod('rejectCuti', {
    accepts: [
      {arg: 'cutiId', type: 'string', required: true},
    ],
    http: {path: '/cuti/:cutiId/reject', verb: 'patch'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to approve izin
  AbsensiPegawai.approveIzin = function(izinId, callback) {
    AbsensiPegawai.findById(izinId, function(err, izin) {
      if (err) {
        return callback(err);
      }
      if (!izin) {
        err = new Error('Izin not found');
        err.statusCode = 404;
        return callback(err);
      }
      if (izin.jenis !== 'izin') {
        err = new Error('Invalid absensi type');
        err.statusCode = 400;
        return callback(err);
      }
      if (izin.status === 'approved') {
        err = new Error('Izin has already been approved');
        err.statusCode = 400;
        return callback(err);
      }
      if (izin.status === 'rejected') {
        err = new Error('Izin has already been rejected');
        err.statusCode = 400;
        return callback(err);
      }
      izin.updateAttributes({
        'status': 'approved',
      }, function(err, updatedIzin) {
        if (err) {
          return callback(err);
        }
        callback(null, updatedIzin);
      });
    });
  };

  AbsensiPegawai.remoteMethod('approveIzin', {
    accepts: [
      {arg: 'izinId', type: 'string', required: true},
    ],
    http: {path: '/izin/:izinId/approve', verb: 'patch'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to reject izin for a pegawai
  AbsensiPegawai.rejectIzin = function(izinId, callback) {
    AbsensiPegawai.findById(izinId, function(err, izin) {
      if (err) {
        return callback(err);
      }
      if (!izin) {
        err = new Error('Izin not found');
        err.statusCode = 404;
        return callback(err);
      }
      if (izin.jenis !== 'izin') {
        err = new Error('Invalid absensi type');
        err.statusCode = 400;
        return callback(err);
      }
      if (izin.status === 'approved') {
        err = new Error('Izin has already been approved');
        err.statusCode = 400;
        return callback(err);
      }
      if (izin.status === 'rejected') {
        err = new Error('Izin has already been rejected');
        err.statusCode = 400;
        return callback(err);
      }

      izin.updateAttributes({
        status: 'rejected',
      }, function(err, updatedIzin) {
        if (err) {
          return callback(err);
        }
        callback(null, updatedIzin);
      });
    });
  };

  AbsensiPegawai.remoteMethod('rejectIzin', {
    accepts: [
      {arg: 'izinId', type: 'string', required: true},
    ],
    http: {path: '/izin/:izinId/reject', verb: 'patch'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  AbsensiPegawai.getReport = function(username, bulan, tahun, callback) {
    // Check if username exists
    AbsensiPegawai.findOne({where: {username: username}}, function(err, pegawai) {
      if (err) {
        return callback(err);
      }

      if (!pegawai) {
        let err = new Error('Username not found');
        err.statusCode = 404;
        return callback(err);
      }

      let currentDate = new Date();
      let daysInMonth = new Date(tahun, bulan, 0).getDate();
      let filter = {
        where: {
          and: [
            {username: username},
            {
              tanggal: {
                gte: new Date(tahun, bulan - 1, 1),
                lt: new Date(tahun, bulan, 1),
              },
            },
          ],
        },
      };

      AbsensiPegawai.find(filter, function(err, absensiPegawai) {
        if (err) {
          return callback(err);
        }

        let report = {
          totalTelat: 0,
          totalHadir: 0,
          totalTidakHadir: 0,
          totalCutiDiajukan: 0,
          cutiPending: 0,
          cutiApproved: 0,
          cutiRejected: 0,
          totalIzinDiajukan: 0,
          izinPending: 0,
          izinApproved: 0,
          izinRejected: 0,
        };

        absensiPegawai.forEach(function(item) {
          if (item.jenis === 'hadir' && item.tanggal.getMonth() === bulan - 1) {
            if (item.tanggal.getUTCHours() > JAM_MASUK) {
              report.totalTelat++;
            }
            report.totalHadir++;
          } else if (item.jenis === 'cuti' && item.tanggal.getMonth() === bulan - 1) {
            report.totalCutiDiajukan++;
            if (item.status === 'approved') {
              report.cutiApproved++;
            } else if (item.status === 'rejected') {
              report.cutiRejected++;
            } else if (item.status === 'pending') {
              report.cutiPending++;
            }
          } else if (item.jenis === 'izin' && item.tanggal.getMonth() === bulan - 1) {
            report.totalIzinDiajukan++;
            if (item.status === 'approved') {
              report.izinApproved++;
            } else if (item.status === 'rejected') {
              report.izinRejected++;
            } else if (item.status === 'pending') {
              report.izinPending++;
            }
          }
        });

        report.totalTidakHadir = daysInMonth - report.totalHadir - (currentDate.getMonth() === bulan - 1 ? currentDate.getDate() : 0);

        callback(null, report);
      });
    });
  };

  AbsensiPegawai.remoteMethod('getReport', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'bulan', type: 'number', required: true},
      {arg: 'tahun', type: 'number', required: true},
    ],
    http: {path: '/:username/report', verb: 'get'},
    returns: {arg: 'data', type: 'object', root: true},
  });
};
