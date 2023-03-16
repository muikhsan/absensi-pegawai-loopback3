/* eslint-disable max-len */
'use strict';

module.exports = function(Pegawai) {
  // Validating gender field and username uniqueness
  Pegawai.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance && ctx.instance) {
      // Gender field only accepts L or P
      if (ctx.instance.gender !== 'L' && ctx.instance.gender !== 'P') {
        return next(new Error('Gender field can only be L or P.'));
      }
      // Check for the uniqueness of the username
      Pegawai.findOne({where: {username: ctx.instance.username}}, function(err, pegawai) {
        if (err) return next(err);
        if (pegawai) {
          var error = new Error('Username already exists');
          error.statusCode = 400;
          return next(error);
        }
        next();
      });
    }    else {
      next();
    }
  });

  Pegawai.observe('before delete', function(ctx, next) {
    var absensiPegawaiModel = Pegawai.app.models.absensiPegawai;
    absensiPegawaiModel.destroyAll({pegawaiId: ctx.where.id}, function(err, info) {
      if (err) return next(err);
      console.log('Deleted %s absensi records', info.count);
      next();
    });
  });

  // API endpoint to get all pegawai
  Pegawai.list = function(callback) {
    Pegawai.find({}, function(err, pegawai) {
      if (err) {
        return callback(err);
      }

      callback(null, pegawai);
    });
  };

  Pegawai.remoteMethod('list', {
    http: {path: '/', verb: 'get'},
    returns: {arg: 'data', type: 'array', root: true},
  });

  // API endpoint to create a pegawai
  Pegawai.createPegawai = function(username, password, name, gender, jabatan, callback) {
    Pegawai.create({
      'username': username,
      'password': password,
      'name': name,
      'gender': gender,
      'jabatan': jabatan,
      'createdAt': new Date(),
    }, function(err, pegawai) {
      if (err) {
        return callback(err);
      }

      callback(null, pegawai);
    });
  };

  Pegawai.remoteMethod('createPegawai', {
    accepts: [
      {arg: 'username', type: 'string', required: true},
      {arg: 'password', type: 'string', required: true},
      {arg: 'name', type: 'string', required: true},
      {arg: 'gender', type: 'string', required: true},
      {arg: 'jabatan', type: 'string', required: true},
    ],
    http: {path: '/', verb: 'post'},
    returns: {arg: 'data', type: 'object', root: true},
  });

  // API endpoint to delete a pegawai by id
  Pegawai.deletePegawai = function(id, callback) {
    Pegawai.findById(id, function(err, pegawai) {
      if (err) {
        return callback(err);
      }
      if (!pegawai) {
        return callback(new Error('Pegawai not found'));
      }
      Pegawai.destroyById(id, function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, {message: 'Pegawai deleted successfully'});
      });
    });
  };

  Pegawai.remoteMethod('deletePegawai', {
    accepts: [
      {arg: 'id', type: 'string', required: true},
    ],
    http: {path: '/:id', verb: 'delete'},
    returns: {arg: 'data', type: 'object', root: true},
  });
};
