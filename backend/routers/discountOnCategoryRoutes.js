import express from "express";
import { DiscountOnCategoryController } from "../controllers/discountOnCategoryController.js"; 

const router = express.Router()

router.route('/')
    .get(DiscountOnCategoryController.getAllDiscountOnCategory)
    .post(DiscountOnCategoryController.createDiscountOnCategory)
    .put(DiscountOnCategoryController.updateDestroy)

router.route('/:id')
    .put(DiscountOnCategoryController.updateOneDiscountOnCategory)
    .delete(DiscountOnCategoryController.deleteOneDiscountOnCategory)


export const discountOnCategoryRoutes = router