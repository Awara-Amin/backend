import express from "express";
import Category from "../models/categoryModel.js";
import expressAsyncHandler from "express-async-handler";
import { isAuth, isAdmin } from "../utils.js";

const categoryRouter = express.Router();

categoryRouter.get("/", async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
});

categoryRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log("data-glasgow-3");
    const newCategory = new Category({
      name: "sample name " + Date.now(),
      slug: "sample-name-" + Date.now(),
      image: "/images/p1.jpg",
      description: "sample description",
    });
    console.log("data-glasgow-5");
    const category = await newCategory.save();
    res.send({ message: "Category Created", category });
  })
);

categoryRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (category) {
      category.name = req.body.name;
      // category.slug = req.body.slug;
      category.image = req.body.image;
      category.description = req.body.description;
      await category.save();
      res.send({ message: "Category Updated" });
    } else {
      res.status(404).send({ message: "Category Not Found" });
    }
  })
);

categoryRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.remove();
      res.send({ message: "Category Deleted" });
    } else {
      res.status(404).send({ message: "Category Not Found" });
    }
  })
);

// categoryRouter.post(
//   "/:id/reviews",
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const categoryId = req.params.id;
//     const category = await Category.findById(categoryId);
//     if (category) {
//       if (category.reviews.find((x) => x.name === req.user.name)) {
//         return res
//           .status(400)
//           .send({ message: "You already submitted a review" });
//       }

//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         comment: req.body.comment,
//       };
//       category.reviews.push(review);
//       category.numReviews = category.reviews.length;
//       category.rating =
//         category.reviews.reduce((a, c) => c.rating + a, 0) /
//         category.reviews.length;
//       const updatedProduct = await category.save();
//       res.status(201).send({
//         message: "Review Created",
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: category.numReviews,
//         rating: category.rating,
//       });
//     } else {
//       res.status(404).send({ message: "Category Not Found" });
//     }
//   })
// );

categoryRouter.get(
  "/",

  expressAsyncHandler(async (req, res) => {
    const page_Size = 4;
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || page_Size;

    const categories = await Category.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Category.countDocuments();
    res.send({
      categories,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

const PAGE_SIZE = 6;

categoryRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const categories = await Category.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Category.countDocuments();
    res.send({
      categories,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// categoryRouter.get(
//   "/search",
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const pageSize = query.pageSize || PAGE_SIZE;
//     const page = query.page || 1;
//     const category = query.category || "";
//     const price = query.price || "";
//     const rating = query.rating || "";
//     const order = query.order || "";
//     const searchQuery = query.query || "";

//     const queryFilter =
//       searchQuery && searchQuery !== "all"
//         ? {
//             name: {
//               $regex: searchQuery,
//               $options: "i",
//             },
//           }
//         : {};
//     const categoryFilter = category && category !== "all" ? { category } : {};
//     const ratingFilter =
//       rating && rating !== "all"
//         ? {
//             rating: {
//               $gte: Number(rating),
//             },
//           }
//         : {};
//     const priceFilter =
//       price && price !== "all"
//         ? {
//             // 1-50
//             price: {
//               $gte: Number(price.split("-")[0]),
//               $lte: Number(price.split("-")[1]),
//             },
//           }
//         : {};
//     const sortOrder =
//       order === "featured"
//         ? { featured: -1 }
//         : order === "lowest"
//         ? { price: 1 }
//         : order === "highest"
//         ? { price: -1 }
//         : order === "toprated"
//         ? { rating: -1 }
//         : order === "newest"
//         ? { createdAt: -1 }
//         : { _id: -1 };

//     const categories = await Category.find({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     })
//       .sort(sortOrder)
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);

//     const countProducts = await Product.countDocuments({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...ratingFilter,
//     });
//     res.send({
//       categories,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

categoryRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Category.find().distinct("category");
    res.send(categories);
  })
);

// categoryRouter.get("/slug/:slug", async (req, res) => {
//   const category = await Category.findOne({ slug: req.params.slug });
//   if (category) {
//     res.send(category);
//   } else {
//     res.status(404).send({ message: "Category Not Found" });
//   }
// });
categoryRouter.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.send(category);
  } else {
    res.status(404).send({ message: "Category Not Found" });
  }
});

export default categoryRouter;
