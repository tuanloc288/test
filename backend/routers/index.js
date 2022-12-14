import cors from "cors";
import express from "express";
import { productRoutes } from "./productRoutes.js";
import { cartRoutes } from "./cartRoutes.js";
import { accountRoutes } from "./accountRoutes.js";
import { billRoutes } from "./billRoutes.js";
import { cartDetailRoutes } from './cartDetailRoutes.js'
import { discountOnCategoryRoutes } from "./discountOnCategoryRoutes.js";
import { privilegedRoutes } from "./privilegedRoutes.js";

const index = express()

index.use(express.urlencoded({ extended: true }));
index.use(express.json());
index.use(cors());

index.use("/product", productRoutes);
index.use("/cart", cartRoutes);
index.use("/account", accountRoutes);
index.use("/bill", billRoutes);
index.use("/cartDetail", cartDetailRoutes);
index.use("/privileged", privilegedRoutes);
index.use("/discountOnCategory", discountOnCategoryRoutes)

export const allRoutes = index
