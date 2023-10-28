

const Product = require("../models/Product");
const assert = require("assert");  //ma'lum bir shartni tekshirish va dasturni to'xtatish un ishlatiladigan method.
const Definer = require("../lib/mistake");  //Definer odatda obyekt yaratish va unga qiymatlar qo'shishda yoki obyektdan qiymatlarni o'chirishda ishlatiladi

let productController = module.exports;

productController.getAllProducts = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("GET: cont/getAllProducts");
    } catch(err) {
        console.log(`ERROR: cont/getAllProducts, ${err.message}`);
        res.json({ state: "fail", message: err.message });
    }
};

productController.addNewProduct = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("POST: cont/addNewProduct");
        assert(req.files, Definer.general_err3);           // fayl yuklanishida xatolik bulsa, xatoni chiqarib beradi.

        const product = new Product();            //  Product service classi asosida product hosil qilib olayopmiz.
        // new Product qiymat olmaydi sababi qiymatni Product.js ichidan emas, tashqaridan olayopti.
        let data = req.body;                               // req.body sidan kelayotgan malumotlarni data yozayopmiz.

        data.product_images = req.files.map((ele) => {    // req filedan olgan malumotlarni map qilgan holatda, pathni qaytarib yuboramiz.
            return ele.path;                              //pathni qaytarib olib, maqsad databasega yozmoqchiman
        });                                                  // malumot yuklangandan  keyin req.body() bn kelmaydi, req.files bn keladi.

        const result = await product.addNewProductData(data, req.member);  // req.member bu validateAuthRestaurant ichidagi yuklab berilgan malumot
        // agarda result mavjud bulmasa bizga definer bersin.
        //async function bulsa (await) yozamiz.
        res.send("ok");

        // const html = `<script>
        //                       alert(new dish added successfully);
        //                       window.location.replace('/resto/products/menu');
        //                       </script>`;
        // res.end(html);


    } catch(err) {
        console.log(`ERROR: cont/addNewProduct, ${err.message}`);

    }
};

productController.updateChosenProduct = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("POST: cont/updateChosenProduct");
        const product = new Product();                     //product objectini hosil qildik
        const id = req.params.id;                         //product ID sini paramsni ichidan olayopmiz.
        const result = await product.updateChosenProductData(
            id,
            req.body,
            req.member._id
        );
        await res.json({state: "success",data: result});
    } catch(err) {
        console.log(`ERROR: cont/updateChosenProduct, ${err.message}`);
        res.json({ state: "fail", message: err.message });
    }
};