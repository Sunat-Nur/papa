const Product = require("../models/Product");
const assert = require("assert");  //ma'lum bir shartni tekshirish va dasturni to'xtatish un ishlatiladigan method.
const Definer = require("../lib/mistake");  //Definer odatda obyekt yaratish va unga qiymatlar qo'shishda yoki obyektdan qiymatlarni o'chirishda ishlatiladi

const productController = module.exports;

productController.getAllProducts = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("POST: cont/getAllProducts");
        const product = new Product();
        const result = await product.getAllProductsData(req.member, req.body);
        res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR: cont/getAllProducts, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}

 // getChosenProduct methodini iwlatyabmiz
productController.getChosenProduct = async (req, res) => { // request ni ichida member borligini bilyabmiz
    try {
        console.log("GET: cont/getChosenProduct");

        //req.params.id ni o'zgarmas id qilib olyabmiz ( qayta nomlayabmiz )
        const id = req.params.id; // bu yerdagi id router /product/: id dan kelyabdi, id iga ixtiyori nom bersa boladi
        const product = new Product(); // product service modeldan instance  olib product object yasayabmiz


        // bu yerda product.service modelni  getChosenData degan method tidan data ni requst qilib olamiz, va bu yerga kelgan datani   resultdan q
        const result =  await product.getChosenProductData(req.member, id);// request ni ichidagi req.memberni birinchi argument sifatida path qilyabmiz
        // ikkinchi argumentga paramdan oligan qiymatni ya'ni id ni path qilyabmiz


        res.json({ state: "success", data: result }); // tepada resuldan qabul qilgan datani bu eyrda result ga yuboryabdi
    } catch (err) {
        console.log(`ERROR: cont/getChosenProduct, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
}


/**********************************
 *         BSSR RELATED ROUTER      *
 **********************************/

productController.addNewProduct = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("POST: cont/addNewProduct");
        assert(req.files, Definer.general_err3);           // fayl yuklanishida xatolik bulsa, xatoni chiqarib beradi.

        const product = new Product();            //  Product service classi asosida product hosil qilib olayopmiz.
        let data = req.body;                               // req.body sidan kelayotgan malumotlarni data yozayopmiz.

        data.product_images = req.files.map((ele) => {    // req filedan olgan malumotlarni map qilgan holatda, pathni qaytarib yuboramiz.
            return ele.path;                              //pathni qaytarib olib, maqsad databasega yozmoqchiman
        });                                                  // malumot yuklangandan  keyin req.body() bn kelmaydi, req.files bn keladi.

        const result = await product.addNewProductData(data, req.member);  // req.member bu validateAuthRestaurant ichidagi yuklab berilgan malumot
        assert.ok(result, Definer.product_err1);

        const html = `<script>
                              alert('new product added successfully');
                              window.location.replace('/resto/products/menu');
                              </script>`;
        res.end(html);
    } catch (err) {
        console.log(`ERROR: cont/addNewProduct, ${err.message}`);

    }
};

productController.updateChosenProduct = async (req, res) => {       // hamma productlarni oladigam method.
    try {
        console.log("POST: cont/updateChosenProduct");
        const product = new Product();                     //product service modeldan inctanse olyabdi
        const id = req.params.id;                         // params.id id ga tenglayabmiz ( qayta nomlash)
        const result = await product.updateChosenProductData(
            id,
            req.body,
            req.member._id
        );
        await res.json({state: "success", data: result});
    } catch (err) {
        console.log(`ERROR: cont/updateChosenProduct, ${err.message}`);
        res.json({state: "fail", message: err.message});
    }
};


