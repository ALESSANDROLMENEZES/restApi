const userDao = require('./../Dao/userDao');
const User = require('./../models/User');
const Auth = require('../midleware/Auth');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  //LISTAR USUÁRIOS PODENDO SER COM OU SEM LIMITE 
  //-----------------------------------
  list: async (req, res, next) => {
    try {
      let users;
      let limit = req.query.limit;
      let user = new User();
      
      if (limit != undefined) {
        users = await userDao.listUsers(user, limit);
      } else {
        users = await userDao.listUsers(user);
      }

      res.status(200).json(users);
      
    } catch (error) {
      
      console.log(error);
      res.status(501).json(error);
      
    }
  },
  
  //EDITAR TODOS OS DADOS DE UM USUÁRIO 
  //-----------------------------------
  edit: async (req, res, next) => {
    try {
      let user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.id = req.params.id;
      
      let result = await userDao.update(user);      
      
      res.status(200).json(result);
      
    } catch (error) {
      res.status(501).json(error);
    }
  },
  
   //SALVAR UM NOVO USUÁRIO 
  //-----------------------------------
  save: async (req, res, next) => {
    try {
      
      let user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      
      let result = await userDao.save(user);
      let data = { id: result.insertId, Name: user.name, Email: user.email };
      
      let token = await Auth.signToken({ data });
      
      res.status(200).json({ data, token });
      
    } catch (error) {
      res.status(501).json(error);
    }
  },
  
   //DELETAR UM USUÁRIO PASSANDO POR REFERÊNCIA O ID
  //-----------------------------------
  delete: async (req, res, next) => {
    try {
      let user = new User();
      user.id = req.params.id;
      
      let result = await userDao.delete(user);
      res.status(200).json(result);
      
    } catch (error) {
      res.status(501).json(error);
    }
  },
  
  //BUSCAR UM USUÁRIO PELO ID
  //-----------------------------------
  user: async (req, res, next) => {
    try {
      
      let user = new User();
      user.id = req.params.id;
      let result = await userDao.getUser(user);
      res.status(200).json(result);
      
    } catch (error) {
      
      console.log(error);
      res.status(501).json(error);
      
    }
  },
  
  //BUSCAR UM USUÁRIO PELO NOME
  //-----------------------------------
  find: async (req, res, next) => {
    try {
      
      let user = new User();
      user.name = req.params.name;
      let result = await userDao.find(user);
      res.status(200).json(result);
      
    } catch (error) {
      res.status(501).json(error);
    }
  },

  //REALIZAR LOGIN
  //-----------------------------------
  login: async (req, res, next) => {
    try {
      
      let credential = await Auth.decodeCredentials(req, res, next);
      if (!credential) {
        res.status(401).json({ error: { message: 'Credencial inválida' } });
      }

      let user = new User(credential.email, credential.password);
      let foundUser = await userDao.findToLogin(user);
      //Verificar se foi encontrado um usuário
      if (foundUser[0] == '' && foundUser[0] == null) {
        res.status(401).json({ error:{message:'Email ou Senha inválido'} });
      } else if (foundUser[0].Password != undefined) {
        let matchPass = bcrypt.compareSync(user.password, foundUser[0].Password);
        if (!matchPass) {
          res.status(401).json({ error: { message: 'Email ou Senha inválido' } });
        } else {
          let data = foundUser[0];
          data.Password = undefined;
          let token = await Auth.signToken({ data });
          res.status(200).json({ data, token });
        }
      } else {
        res.status(401).json({ error: { message: 'Email ou Senha inválido' } });
      }
    } catch (error) {
      res.status(401).json({ error });
    }
  }
  
};