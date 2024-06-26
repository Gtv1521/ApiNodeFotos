"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verImagesAlbum = exports.verImagenesId = exports.verImage = exports.verAllImagesAlbum = exports.updateImage = exports.deleteImagen = exports.addImage = void 0;
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _dataBaseConect = _interopRequireDefault(require("../../config/dataBaseConect.js"));
var _cloudinary = require("../../config/cloudinary.js");
var _dotenv = require("dotenv");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// librerias 

// componentes de la aplicación

// consulta de imagenes por id
const consultaImg = async id => {
  return await _dataBaseConect.default.query('SELECT * FROM imagenes WHERE id_img = ?', [id]);
};

// consulta id de album y que pertenece al usuario
const verAlbum = async (album_id, user_id) => {
  return await _dataBaseConect.default.query('SELECT * FROM albums WHERE id_album = ?  and user_id = ?', [album_id, user_id]);
};

// agregar imagen POST
const addImage = async (req, res) => {
  try {
    const {
      id_user
    } = req.params;
    const {
      name_img,
      album_id
    } = req.body;
    let url_img = '';
    let id_url = '';
    // insertamos la imagen en la DB
    if (!name_img || !album_id || req.files == null) {
      res.status(404).json({
        message: "Send all data"
      });
    } else {
      if (req.files?.image) {
        //verifica que exista una imagen
        const result = await (0, _cloudinary.fotoUpload)(req.files.image.tempFilePath); //sube a cloudinary
        url_img = result.secure_url; //saca la url de la imagen en la red 
        id_url = result.public_id; //nos da el id de la imagen en cloudinary
        await _fsExtra.default.remove(req.files.image.tempFilePath);
      }
      // capturamos la fecha 
      const tiempo = Date.now();
      const fecha = new Date(tiempo);
      // const fecha = hoy.toDateString();

      // insertamos los datos en la base de datos
      const verifyAlbum = await verAlbum(album_id, id_user);
      if (verifyAlbum.length === 0) {
        res.json({
          message: 'Album no exists'
        });
      } else {
        const imagenConsulta = await _dataBaseConect.default.query(`
                    INSERT INTO imagenes
                    (name_img, url_img, id_url, user_id_img, fecha, album_id)
                    VALUES (?, ?, ?, ?, ?, ?)`, [name_img, url_img, id_url, id_user, fecha, album_id]);

        //validamos que la respuesta sea correcta 
        if (imagenConsulta.serverStatus == 2) {
          res.status(200).json({
            id: imagenConsulta.insertId,
            nombre: name_img,
            url: url_img,
            id_url: id_url,
            album: album_id,
            fecha: fecha,
            message: 'Image added successfully'
          });
        } else {
          res.json({
            message: 'Add image failed'
          });
        }
      }
    }
  } catch (error) {
    res.status(404).json(error);
  }
};

// ver una imagen por id Imagen GET
exports.addImage = addImage;
const verImage = async (req, res) => {
  try {
    const {
      id_img
    } = req.params;
    const result = await consultaImg(id_img);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json(error);
  }
};

// ver imagenes por Usuario GET
exports.verImage = verImage;
const verImagenesId = async (req, res) => {
  try {
    const {
      id_user,
      pagina,
      cantidad
    } = req.params;
    const pagina1 = (pagina - 1) * cantidad;
    const cantidad1 = Number.parseInt(cantidad, 10);
    const total = await _dataBaseConect.default.query(`SELECT Count(id_img) AS Total FROM  imagenes WHERE  user_id_img = ?`, [id_user]);
    const TotalPaginas = Math.ceil(total[0].Total / cantidad1);
    const consultaImagenes = await _dataBaseConect.default.query(`SELECT * FROM imagenes WHERE user_id_img = ? order by id_img DESC LIMIT ?,?`, [id_user, pagina1, cantidad1]);
    if (consultaImagenes.length !== 0) {
      res.json({
        PaginaActual: pagina,
        consultaImagenes,
        TotalPaginas
      });
    } else {
      res.json({
        message: 'There are no images to show'
      });
    }
  } catch (error) {
    res.json(error);
  }
};
// ver imagenes de un Album
exports.verImagenesId = verImagenesId;
const verAllImagesAlbum = async (req, res) => {
  try {
    const {
      album_id
    } = req.params;
    if (!album_id) {
      res.json({
        message: 'Send all data'
      });
    } else {
      console.log();
      const consutaImagenes = await _dataBaseConect.default.query(`SELECT * FROM imagenes  WHERE album_id = ? order by id_img DESC`, [album_id]);
      if (consutaImagenes.length !== 0) {
        res.json(consutaImagenes);
      } else {
        res.json({
          message: 'There are no images to show'
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
};

// elimiar imagen DELETE
exports.verAllImagesAlbum = verAllImagesAlbum;
const deleteImagen = async (req, res) => {
  try {
    const {
      id_img
    } = req.params;
    const id_url = await consultaImg(id_img);
    const respuesta = await _dataBaseConect.default.query('DELETE FROM imagenes WHERE id_img = ?', [id_img]);
    if (respuesta.serverStatus === 2 && respuesta.affectedRows > 0) {
      if (!id_url[0].id_url) {
        const foto = await (0, _cloudinary.fotoDelete)(id_url[0].id_url);
      }
      res.json({
        status: 200,
        message: 'Image delete successfully'
      });
    } else {
      res.json({
        message: 'Image no exist'
      });
    }
  } catch (error) {
    res.status(404).json(error);
  }
};

// actualizar datos de imagen UPDATE
exports.deleteImagen = deleteImagen;
const updateImage = async (req, res) => {
  try {
    console.log(req.params, req.body, req.files);
    const {
      id_img
    } = req.params;
    const {
      name_img,
      album_id
    } = req.body;
    if (!id_img || !name_img || !album_id) {
      res.json({
        message: 'Send all data'
      });
    } else {
      if (req.files?.image) {
        //verifica que exista una imagen
        const dataImage = await _dataBaseConect.default.query('SELECT id_url FROM imagenes WHERE id_img = ?', [id_img]);
        console.log(dataImage);
        if (!dataImage) {
          await (0, _cloudinary.fotoDelete)(dataImage[0].id_url);
        }
        const result = await (0, _cloudinary.fotoUpload)(req.files.image.tempFilePath); //sube a cloudinary
        const url_img = result.secure_url; //saca la url de la imagen en la red 
        const id_url = result.public_id; //nos da el id de la imagen en cloudinary
        const actualization = await _dataBaseConect.default.query(`UPDATE imagenes SET
                 url_img = ?, id_url= ? WHERE id_img = ?`, [url_img, id_url, id_img]);
        await _fsExtra.default.remove(req.files.image.tempFilePath);
      }
      // capturamos la fecha 
      const tiempo = Date.now();
      const fecha = new Date(tiempo);
      // const fecha = hoy.toDateString();
      const updateImg = await _dataBaseConect.default.query(`UPDATE imagenes SET
             name_img = ?, fecha = ?, album_id = ? WHERE id_img = ?`, [name_img, fecha, album_id, id_img]);
      if (updateImg.serverStatus === 2 && updateImg.changedRows === 1) {
        res.json({
          status: 200,
          message: 'Image updated'
        });
      } else {
        res.json({
          status: 404,
          message: 'There are no changes to the object'
        });
      }
    }
  } catch (error) {
    res.status(404).json(error);
  }
};
exports.updateImage = updateImage;
const verImagesAlbum = async (req, res) => {
  try {
    const {
      album_id
    } = req.params;
    if (!album_id) {
      res.json({
        message: 'Send all data'
      });
    } else {
      const result = await _dataBaseConect.default.query('SELECT album_id, url_img FROM imagenes WHERE album_id = ? order by id_img DESC LIMIT 4', [album_id]);
      if (result.length > 0) {
        res.json(result);
      } else {
        res.json({
          status: 200,
          message: 'Not have Images'
        });
      }
    }
  } catch (error) {
    res.status(404).json(error);
  }
};
exports.verImagesAlbum = verImagesAlbum;