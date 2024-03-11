const ViewModel = require("../schema/view.model");
const MemberModel = require("../schema/member.model");
const ProductModel = require("../schema/product.model");
const BoArticleModel = require("../schema/bo_article.model");

class View {
    constructor(mb_id) {
        this.viewModel = ViewModel;  // bular schema model hisoblanadi
        this.memberModel = MemberModel; // bular schema model hisoblanadi
        this.productModel = ProductModel; // bular schema model hisoblanadi
        this.boArticleModel = BoArticleModel;
        this.mb_id = mb_id;
    };

    async validateChosenTarget(view_ref_id, group_type) { // validateChosenTarget methodini yaratib view_ref_id va group_type larni argument sifatida path qilyabmiz
        try {
            let result; // result object yasayabmiz qiymat berilmagan

            switch (group_type) { //switch  group_type argumenti orqali kerakli ma'lumotlarni kollekshinlardan izlaymiz.

                case "member":  // faqat memberlarni tomosha qilayotganimz un member quyamiz.

                    result = await this.memberModel  //memberSchema modelni to'gridan to'gri chaqirib
                        .findOne({  //member_schema modelidan findById metodi orqali Id va mb_status db ni izlayabmiz va yuqoridagi result objectga datani yuklayabmiz
                            _id: view_ref_id,
                            mb_status: "ACTIVE",
                        })
                        .exec();
                    break;     //result mavjud yoki  yuqligini qaytarishi kerak.

                //product uchun case ochyabmiz

                case "product":
                    result = await this.productModel  // this.productModel mongodb ni mongoose ni spesific objecti u orqali findById static metodi dan foydalanib data retive qilyabmn
                        // product_schema modelni chaqiryabmiz
                        .findOne({   //product_schema modelidan findById metodi orqali Id va mb_status find qilyabman
                            _id: view_ref_id,
                            product_status: "PROCESS",
                        })
                        .exec();
                    break;

                case "community":  // faqat communitylarni ichidagi articlelarni  tomosha qilayotganimz un community_service modelni  quyamiz.
                    result = await this.boArticleModel  //memberSchema modelni to'gridan to'gri chaqirib
                        .findOne({  // community_schema modelidan findById metodi orqali Id va article_status db ni izlayabmiz va yuqoridagi result objectga datani yuklayabmiz
                            _id: view_ref_id,
                            art_status: "active",
                        })
                        .exec();
                    break;     //result mavjud yoki  yuqligini qaytarishi kerak.

            }
            return !!result; // true va falesni qiymatini qaytaradigan syntax, result objectni qiymatini tekshiradi.
        } catch (err) {
            throw err;
        }
    };

    async insertMemberView(view_ref_id, group_type) {  //insertMemberView method yaratilib  view_ref_id va group_type argument sifatida path qilinyabdi
        try {
            const new_view = new this.viewModel({ // this.view_schemaModeldan yangi (new_view) datani hosil qilyabmiz
                mb_id: this.mb_id,  // bular mongodb objectid,  string emas shuning un tog togri provide qilinyabdi
                view_ref_id: view_ref_id, // bular mongodb object id,  string emas shuning un tog togri provide qilinyabdi
                view_group: group_type, // bular mongodb object id,  string emas shuning un tog togri provide qilinyabdi
            });
            const result = await new_view.save(); // new_view datani save methodini ishlatib result objectga yuklayabmiz

            // target items view sonini bittaga oshiramiz
            await this.modifyItemViewCounts(view_ref_id, group_type);
            return result; // va kelgan datani resultni return qilyabmiz
        } catch (err) {
            throw err;
        }
    };

    // 3 ta terget uchun ishlatiladigan mantiq
    async modifyItemViewCounts(view_ref_id, group_type) { //modifyItemViewCounts method yaratib unga view_ref_id va group_type argument sifatida path qilyabman
        try {
            switch (group_type) {  //switch  group_type argumenti orqali kerakli ma'lumotlarni kollekshinlardan izlayabman.
                case "member":  // faqat memberlarni tomosha qilayotganimz un member quyabman
                    await this.memberModel // this.memberModel mongodb ni mongoose ni spesific objecti,  u orqali findByIdAndUpdate static metodi dan foydalanib data retive qilyabmn
                        .findByIdAndUpdate(   // this.member_schema modelidan findByIdAndUpdate metodi dan foydalanyabmn
                            {
                                _id: view_ref_id, // method orqali  view_ref_id ga teng idini topib
                            },
                            {$inc: {mb_views: 1}} // views qiymatini bittaga ko'paytirib boradi
                        )
                        .exec();
                    break;
                case "product": // faqat product tomosha ko'rayotganim un product quyabman
                    await this.productModel // this.memberModel mongodb ni mongoose ni spesific objecti,  u orqali findByIdAndUpdate static metodi dan foydalanib data retive qilyabmn
                        .findByIdAndUpdate(   // this.product_schema modelidan findByIdAndUpdate metodi dan foydalanyabmn
                            {
                                _id: view_ref_id, //o method rqali  view_ref_id ga teng idini topib
                            },
                            {$inc: {product_views: 1}} // views accountini bittaga ko'paytirib boradi
                        )
                        .exec();
                    break;

                case "community":  // faqat memberlarni tomosha qilayotganimz un member quyabman
                    await this.boArticleModel // this.boArticleModel mongodb ni mongoose ni spesific objecti,  u orqali findByIdAndUpdate static metodi dan foydalanib data retive qilyabmn
                        .findByIdAndUpdate(   // this.member_schema modelidan findByIdAndUpdate metodi dan foydalanyabmn
                            {
                                _id: view_ref_id, // method orqali  view_ref_id ga teng idini topib
                            },
                            {$inc: {art_views: 1}} // views qiymatini bittaga ko'paytirib boradi
                        )
                        .exec();
                    break;
            }
            return true;
        } catch (err) {
            throw err;
        }
    };

    async checkViewExistance(view_ref_id) {
        { //checkViewExistance method yaratib unga view_ref_id  argument sifatida path qilyabman
            try {
                const view = await this.viewModel // this.view_schemaModeldan yangi (view) datani hosil qilyabmiz
                    .findOne({ // this.view_schema modelidan findOne static metodi  dan foydalanyabmn
                        mb_id: this.mb_id,  // mb_id teng bolsin berilgan mb_id ga  va
                        view_ref_id: view_ref_id,  // view_ref_id  teng boldin view_ref_id ga deb shart kirityabman
                        //  view_ref_id ni yuqoridagi mb_id ko'rganmi deb tekshiryabman
                    })
                    .exec();
                return view ? true : false;
            } catch (err) {
                throw err;
            }
        }
    };
}

module.exports = View;