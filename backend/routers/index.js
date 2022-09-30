import cors from "cors";
import express from "express";
import { productRoutes } from "./productRoutes.js";
import { cartRoutes } from "./cartRoutes.js";
import { accountRoutes } from "./accountRoutes.js";
import { discountOnCategoryRoutes } from "./discountOnCategoryRoutes.js";

const index = express()

index.use(express.urlencoded({ extended: true }));
index.use(express.json());
index.use(cors());

index.use("/product", productRoutes);
index.use("/cart", cartRoutes);
index.use("/account", accountRoutes);
index.use("/discountOnCategory", discountOnCategoryRoutes)

export const allRoutes = index
