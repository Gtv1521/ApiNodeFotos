// Librerias
import express from 'express';
import dotenv from 'dotenv';

// Estancias de la app
import { sigIn, logIn, sendEmail, passNew, verifyUsername, username, email } from '../controller/auth.controller.js';
import { verifyToken } from '../helpers/acessToken.js';

// iniciando estancias
const router = express.Router();
dotenv.config();

// form sigIn
router.get('/formSigin', async (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>

        <body>
            <form action="/sigin" method="POST" id="formUser">
                <input type="text" name="username" placeholder="Username"><br>
                <input type="password" name="password" placeholder="password">
                <input type="submit" value="Entrar">
            </form>
        </body>
    `);
});

// form Login
router.get('/formLogin', async (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>

        <body>
            <form action="/login" method="POST" id="formUser">
                <input type="text" name="nombre" placeholder="Nombre" /><br>
                <input type="text" name="username" placeholder="Username" /><br>
                <input type="mail" name="email" placeholder="E-mail" /><br>
                <input type="password" name="password" placeholder="Pass" /><br>
                <input type="submit" value="Crear">
            </form>
        </body>
    `);
});

router.get('/username/:user', username);
router.get('/email/:email', email);
/**
 * @swagger
 * tags:
 *  name: Autenticacion
 *  description: Rutas de usuarios LOGIN Y SIGIN 
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    Userlogin:
 *      type: object
 *      properties:
 *        nombre: 
 *          type: string
 *          description: nombre del usuario
 *        username: 
 *          type: string
 *          description: nombre de usuario que sea unico
 *        password:
 *          type: password
 *          description: contraseña de usuario de registrado
 *        email:
 *          type: string
 *          description: email es unico en la app
 *      required: 
 *          - nombre
 *          - username
 *          - password
 *          - email  
 *      example:
 *          nombre: Gustavo Bernal
 *          username: Gustavo123
 *          password: gus.123
 *          email: correo@algo.com
 *     
 *    Result:
 *      type: object
 *      properties:
 *        message: 
 *          type: string
 *          description: resultado         
 */

// log in ruta
/**
 * @swagger
 * /login:
 *  post:
 *   summary: Crea un usuario nuevo.
 *   tags: [Autenticacion]    
 *   description: Crea un usuario y porporciona access token.
 *   requestBody:
 *     required: true
 *     content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Userlogin'     
 *   responses:
 *     '200':    # status code
 *        description: Usuario creado satisfactoriamente 
 *        content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items: 
 *                type: object
 *                properties:
 *                  id: 
 *                    type: integer
 *                    description: Id usuario
 *                  nombre: 
 *                    type: string
 *                    description: Nombre del usuario
 *                  username: 
 *                    type: string
 *                    description: Nombre unico al usuario 
 *                  password: 
 *                    type: string
 *                    description: Contraseña de usuario creado 
 *                  email: 
 *                    type: string
 *                    description: Email unico del usuario
 *                  message: 
 *                    type: string
 *                    description: Mensaje de autenticacion
 *                  token: 
 *                    type: string
 *                    description: Token de acceso de usuario
 *                example:  
 *                  id: 20
 *                  nombre: Gustavo Bernal
 *                  username: Gus.123
 *                  password: gustavo.123
 *                  email: correo@correo.com 
 *                  message: User authenticated
 *                  token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ikd1c3Rhdm8xMjMiLCJ1c2VyX2lkIjozNiwiZW1haWwiOiJndXN0YXZvYmVyOThAZ21haWwuY29tIiwibm9tYnJlIjoiR3VzdGF2byIsImlhdCI6MTY5Njg2MjA3MSwiZXhwIjoxNjk2ODgzNjcxfQ.XYTZ8itH0i1vstp7oJaaVIzJH3szR3LInrHK42Red_s
 *                 
 *        links: 
 *          getUsers:
 *            operationId: getUsers 
 * 
 *     404:    # status code
 *        description: Error Not found
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  error: 
 *                    type: string
 *                    properties: Mensaje de error 
 *                example:  
 *                  message: Datos pertenecen a otro usuario 
 *   
 *                       
 *                          
 */
router.post('/login', logIn);

// sig in ruta
/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        id: 
 *          type: integer
 *          description: Numero de identificacion de usuario
 *        username: 
 *          type: string
 *          description: Nombre de usuario de registrado
 *        password:
 *          type: password
 *          description: Contraseña de usuario de registrado  
 *      required: 
 *          - username
 *          - password
 *      example:
 *          username: Gus123
 *          password: Ilovereggae.17           
 */

/**
 * @swagger
 * /sigin:
 *  post:
 *   summary: Accede a una sesion de usuario.
 *   tags: [Autenticacion]  
 *   requestBody:
 *     required: true
 *     content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'     
 *   responses:
 *     '200':    # status code
 *        description: Usuario autenticado
 *        content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   wellcome: 
 *                       type: string
 *                       description: Mensaje de bienvenida con el nombre de usuario
 *                   message: 
 *                      type: string
 *                      description: Mensaje de autenticacion
 *                   token: 
 *                       type: string
 *                       description: Token de acceso
 *                 example:
 *                     wellcome: Bienvenido ${user}
 *                     messagge: User authenticated
 *                     token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ikd1c3Rhdm8xMjMiLCJ1c2VyX2lkIjozNiwiZW1haWwiOiJndXN0YXZvYmVyOThAZ21haWwuY29tIiwibm9tYnJlIjoiR3VzdGF2byIsImlhdCI6MTY5Njg2MjA3MSwiZXhwIjoxNjk2ODgzNjcxfQ.XYTZ8itH0i1vstp7oJaaVIzJH3szR3LInrHK42Red_s                     
 * 
 *     '404':    # status code 
 *        description: Error Not Found
 *        content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message: 
 *                      type: string
 *                      description: Mensaje de autenticacion
 *                 example:
 *                     messagge: Datos no coinciden                         
 */
router.post('/sigin', sigIn);


// new password
/**
 * @swagger
 * /emailPass:
 *  post:
 *   summary: Envia un mensaje al email para restableser contraseña.
 *   tags: [Autenticacion]  
 *   requestBody:
 *     required: true
 *     content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Error' 
 *          required: true
 *             - email 
 *          example: 
 *             email: gustavo@algo.com
 * 
 *   responses: 
 *     200:    # status code
 *        description: respuesta de envio de correo
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/Result'
 *            example:
 *              email: gustavo@algo.com
 *              message: Link send email
 * 
 *     404:    # status code
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              message: Email not exit in the database
 * 
 */



// router.post('/emailPass', sendEmail);


router.get('/newPassword/:token/:id', async (req, res) => {
    const { token, id } = req.params;
    res.send(`
        <form action="/newPassword/${id}?access_token=${token}" method="POST" id="formUser">
             <input type="password" name="password" placeholder="password">
             <input type="password" name="confirPass" placeholder="confirm">
             <input type="submit" value="Enviar">
         </form>
   `)
})
// valida el nuevo password y lo agrega a la base
/**
 * @swagger
 * /newPassword/{id}:
 *  post:
 *   summary: Envia un mensaje al email para restableser contraseña.
 *   security:
 *     - ApiKeyAuth: []   
 *   tags: [Autenticacion] 
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64 
 *   requestBody:
 *     required: true
 *     content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Error' 
 *          example: 
 *            password: Gustavo.123
 *            confirPass: Gustavo.123
 * 
 *   responses: 
 *     200:    # status code
 *        description: Respuesta de envio de correo
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/Result'
 *            example:
 *              message: password updated successfully 
 * 
 *     404:    # status code
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              message: Current password is this
 * 
 *     401:    # status code
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/Error'
 *            example:
 *              message: Access denied
 * 
 */

router.post('/newPassword/:id', verifyToken , passNew);

export default router;