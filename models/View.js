const ViewModel = require("../schema/view.model");
const MemberModel = require("../schema/member.model");
const ProductModel = require("../schema/product.model");

class View {
    constructor(mb_id) {
        this.viewModel = ViewModel;
        this.memberModel = MemberModel;
        this.productModel = ProductModel;
        this.mb_id = mb_id;
    };

    async validateChosenTarget(view_ref_id, group_type) {
        try {
            let result;
            switch (group_type) { //switch argumenti group_type orqali kerakli kollekshinlardan izlaymiz.
                case "member":  // faqat memberlarni tomosha qilayotganimz un member quyamiz.
                    result = await this.memberModel  //memberSchema modelni chaqirayopmiz.
                        .findById({  //member_schema modelidan findById metodi orqali Id va mb_status ACTIVE holatda bulishi kerak.
                            _id: view_ref_id,
                            mb_status: "ACTIVE",
                        })
                        .exec();
                    break;     //result mavjud yoki  yuqligini qaytarishi kerak.

                //product uchun case ochyabmiz

                case "product":
                    result = await this.productModel  // this.productModel mongodb ni mongoose ni spesific objecti u orqali findOne static metodi dan foydalanib data retive qilyabmiz
                        // product_schema modelni chaqiryabmiz
                        .findById({   //product_schema modelidan findOne metodi orqali Id va mb_status find qilyabmiz
                            _id: view_ref_id,
                            mb_status: "PROCESS",
                        })
                        .exec();
                    break;
            }
            return !!result; // true va falesni qiymatini qaytaradigan syntax, resultni qiymatini tekshiradi.

        } catch (err) {
            throw err;
        }
    };

    async insertMemberView(view_ref_id, group_type) {
        try {
            const new_view = new this.viewModel({
                mb_id: this.mb_id,
                view_ref_id: view_ref_id,
                view_group: group_type,
            });
            const result = await new_view.save();

            // target items view sonini bittaga oshiramiz
            await this.modifyItemViewCounts(view_ref_id, group_type);
            return result;
        } catch (err) {
            throw err;
        }
    };

    async modifyItemViewCounts(view_ref_id, group_type) {
        try {
            switch (group_type) {
                case "member":
                    await this.memberModel
                        .findByIdAndUpdate(
                            {
                                _id: view_ref_id,
                            },
                            {$inc: {mb_views: 1}}
                        )
                        .exec();
                    break;
                case "product":
                    await this.productModel
                        .findByIdAndUpdate(
                            {
                                _id: view_ref_id,
                            },
                            {$inc: {product_views: 1}}
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
        try {
            const view = await this.viewModel
                .findOne({
                    mb_id: this.mb_id,
                    view_ref_id: view_ref_id,
                })
                .exec();
            return view ? true : false;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = View;