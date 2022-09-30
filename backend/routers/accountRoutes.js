import express from "express";
import { AccountController } from "../controllers/accountController.js"; 

const router = express.Router()

router.route('/')
    .get(AccountController.getAllAccounts)
    .post(AccountController.createAccount)

router.route('/:id')
    .get(AccountController.getOneAccount)
    .put(AccountController.updateOneAccount)
    .delete(AccountController.deleteOneAccount)


export const accountRoutes = router