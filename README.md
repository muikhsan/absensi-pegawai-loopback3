﻿# absensi-pegawai-loopback3

Project ini merupakan API yang menggunakan node.js dengan framework LoopBack 3 dan MongoDB sebagai database.

## Requirements
- Node.js
- MongoDB

## Installation
- Start MongoDB
- Install libraries
```bash
npm install
```
- Run Node.js
```bash
node .
```

## Usage

Web server listening at: [http://localhost:3000](http://localhost:3000)

Browse your REST API at [http://localhost:3000/explorer](http://localhost:3000/explore)

## API
- Membuat data pegawai baru (POST /Pegawai)

- Melihat semua data pegawai (GET /Pegawai)

- Menghapus data pegawai (DELETE /Pegawai/{id})

-----

- Membuat data absen pegawai dengan tipe hadir (POST /Absen/{username}/hadir)

- Membuat data absen dengan tipe izin (POST /Absen/{username}/izin)

- Menyetujui izin yang diajukan (PATCH /Absen/izin/{izinId}/approve)

- Menolak izin yang diajukan (PATCH /Absen/izin/{izinId}/reject)

- Membuat data absen dengan tipe cuti (POST /Absen/{username}/cuti)

- Menyetujui cuti yang diajukan (PATCH /Absen/cuti/{cutiId}/approve)

- Menolak cuti yang diajukan (PATCH /Absen/cuti/{cutiId}/reject)

- Melihat laporan absensi satu pegawai (GET /Absen/{username}/report)
