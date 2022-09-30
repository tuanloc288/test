import express from "express";
import { ProductController } from '../controllers/productController.js'

const router = express.Router()

router.route('/')
    .get(ProductController.getAllProducts)
    .post(ProductController.createProduct)

router.route('/:id')
    .get(ProductController.getOneProduct)
    .put(ProductController.updateOneProduct)
    .delete(ProductController.deleteOneProduct)

export const productRoutes = router