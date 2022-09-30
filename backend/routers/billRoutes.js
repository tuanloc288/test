import express from "express";
import { BillController } from "../controllers/billController.js"; 

const router = express.Router()

router.route('/')
    .get(BillController.getAllBills)
    .post(BillController.createBill)

router.route('/:id')
    .get(BillController.getOneBill)
    .put(BillController.updateOneBill)
    .delete(BillController.deleteOneBill)


export const billRoutes = router