const { Schema, model } = require("mongoose");
const Review = require("./review.model");

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio"],
    },
    description: {
      type: String,
      required: [true, "Una descripción del servicio es obligatoria"],
    },
    price: {
      type: Number,
      required: [true, "Debes poner un precio en el servicio"],
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "Debe ser creado por alguien"],
      ref: "User",
    },
    state: { type: Boolean, default: true },
    tags: {
      type: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
      default: [],
    },
    img: { type: String },
  },
  { versionKey: false }
);

serviceSchema.method("getRate", function (cb) {
  Review.distinct("rate", { service: this._id });
});

serviceSchema.virtual("rate").get(function () {
  const rates = Review.distinct("rate", { service: this._id });
  return rates.reduce((total, rate) => (total += rate), 0) / rates.length;
});

module.exports = model("Service", serviceSchema);
