const { Review } = require("../models");

module.exports = {
  getTen: async (req, res, next) => {
    try {
      const firstTen = await Review.find({ service: req.params.id })
        .populate([{ path: "user", select: "userName" }])
        .limit(5)
        .lean({ virtuals: true });

      return res.send(firstTen);
    } catch (error) {
      next(error);
    }
  },
};
